const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'muebles_db'
  });

  try {
    console.log('Adding galeria column to variantes_producto...');
    await connection.query('ALTER TABLE variantes_producto ADD COLUMN galeria JSON');
    console.log('Column added successfully.');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Column galeria already exists in variantes_producto.');
    } else {
      console.error('Error adding column:', error);
    }
  }

  await connection.end();
}

run();
