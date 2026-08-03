const fs = require('fs');
const { execSync } = require('child_process');

const file = 'C:\\Program Files\\PostgreSQL\\18\\data\\pg_hba.conf';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/scram-sha-256/g, 'trust');
fs.writeFileSync(file, content);
console.log('Updated pg_hba.conf to trust');

try {
  execSync('"C:\\Program Files\\PostgreSQL\\18\\bin\\pg_ctl.exe" reload -D "C:\\Program Files\\PostgreSQL\\18\\data"');
  console.log('PostgreSQL reloaded successfully');
} catch (e) {
  console.log('Reload output:', e.message);
}
