const mysql = require('mysql2/promise');
require('dotenv').config();

// Creamos un pool separado para la base de datos de facturación de la agencia
const billingPool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.BILLING_DB_NAME || 'AgencyBilling_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = billingPool;
