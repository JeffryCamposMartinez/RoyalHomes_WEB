const mysql = require('mysql2/promise');

async function checkDB() {
  const connection = await mysql.createConnection({
    host: '185.173.110.158',
    user: 'root',
    password: '63vdVWnhIpi4RHVsDIuHBYfZmnNNHfV3Wg4qApQZmkBbZJSRAonaNeFX1NVTcEoZ',
    database: 'AgencyBilling_db',
    port: 3306
  });

  try {
    const [invoices] = await connection.execute('SELECT * FROM invoices WHERE month_year = "2026-08"');
    console.log('Invoices:', invoices);

    const [payments] = await connection.execute('SELECT * FROM payments WHERE invoice_id = ?', [invoices[0].id]);
    console.log('Payments:', payments);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

checkDB();
