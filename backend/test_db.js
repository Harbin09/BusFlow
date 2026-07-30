const { Client } = require('pg');

const passwords = ['postgres', 'root', 'admin', 'password', '1234', '12345', '123456', ''];
const users = ['postgres', 'root', 'admin'];
const dbs = ['postgres', 'bus_flow'];

async function testCredentials() {
  for (const user of users) {
    for (const password of passwords) {
      for (const db of dbs) {
        const client = new Client({
          user,
          password,
          host: 'localhost',
          port: 5432,
          database: db,
        });

        try {
          await client.connect();
          console.log(`SUCCESS: postgresql://${user}:${password}@localhost:5432/${db}`);
          await client.end();
          return;
        } catch (err) {
          console.log(`Failed for ${user}:${password} - ${err.message}`);
        }
      }
    }
  }
  console.log('FAILED ALL');
}

testCredentials();
