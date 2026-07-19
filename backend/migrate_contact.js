const db = require('./config/db');

async function runSQL() {
  try {
    const connection = await db.getConnection();
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS configuracion_contacto (
          id INT PRIMARY KEY DEFAULT 1,
          instagram_url VARCHAR(255),
          facebook_url VARCHAR(255),
          whatsapp VARCHAR(50),
          email_contacto VARCHAR(150),
          telefono VARCHAR(50),
          direccion_fisica TEXT,
          CHECK (id = 1)
      );
    `);
    
    await connection.query(`
      INSERT IGNORE INTO configuracion_contacto (id, instagram_url, facebook_url, whatsapp, email_contacto, telefono, direccion_fisica) VALUES 
      (1, 'https://instagram.com/', 'https://facebook.com/', '+56900000000', 'contacto@nordichearth.com', '+56220000000', 'Av. Providencia 1234, Santiago, Chile');
    `);
    
    console.log("Migration successful: configuracion_contacto table created and seeded.");
    connection.release();
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

runSQL();
