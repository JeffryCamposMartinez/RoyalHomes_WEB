const mysql = require('mysql2/promise');

async function patch() {
  let connection;
  try {
    console.log('Conectando a MySQL remoto para parchear...');
    connection = await mysql.createConnection({
      host: '185.173.110.158',
      user: 'mysql',
      password: 'Iav9Sd9q6309Udhm9KaiwxcpT7rWYCwXdZyGVy9AmMxl7XPaHoDFpJmdNLJd7jsm',
      database: 'RoyalHomes_db',
      multipleStatements: true
    });

    console.log('Aplicando parches...');
    
    // Añadir columnas faltantes a la tabla usuarios
    await connection.query(`
      ALTER TABLE usuarios 
      ADD COLUMN carrito JSON,
      ADD COLUMN rut VARCHAR(20),
      ADD COLUMN fecha_nacimiento DATE,
      ADD COLUMN direcciones JSON;
    `);
    console.log('Columnas de usuarios añadidas.');

    // Crear la tabla configuracion_tienda si no existe
    await connection.query(`
      CREATE TABLE IF NOT EXISTS configuracion_tienda (
        id INT PRIMARY KEY DEFAULT 1,
        hero_text VARCHAR(500) DEFAULT 'Bienvenido',
        footer_text VARCHAR(500) DEFAULT 'Footer'
      );
    `);
    
    // Insertar fila por defecto si está vacía
    await connection.query(`
      INSERT IGNORE INTO configuracion_tienda (id, hero_text, footer_text) 
      VALUES (1, 'Elevando tus espacios a través de la esencia del diseño Japandi. Combinamos el minimalismo funcional escandinavo con la elegancia atemporal japonesa.', '© 2024 Royal Home. Todos los derechos reservados.');
    `);
    console.log('Tabla configuracion_tienda creada y llenada.');

    console.log('Base de datos parcheada con éxito.');
    process.exit(0);
  } catch (error) {
    console.error('Error parcheando:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

patch();
