const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('Iniciando prueba de conexión a la base de datos remota...');
  console.log('Host: 185.173.110.158');
  
  try {
    const connection = await mysql.createConnection({
      host: '185.173.110.158',
      port: 3306,
      user: 'mysql',
      password: 'Iav9Sd9q6309Udhm9KaiwxcpT7rWYCwXdZyGVy9AmMxl7XPaHoDFpJmdNLJd7jsm',
      database: 'default',
      connectTimeout: 10000 // 10 segundos de timeout
    });

    console.log('✅ ¡Conexión exitosa a la base de datos en Hostinger!');
    
    const [rows, fields] = await connection.execute('SHOW TABLES');
    console.log('Tablas en la base de datos "default":');
    if (rows.length === 0) {
      console.log('  (La base de datos está vacía)');
    } else {
      console.log(rows);
    }

    await connection.end();
    console.log('Conexión cerrada.');
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:');
    console.error(error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Tip: Asegúrate de que el puerto 3306 esté abierto en el firewall de tu VPS en Hostinger y que MySQL esté configurado para aceptar conexiones externas (bind-address).');
    }
  }
}

testConnection();
