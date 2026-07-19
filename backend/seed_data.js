const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function seed() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'muebles_db'
  });

  try {
    console.log('Insertando Roles...');
    await connection.query(`
      INSERT INTO roles (id, nombre) VALUES 
      (1, 'Admin'), (2, 'Cliente')
      ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);
    `);

    console.log('Insertando Usuarios...');
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('123456', salt);
    await connection.query(`
      INSERT INTO usuarios (id, rol_id, nombre, apellido, email, password_hash) VALUES 
      (1, 1, 'Super', 'Admin', 'admin@muebles.com', ?),
      (2, 2, 'Cliente', 'Prueba', 'cliente@prueba.com', ?)
      ON DUPLICATE KEY UPDATE password_hash=VALUES(password_hash);
    `, [hash, hash]);

    console.log('Insertando Categorias...');
    await connection.query(`
      INSERT INTO categorias (id, nombre, descripcion) VALUES 
      (1, 'Sofás', 'Sofás modulares y clásicos'),
      (2, 'Comedores', 'Mesas y sillas de comedor'),
      (3, 'Respaldos de cama', 'Respaldos de diferentes estilos y materiales')
      ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);
    `);

    console.log('Insertando Estados...');
    await connection.query(`
      INSERT INTO estados_pedido (id, nombre) VALUES 
      (1, 'Pendiente'), (2, 'Pagado'), (3, 'Enviado'), (4, 'Entregado')
      ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);
    `);

    console.log('Insertando Productos...');
    const productos = [
      [1, 1, "Sofá Modular 'Nube'", "Sofá modular expansible con tapizado premium.", 1299.99, "/images/sofa.jpg"],
      [2, 2, "Mesa de Comedor 'Roble Eterno'", "Mesa de comedor rústica pero elegante.", 849.50, "/images/mesa.jpg"],
      [3, 3, "Respaldo 'Capitoné Real'", "Respaldo tapizado en lino con detalle de botones clásicos.", 350.00, "/images/respaldo.jpg"]
    ];
    await connection.query(`
      INSERT INTO productos (id, categoria_id, nombre, descripcion, precio_base, imagen_base)
      VALUES ?
      ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), imagen_base=VALUES(imagen_base);
    `, [productos]);

    console.log('Insertando Variantes...');
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

    console.log('Done!');
  } catch (error) {
    console.error(error);
  } finally {
    connection.end();
  }
}
seed();
