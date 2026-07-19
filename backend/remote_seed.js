const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');

async function seed() {
  let connection;
  try {
    console.log('Conectando a MySQL remoto...');
    connection = await mysql.createConnection({
      host: '185.173.110.158',
      user: 'mysql',
      password: 'Iav9Sd9q6309Udhm9KaiwxcpT7rWYCwXdZyGVy9AmMxl7XPaHoDFpJmdNLJd7jsm',
      database: 'default',
      multipleStatements: true
    });

    console.log('Leyendo schema.sql...');
    let schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    
    // Remover las líneas de CREATE DATABASE y USE
    schemaSql = schemaSql.replace(/CREATE DATABASE IF NOT EXISTS muebles_db;/g, '');
    schemaSql = schemaSql.replace(/USE muebles_db;/g, '');
    
    console.log('Ejecutando schema.sql en la BD remota...');
    await connection.query(schemaSql);
    
    console.log('Tablas creadas con éxito. Insertando datos de prueba...');
    
    // Roles
    await connection.query(`
      INSERT INTO roles (id, nombre) VALUES 
      (1, 'Admin'), (2, 'Cliente')
      ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);
    `);

    // Usuarios
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('123456', salt);
    await connection.query(`
      INSERT INTO usuarios (id, rol_id, nombre, apellido, email, password_hash) VALUES 
      (1, 1, 'Super', 'Admin', 'admin@muebles.com', ?),
      (2, 2, 'Cliente', 'Prueba', 'cliente@prueba.com', ?)
      ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash);
    `, [hash, hash]);

    // Categorías
    await connection.query(`
      INSERT INTO categorias (id, nombre, descripcion) VALUES 
      (1, 'Sofás', 'Sofás modulares y clásicos'),
      (2, 'Comedores', 'Mesas y sillas de comedor'),
      (3, 'Respaldos de cama', 'Respaldos de diferentes estilos y materiales')
      ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);
    `);

    // Estados de Pedido
    await connection.query(`
      INSERT INTO estados_pedido (id, nombre) VALUES 
      (1, 'Pendiente'), (2, 'En Producción'), (3, 'Enviado'), (4, 'Entregado'), (5, 'Cancelado')
      ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);
    `);

    console.log('Base de datos inicializada correctamente en Hostinger.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seed();
