const db = require('./config/db');

async function migrate() {
  try {
    await db.query('ALTER TABLE configuracion_portada ADD COLUMN descuento_porcentaje INT DEFAULT 0;');
    console.log('Migration successful');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('Column already exists');
    } else {
      console.error('Error during migration:', err);
    }
  } finally {
    process.exit();
  }
}

migrate();
