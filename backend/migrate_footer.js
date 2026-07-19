const db = require('./config/db');

async function runSQL() {
  try {
    const connection = await db.getConnection();
    
    // Check if column exists first to be safe, or just run ALTER TABLE
    // In MySQL, ALTER TABLE ADD COLUMN throws an error if it already exists, so let's catch it if so
    try {
      await connection.query(`
        ALTER TABLE configuracion_tienda ADD COLUMN footer_text TEXT AFTER hero_text;
      `);
      console.log("Columna footer_text agregada.");
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME') {
        console.log("Columna footer_text ya existía.");
      } else {
        throw e;
      }
    }
    
    await connection.query(`
      UPDATE configuracion_tienda 
      SET footer_text = 'Elevando tus espacios a través de la esencia del diseño Japandi. Combinamos el minimalismo funcional escandinavo con la elegancia atemporal japonesa.' 
      WHERE id = 1 AND footer_text IS NULL;
    `);
    
    console.log("Configuración Footer migration successful!");
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

runSQL();
