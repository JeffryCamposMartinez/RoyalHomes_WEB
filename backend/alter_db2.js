const db = require('./config/db');

async function alterDb() {
  try {
    await db.query('ALTER TABLE productos ADD COLUMN galeria JSON');
    console.log('Column galeria added successfully');
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('Column already exists');
    } else {
      console.error('Error adding column:', error);
    }
  } finally {
    process.exit(0);
  }
}

alterDb();
