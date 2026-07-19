const mysql = require('mysql2/promise');

async function updateInvoice() {
  const connection = await mysql.createConnection({
    host: '185.173.110.158',
    user: 'root',
    password: '63vdVWnhIpi4RHVsDIuHBYfZmnNNHfV3Wg4qApQZmkBbZJSRAonaNeFX1NVTcEoZ',
    database: 'AgencyBilling_db',
    port: 3306
  });

  await connection.execute('UPDATE invoices SET amount = 100 WHERE status = "pending" LIMIT 1');
  console.log('Invoice updated to 100 CLP');
  await connection.end();
}

updateInvoice().catch(console.error);
