import 'dotenv/config';
import { PrismaClient, UserRole, BusStatus, StudentDailyStatusType, TimetableType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse/sync';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function readCsv(filename: string) {
  const filePath = path.join(__dirname, 'seed-data', filename);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return parse(fileContent, { columns: true, skip_empty_lines: true });
}

async function main() {
  console.log('Seeding Database...');

  // 1. Roles / Users / Drivers
  console.log('Seeding Drivers...');
  const driversCsv = readCsv('drivers.csv');
  for (const row of driversCsv as any[]) {
    const user = await prisma.user.upsert({
      where: { email: `${row.driver_id}@busflow.com` },
      update: {},
      create: {
        email: `${row.driver_id}@busflow.com`,
        name: row.name,
        role: UserRole.DRIVER,
      },
    });

    await prisma.driver.upsert({
      where: { licenseNo: row.license_number },
      update: {
        phone: row.phone,
      },
      create: {
        id: row.driver_id,
        userId: user.id,
        licenseNo: row.license_number,
        phone: row.phone,
      },
    });
  }

  // 2. Buses
  console.log('Seeding Buses...');
  const busesCsv = readCsv('buses.csv');
  for (const row of busesCsv as any[]) {
    await prisma.bus.upsert({
      where: { plateNumber: row.registration_number },
      update: {
        capacity: parseInt(row.capacity, 10),
        status: row.status as BusStatus,
      },
      create: {
        id: row.bus_id,
        plateNumber: row.registration_number,
        capacity: parseInt(row.capacity, 10),
        status: row.status as BusStatus,
      },
    });
  }

  // 3. Routes
  console.log('Seeding Routes...');
  const routesCsv = readCsv('routes.csv');
  for (const row of routesCsv as any[]) {
    const dist = parseFloat(row.estimated_distance.replace(' km', ''));
    const dur = parseInt(row.estimated_duration.replace(' min', ''), 10);
    
    await prisma.route.upsert({
      where: { name: row.name },
      update: {
        description: `${row.start_location} to ${row.end_location}`,
        estimatedDistance: dist,
        estimatedDuration: dur,
      },
      create: {
        id: row.route_id,
        name: row.name,
        description: `${row.start_location} to ${row.end_location}`,
        estimatedDistance: dist,
        estimatedDuration: dur,
      },
    });
  }

  // 4. Stops
  console.log('Seeding Stops...');
  const stopsCsv = readCsv('stops.csv');
  for (const row of stopsCsv as any[]) {
    await prisma.stop.upsert({
      where: { id: row.stop_id },
      update: {
        name: row.name,
        routeId: row.route_id,
        order: parseInt(row.sequence, 10),
      },
      create: {
        id: row.stop_id,
        name: row.name,
        latitude: 0,
        longitude: 0,
        routeId: row.route_id,
        order: parseInt(row.sequence, 10),
      },
    });
  }

  // 5. Students
  console.log('Seeding Students...');
  const studentsCsv = readCsv('students.csv');
  for (const row of studentsCsv as any[]) {
    const user = await prisma.user.upsert({
      where: { email: `${row.student_id}@busflow.com` },
      update: {},
      create: {
        email: `${row.student_id}@busflow.com`,
        name: row.name,
        role: UserRole.STUDENT,
      },
    });

    const stops = await prisma.stop.findMany({
      where: {
        name: row.pickup_stop,
        routeId: row.route_id
      }
    });
    const stop = stops.length > 0 ? stops[0] : null;

    await prisma.student.upsert({
      where: { studentNo: row.student_id },
      update: {
        program: row.program,
        semester: row.semester,
        routeId: row.route_id,
        pickupStopId: stop?.id || null,
      },
      create: {
        id: row.student_id,
        userId: user.id,
        studentNo: row.student_id,
        program: row.program,
        semester: row.semester,
        routeId: row.route_id,
        pickupStopId: stop?.id || null,
      }
    });
  }

  // 6. Timetable
  console.log('Seeding Timetable...');
  const ttCsv = readCsv('timetable.csv');
  for (const row of ttCsv as any[]) {
    const start = new Date(`${row.date}T${row.start_time}:00Z`);
    const end = new Date(`${row.date}T${row.end_time}:00Z`);
    const dDate = new Date(`${row.date}T00:00:00Z`);

    await prisma.timetable.upsert({
      where: { id: row.timetable_id },
      update: {
        type: row.type as TimetableType,
        date: dDate,
        startTime: start,
        endTime: end,
      },
      create: {
        id: row.timetable_id,
        routeId: row.route_id,
        type: row.type as TimetableType,
        date: dDate,
        startTime: start,
        endTime: end,
      }
    });
  }

  // 7. Student Daily Status
  console.log('Seeding Student Daily Status...');
  const statusCsv = readCsv('student_daily_status.csv');
  for (const row of statusCsv as any[]) {
    const dDate = new Date(`${row.date}T00:00:00Z`);
    const coming = row.coming_today === 'True';
    const statusVal = coming ? StudentDailyStatusType.PRESENT : StudentDailyStatusType.ABSENT; 

    await prisma.studentDailyStatus.upsert({
      where: {
        studentId_date: {
          studentId: row.student_id,
          date: dDate,
        }
      },
      update: {
        status: statusVal,
      },
      create: {
        studentId: row.student_id,
        date: dDate,
        status: statusVal,
      }
    });
  }

  // 8. Seed demo passwords for testing
  await seedDemoPasswords();

  console.log('Seeding completed.');
}

/**
 * Seed demo passwords for testing
 * All demo accounts use password: demo-password
 */
async function seedDemoPasswords() {
  console.log('Seeding demo passwords...');

  const demoPassword = 'demo-password';
  const hashedPassword = await bcrypt.hash(demoPassword, 10);

  // Demo student accounts
  const studentEmails = [
    'CTU1001@busflow.com',
    'CTU1002@busflow.com',
    'CTU1300@busflow.com',
  ];

  // Demo driver accounts
  const driverEmails = [
    'DRV-001@busflow.com',
    'DRV-002@busflow.com',
    'DRV-007@busflow.com',
  ];

  const allEmails = [...studentEmails, ...driverEmails];

  for (const email of allEmails) {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (user) {
        await prisma.user.update({
          where: { email },
          data: { password: hashedPassword },
        });
        console.log(`  ✓ Updated password for ${email}`);
      }
    } catch (error) {
      console.log(`  ⚠ Could not update ${email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  console.log(`Demo password set for all accounts: ${demoPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
