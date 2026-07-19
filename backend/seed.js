const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function seed() {
  let connection;
  try {
    console.log('Conectando a MySQL...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    console.log('Ejecutando schema.sql...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    
    // Configurar para permitir múltiples queries
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });
    
    await connection.query(schemaSql);
    
    console.log('Tablas creadas con éxito. Insertando datos de prueba...');
    await connection.query('USE muebles_db');
    
    // Roles
    await connection.query(`
      INSERT INTO roles (id, nombre) VALUES 
      (1, 'Admin'), (2, 'Cliente')
      ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);
    `);

    // Usuarios (1 Admin, 1 Cliente de prueba)
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
      (1, 'Pendiente'), (2, 'Pagado'), (3, 'Enviado'), (4, 'Entregado')
      ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);
    `);

    // Productos
    const productos = [
      [1, 1, "Sofá Modular 'Nube'", "Sofá modular expansible con tapizado premium.", 1299.99, "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80"],
      [2, 2, "Mesa de Comedor 'Roble Eterno'", "Mesa de comedor rústica pero elegante.", 849.50, "https://images.unsplash.com/photo-1604578762246-41134e37f9cc?auto=format&fit=crop&w=800&q=80"],
      [3, 3, "Respaldo 'Capitoné Real'", "Respaldo tapizado en lino con detalle de botones clásicos.", 350.00, "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80"]
    ];
    
    await connection.query(`
      INSERT INTO productos (id, categoria_id, nombre, descripcion, precio_base, imagen_base)
      VALUES ?
      ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);
    `, [productos]);

    // Variantes
    const variantes = [
      [1, 1, "Tela antimanchas", "Gris Oscuro", "SOFA-NUB-GRIS", 15, 1299.99],
      [2, 1, "Terciopelo", "Azul Marino", "SOFA-NUB-AZUL", 5, 1399.99],
      [3, 2, "Roble macizo", "Natural", "MESA-ROB-NAT", 8, 849.50],
      [4, 2, "Roble macizo", "Barniz Oscuro", "MESA-ROB-OSC", 2, 899.00],
      [5, 3, "Lino", "Beige", "RESP-CAP-BEI", 20, 350.00],
      [6, 3, "Cuero Sintético", "Negro", "RESP-CAP-NEG", 10, 380.00]
    ];

    await connection.query(`
      INSERT INTO variantes_producto (id, producto_id, material, acabado_color, sku, stock, precio_especifico)
      VALUES ?
      ON DUPLICATE KEY UPDATE sku=VALUES(sku);
    `, [variantes]);

    console.log('✅ Base de datos profesional inicializada correctamente.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

seed();
