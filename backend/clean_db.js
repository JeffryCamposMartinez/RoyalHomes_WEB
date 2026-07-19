const mysql = require('mysql2/promise');

async function cleanDB() {
  const connection = await mysql.createConnection({
    host: '185.173.110.158',
    user: 'root',
    password: '63vdVWnhIpi4RHVsDIuHBYfZmnNNHfV3Wg4qApQZmkBbZJSRAonaNeFX1NVTcEoZ',
    database: 'AgencyBilling_db',
    port: 3306
  });

  await connection.execute('UPDATE invoices SET status = "paid" WHERE status = "pending" AND amount = 25000');
  
  console.log('Invoices cleaned! Only the 100 CLP one should be pending now.');
  await connection.end();
}

cleanDB().catch(console.error);
