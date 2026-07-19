const db = require('./config/db');

async function runSQL() {
  try {
    const connection = await db.getConnection();
    await connection.query(`ALTER TABLE usuarios ADD COLUMN rut VARCHAR(20) NULL DEFAULT NULL AFTER email`);
    await connection.query(`ALTER TABLE usuarios ADD COLUMN fecha_nacimiento DATE NULL DEFAULT NULL AFTER rut`);
    await connection.query(`ALTER TABLE usuarios ADD COLUMN direcciones JSON NULL DEFAULT NULL AFTER carrito`);
    console.log("Success");
    connection.release();
    process.exit(0);
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
       console.log("Fields already exist");
       process.exit(0);
    }
    console.error(err);
    process.exit(1);
  }
}
runSQL();
