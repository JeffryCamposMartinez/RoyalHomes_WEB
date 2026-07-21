const mysql = require('mysql2/promise');

async function testJit() {
  const connection = await mysql.createConnection({
    host: '185.173.110.158',
    user: 'root',
    password: '63vdVWnhIpi4RHVsDIuHBYfZmnNNHfV3Wg4qApQZmkBbZJSRAonaNeFX1NVTcEoZ',
    database: 'AgencyBilling_db',
    port: 3306
  });

  try {
    const [cols] = await connection.execute('DESCRIBE subscriptions');
    console.log(cols);
    const [subs] = await connection.execute('SELECT * FROM subscriptions');
    console.log(subs);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

testJit();
