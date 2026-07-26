require('dotenv').config();
const mysql = require('mysql2/promise');

async function createNotificationsTable() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'muebles_db'
    });

    console.log('Iniciando creación de tabla de notificaciones...');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS notificaciones (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT UNSIGNED NOT NULL,
        tipo VARCHAR(50) NOT NULL,
        mensaje VARCHAR(255) NOT NULL,
        referencia_id INT UNSIGNED,
        leida BOOLEAN DEFAULT FALSE,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    console.log('¡Tabla de notificaciones creada con éxito!');

  } catch (error) {
    console.error('Error al crear la tabla:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit();
  }
}

createNotificationsTable();
