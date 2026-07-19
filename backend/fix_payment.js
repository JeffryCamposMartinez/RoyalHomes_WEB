const mysql = require('mysql2/promise');

async function fixPayment() {
  const connection = await mysql.createConnection({
    host: '185.173.110.158',
    user: 'root',
    password: '63vdVWnhIpi4RHVsDIuHBYfZmnNNHfV3Wg4qApQZmkBbZJSRAonaNeFX1NVTcEoZ',
    database: 'AgencyBilling_db',
    port: 3306
  });

  try {
    const [invoices] = await connection.execute('SELECT id, amount FROM invoices WHERE month_year = "2026-08"');
    if (invoices.length > 0) {
      const invId = invoices[0].id;
      const amount = invoices[0].amount;
      
      const [existing] = await connection.execute('SELECT id FROM payments WHERE invoice_id = ?', [invId]);
      if (existing.length === 0) {
        await connection.execute(
          'INSERT INTO payments (invoice_id, amount, payment_method, transaction_id, status) VALUES (?, ?, ?, ?, ?)',
          [invId, amount, 'mercado_pago', 'MP-169601616008', 'completed']
        );
        console.log('Payment inserted!');
      } else {
        console.log('Payment already exists.');
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

fixPayment();
