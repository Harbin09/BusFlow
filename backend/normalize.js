const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const { stringify } = require('csv-stringify/sync');

const seedDir = path.join(__dirname, 'prisma', 'seed-data');
const masterFile = path.join(seedDir, 'Static_Student_Bus_Master_300.xlsx');
const dailyFile = path.join(seedDir, 'Daily_Student_Live_Status_300.csv');

// Read Master Excel
const workbook = xlsx.readFile(masterFile);
const sheetName = workbook.SheetNames[0];
const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

// Read Daily CSV (using simple split since we only need simple fields)
const dailyLines = fs.readFileSync(dailyFile, 'utf-8').trim().split('\n');
const dailyHeader = dailyLines[0].split(',');
const dailyData = dailyLines.slice(1).map(line => {
  const values = line.split(',');
  return {
    Date: values[0],
    'Student ID': values[1],
    'Coming Today?': values[2]
  };
});
// Get unique date from daily status, or fallback to current date
const targetDate = dailyData.length > 0 ? dailyData[0].Date : new Date().toISOString().split('T')[0];

const routesMap = new Map();
const stopsMap = new Map();
const busesMap = new Map();
const driversMap = new Map();
const students = [];

let routeIdCounter = 1;
let stopIdCounter = 1;
let driverIdCounter = 1;

data.forEach(row => {
  const city = row['Pickup City'] || 'Unknown City';
  const stopName = row['Default Pickup Stop'] || 'Unknown Stop';
  const busNo = row['Default Bus Number'];
  const capacity = row['Bus Capacity'] || 50;
  const driverName = row['Driver Name'] || 'Unknown Driver';
  const driverContact = row['Driver Contact'] || '0000000000';
  const studentId = row['Student ID'];
  const studentName = row['Student Name'];
  const program = row['Program'];
  const semester = row['Semester'];

  // Routes
  if (!routesMap.has(city)) {
    routesMap.set(city, {
      route_id: `RT-${String(routeIdCounter).padStart(3, '0')}`,
      name: `${city} Route`,
      start_location: city,
      end_location: 'Chitkara University',
      estimated_distance: `${Math.floor(Math.random() * 20) + 10} km`,
      estimated_duration: `${Math.floor(Math.random() * 30) + 20} min`,
    });
    routeIdCounter++;
  }
  const route = routesMap.get(city);

  // Stops
  const stopKey = `${city}_${stopName}`;
  if (!stopsMap.has(stopKey)) {
    stopsMap.set(stopKey, {
      stop_id: `STP-${String(stopIdCounter).padStart(3, '0')}`,
      name: stopName,
      route_id: route.route_id,
      sequence: stopsMap.size + 1,
    });
    stopIdCounter++;
  }

  // Buses
  if (busNo && !busesMap.has(busNo)) {
    busesMap.set(busNo, {
      bus_id: busNo,
      registration_number: `PB-01-${Math.floor(Math.random() * 9000) + 1000}`,
      capacity: capacity,
      status: 'ACTIVE'
    });
  }

  // Drivers
  if (driverName && !driversMap.has(driverName)) {
    const dId = `DRV-${String(driverIdCounter).padStart(3, '0')}`;
    driversMap.set(driverName, {
      driver_id: dId,
      name: driverName,
      license_number: `LIC${Math.floor(Math.random() * 900000) + 100000}`,
      phone: driverContact
    });
    driverIdCounter++;
  }

  // Students
  students.push({
    student_id: studentId,
    name: studentName,
    program: program,
    semester: semester,
    route_id: route.route_id,
    pickup_stop: stopName
  });
});

// Generate Timetables
const timetables = [];
let ttCounter = 1;
routesMap.forEach(r => {
  timetables.push({
    timetable_id: `TT-${String(ttCounter).padStart(3, '0')}`,
    route_id: r.route_id,
    date: targetDate,
    start_time: '07:30',
    end_time: '08:30',
    type: 'CLASS'
  });
  ttCounter++;
});

// Generate Daily Status
const statuses = [];
dailyData.forEach(d => {
  statuses.push({
    student_id: d['Student ID'],
    date: d.Date,
    coming_today: d['Coming Today?'] === 'YES' ? 'True' : 'False'
  });
});

// Convert Maps to Arrays
const routesArr = Array.from(routesMap.values());
const stopsArr = Array.from(stopsMap.values());
const busesArr = Array.from(busesMap.values());
const driversArr = Array.from(driversMap.values());

// Helper to write CSV
function writeCsv(filename, dataArr) {
  if (dataArr.length === 0) return;
  const content = stringify(dataArr, { header: true });
  fs.writeFileSync(path.join(seedDir, filename), content);
  console.log(`Created ${filename} with ${dataArr.length} records`);
}

writeCsv('routes.csv', routesArr);
writeCsv('stops.csv', stopsArr);
writeCsv('buses.csv', busesArr);
writeCsv('drivers.csv', driversArr);
writeCsv('students.csv', students);
writeCsv('timetable.csv', timetables);
writeCsv('student_daily_status.csv', statuses);

console.log('Normalization complete!');
