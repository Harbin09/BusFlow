const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const seedDir = path.join(__dirname, 'prisma', 'seed-data');

function readCsv(filename) {
  try {
    const fileContent = fs.readFileSync(path.join(seedDir, filename), 'utf-8');
    return parse(fileContent, { columns: true, skip_empty_lines: true });
  } catch (e) {
    console.error(`Error reading ${filename}: ${e.message}`);
    return [];
  }
}

const buses = readCsv('buses.csv');
const drivers = readCsv('drivers.csv');
const routes = readCsv('routes.csv');
const stops = readCsv('stops.csv');
const students = readCsv('students.csv');
const timetables = readCsv('timetable.csv');
const dailyStatus = readCsv('student_daily_status.csv');

const report = {
  counts: {
    buses: buses.length,
    drivers: drivers.length,
    routes: routes.length,
    stops: stops.length,
    students: students.length,
    timetables: timetables.length,
    dailyStatus: dailyStatus.length,
  },
  foreignKeyErrors: [],
  capacityIssues: [],
  duplicateIds: [],
  driverOverlaps: [],
  busOverlaps: [],
  unmappedStudents: [],
  stopsWithoutRoutes: []
};

// Check IDs
const checkDuplicates = (data, idField, entityName) => {
  const ids = new Set();
  data.forEach(row => {
    if (ids.has(row[idField])) {
      report.duplicateIds.push(`${entityName}: ${row[idField]}`);
    }
    ids.add(row[idField]);
  });
};

checkDuplicates(buses, 'bus_id', 'Bus');
checkDuplicates(drivers, 'driver_id', 'Driver');
checkDuplicates(routes, 'route_id', 'Route');
checkDuplicates(stops, 'stop_id', 'Stop');
checkDuplicates(students, 'student_id', 'Student');
checkDuplicates(timetables, 'timetable_id', 'Timetable');

// Foreign Key Checks
const routeIds = new Set(routes.map(r => r.route_id));
const busIds = new Set(buses.map(b => b.bus_id));
const driverIds = new Set(drivers.map(d => d.driver_id));
const stopIds = new Set(stops.map(s => s.stop_id));
const stopNamesPerRoute = new Map();

stops.forEach(s => {
  if (!routeIds.has(s.route_id)) {
    report.foreignKeyErrors.push(`Stop ${s.stop_id} references missing route ${s.route_id}`);
    report.stopsWithoutRoutes.push(s.stop_id);
  } else {
    if (!stopNamesPerRoute.has(s.route_id)) {
      stopNamesPerRoute.set(s.route_id, new Set());
    }
    stopNamesPerRoute.get(s.route_id).add(s.name);
  }
});

students.forEach(s => {
  if (s.route_id && !routeIds.has(s.route_id)) {
    report.foreignKeyErrors.push(`Student ${s.student_id} references missing route ${s.route_id}`);
  } else if (!s.route_id) {
    report.unmappedStudents.push(s.student_id);
  }
  
  if (s.route_id && s.pickup_stop) {
    const routeStops = stopNamesPerRoute.get(s.route_id);
    if (!routeStops || !routeStops.has(s.pickup_stop)) {
      report.foreignKeyErrors.push(`Student ${s.student_id} references missing stop ${s.pickup_stop} on route ${s.route_id}`);
    }
  } else if (!s.pickup_stop) {
    report.unmappedStudents.push(`No pickup stop for ${s.student_id}`);
  }
});

timetables.forEach(t => {
  if (!routeIds.has(t.route_id)) {
    report.foreignKeyErrors.push(`Timetable ${t.timetable_id} references missing route ${t.route_id}`);
  }
});

dailyStatus.forEach(d => {
  // student ID exists?
  const sExists = students.find(s => s.student_id === d.student_id);
  if (!sExists) {
    report.foreignKeyErrors.push(`DailyStatus references missing student ${d.student_id}`);
  }
});

// Capacity checks
const routeStudentCounts = {};
students.forEach(s => {
  if (s.route_id) {
    routeStudentCounts[s.route_id] = (routeStudentCounts[s.route_id] || 0) + 1;
  }
});

// Calculate total capacity available
const totalCapacity = buses.reduce((acc, b) => acc + parseInt(b.capacity || 0, 10), 0);
const maxBusCapacity = Math.max(...buses.map(b => parseInt(b.capacity || 0, 10)));

Object.keys(routeStudentCounts).forEach(rId => {
  if (routeStudentCounts[rId] > maxBusCapacity) {
    report.capacityIssues.push(`Route ${rId} has ${routeStudentCounts[rId]} students but largest bus holds ${maxBusCapacity}`);
  }
});

// Print report
console.log(JSON.stringify(report, null, 2));
