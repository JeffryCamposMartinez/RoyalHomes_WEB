const db = require('./config/db');

async function runSQL() {
  try {
    const connection = await db.getConnection();
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS configuracion_tienda (
          id INT PRIMARY KEY DEFAULT 1,
          hero_text TEXT,
          CHECK (id = 1)
      );
    `);
    
    await connection.query(`
      INSERT IGNORE INTO configuracion_tienda (id, hero_text) VALUES 
      (1, 'Elevando tus espacios a través de la esencia del diseño Japandi. Combinamos el minimalismo funcional escandinavo con la elegancia atemporal japonesa.');
    `);
    
    console.log("Configuración Hero migration successful!");
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runSQL();
