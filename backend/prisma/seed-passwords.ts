import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:Divi@1998@localhost:5432/busflow?schema=public';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Seed demo passwords for testing
 *
 * Demo Student Accounts:
 * - Email: CTU1001@busflow.com, Password: demo-password
 * - Email: CTU1002@busflow.com, Password: demo-password
 * - Email: CTU1300@busflow.com, Password: demo-password
 *
 * Demo Driver Accounts:
 * - Email: DRV-001@busflow.com, Password: demo-password
 * - Email: DRV-002@busflow.com, Password: demo-password
 * - Email: DRV-007@busflow.com, Password: demo-password
 */
async function seedPasswords() {
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
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      await prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      });
      console.log(`✓ Updated password for ${email}`);
    } else {
      console.log(`⚠ User not found: ${email}`);
    }
  }

  console.log('');
  console.log('Demo Credentials Set:');
  console.log('Password: demo-password');
  console.log('');
  console.log('Student Accounts:');
  studentEmails.forEach(email => console.log(`  - ${email}`));
  console.log('');
  console.log('Driver Accounts:');
  driverEmails.forEach(email => console.log(`  - ${email}`));
}

seedPasswords()
  .catch((e) => {
    console.error('Error seeding passwords:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
