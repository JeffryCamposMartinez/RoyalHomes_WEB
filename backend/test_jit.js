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
    const storeDomain = 'royalhomes.cl'; 
    const [clients] = await connection.query('SELECT * FROM clients WHERE store_domain = ?', [storeDomain]);
    const client = clients[0];

    const [subscriptions] = await connection.query('SELECT * FROM subscriptions WHERE client_id = ?', [client.id]);
    const subscription = subscriptions[0] || null;

    if (subscription && subscription.status === 'active') {
      const startDate = new Date(subscription.start_date);
      const billingDay = startDate.getDate();
      const price = subscription.price;
      const now = new Date();
      
      let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth(), 1);
      
      if (now.getDate() > billingDay) {
          endDate.setMonth(endDate.getMonth() + 1);
      }
      
      while (currentDate <= endDate) {
          const yyyy = currentDate.getFullYear();
          const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
          const monthYear = `${yyyy}-${mm}`;
          console.log(`Checking monthYear: ${monthYear}`);
          
          const [existing] = await connection.query('SELECT id FROM invoices WHERE client_id = ? AND month_year = ?', [client.id, monthYear]);
          if (existing.length === 0) {
              const due = new Date(yyyy, currentDate.getMonth(), billingDay);
              console.log(`Inserting invoice for ${monthYear} due on ${due}`);
              await connection.query(
                  'INSERT INTO invoices (client_id, subscription_id, month_year, amount, due_date, status) VALUES (?, ?, ?, ?, ?, ?)',
                  [client.id, subscription.id, monthYear, price, due, 'pending']
              );
          } else {
             console.log(`Invoice for ${monthYear} already exists`);
          }
          currentDate.setMonth(currentDate.getMonth() + 1);
      }
      
      console.log(`Updating overdue invoices`);
      await connection.query('UPDATE invoices SET status = "overdue" WHERE client_id = ? AND status = "pending" AND due_date < ?', [client.id, now]);
    }
    
    console.log('Success');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

testJit();
