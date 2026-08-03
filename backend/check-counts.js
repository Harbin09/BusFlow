const xlsx = require('xlsx');
const path = require('path');
const file = path.join(__dirname, 'prisma', 'seed-data', 'Static_Student_Bus_Master_300.xlsx');
const workbook = xlsx.readFile(file);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet);

const busCounts = {};
const driverCounts = {};
data.forEach(row => {
  const bus = row['Default Bus Number'];
  const driver = row['Driver Name'];
  if (bus) {
    busCounts[bus] = (busCounts[bus] || 0) + 1;
  }
  if (driver) {
    driverCounts[driver] = (driverCounts[driver] || 0) + 1;
  }
});

console.log('Bus Counts:', busCounts);
console.log('Driver Counts:', driverCounts);
