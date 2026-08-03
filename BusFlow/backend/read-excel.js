const xlsx = require('xlsx');
const path = require('path');
const file = path.join(__dirname, 'prisma', 'seed-data', 'Static_Student_Bus_Master_300.xlsx');
const workbook = xlsx.readFile(file);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
console.log('Headers:', data[0]);
console.log('Row 1:', data[1]);
