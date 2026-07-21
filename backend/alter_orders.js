require('dotenv').config();
const mysql = require('mysql2/promise');

async function alterDatabase() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'muebles_db',
    port: process.env.DB_PORT || 3306
  });

  try {
    console.log("Iniciando actualización de la base de datos...");

    // 1. Nuevos estados
    await db.query(`UPDATE estados_pedido SET nombre = 'Pendiente de Aprobación' WHERE id = 1`);
    await db.query(`INSERT IGNORE INTO estados_pedido (id, nombre) VALUES (6, 'Aprobado (Pendiente de Pago)')`);
    await db.query(`INSERT IGNORE INTO estados_pedido (id, nombre) VALUES (7, 'Rechazado')`);
    await db.query(`INSERT IGNORE INTO estados_pedido (id, nombre) VALUES (8, 'Pago Habilitado')`);
    
    // 2. Modificar tabla pedidos
    try {
      await db.query(`ALTER TABLE pedidos ADD COLUMN metodo_entrega VARCHAR(50) DEFAULT 'retiro_fisico'`);
    } catch (e) { console.log("Columna metodo_entrega ya existe o error:", e.message); }

    try {
      await db.query(`ALTER TABLE pedidos ADD COLUMN metodo_contacto VARCHAR(50) DEFAULT 'chat_nativo'`);
    } catch (e) { console.log("Columna metodo_contacto ya existe o error:", e.message); }

    try {
      await db.query(`ALTER TABLE pedidos ADD COLUMN cliente_acepto_trato BOOLEAN DEFAULT FALSE`);
    } catch (e) { console.log("Columna cliente_acepto_trato ya existe o error:", e.message); }

    try {
      await db.query(`ALTER TABLE pedidos ADD COLUMN admin_acepto_trato BOOLEAN DEFAULT FALSE`);
    } catch (e) { console.log("Columna admin_acepto_trato ya existe o error:", e.message); }

    try {
      await db.query(`ALTER TABLE pedidos ADD COLUMN whatsapp_contacto VARCHAR(50) NULL`);
    } catch (e) { console.log("Columna whatsapp_contacto ya existe o error:", e.message); }

    // 3. Crear tabla de mensajes
    await db.query(`
      CREATE TABLE IF NOT EXISTS mensajes_pedido (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        pedido_id INT UNSIGNED NOT NULL,
        remitente_id INT UNSIGNED NOT NULL,
        mensaje TEXT NOT NULL,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
        FOREIGN KEY (remitente_id) REFERENCES usuarios(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log("¡Base de datos actualizada con éxito!");
  } catch (error) {
    console.error("Error al actualizar la base de datos:", error);
  } finally {
    await db.end();
  }
}

alterDatabase();
