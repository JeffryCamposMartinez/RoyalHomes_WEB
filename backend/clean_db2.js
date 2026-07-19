const mysql = require('mysql2/promise');

async function cleanDB() {
  const connection = await mysql.createConnection({
    host: '185.173.110.158',
    user: 'root',
    password: '63vdVWnhIpi4RHVsDIuHBYfZmnNNHfV3Wg4qApQZmkBbZJSRAonaNeFX1NVTcEoZ',
    database: 'AgencyBilling_db',
    port: 3306
  });

  try {
    // 1. Obtener IDs de las facturas de mayo y junio para borrar sus pagos
    const [oldInvoices] = await connection.execute('SELECT id FROM invoices WHERE month_year IN ("2026-05", "2026-06")');
    if (oldInvoices.length > 0) {
      const ids = oldInvoices.map(i => i.id);
      await connection.query('DELETE FROM payments WHERE invoice_id IN (?)', [ids]);
      await connection.query('DELETE FROM invoices WHERE id IN (?)', [ids]);
    }

    // 2. Obtener factura de julio
    const [julyInvoices] = await connection.execute('SELECT id, amount FROM invoices WHERE month_year = "2026-07"');
    if (julyInvoices.length > 0) {
      const julyId = julyInvoices[0].id;
      const julyAmount = julyInvoices[0].amount;
      
      // Asegurarse de que esté pagada
      await connection.execute('UPDATE invoices SET status = "paid" WHERE id = ?', [julyId]);
      
      // Borrar cualquier pago viejo de esa factura por si acaso
      await connection.execute('DELETE FROM payments WHERE invoice_id = ?', [julyId]);

      // Insertar el pago como transferencia
      await connection.execute(
        'INSERT INTO payments (invoice_id, amount, payment_method, transaction_id, status) VALUES (?, ?, ?, ?, ?)',
        [julyId, julyAmount, 'Transferencia', 'MANUAL-123', 'completed']
      );
    }
    
    console.log('¡Base de datos limpiada perfectamente!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

cleanDB();
