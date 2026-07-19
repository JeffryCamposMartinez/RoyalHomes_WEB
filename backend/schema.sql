-- Creación de la base de datos
CREATE DATABASE IF NOT EXISTS muebles_db;
USE muebles_db;

-- Evitar errores de claves foráneas al hacer drops si existen
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS historial_auditoria, detalles_pedido, pedidos, estados_pedido, variantes_producto, productos, categorias, usuarios, roles, orders, order_items;
SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE roles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE usuarios (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    rol_id INT UNSIGNED NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    activo TINYINT(1) DEFAULT 1,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE RESTRICT
);

CREATE TABLE categorias (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    imagen_url VARCHAR(500)
);

CREATE TABLE productos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    categoria_id INT UNSIGNED NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio_base DECIMAL(10,2) NOT NULL,
    imagen_base VARCHAR(500),
    galeria JSON,
    activo TINYINT(1) DEFAULT 1,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT
);

CREATE TABLE variantes_producto (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    producto_id INT UNSIGNED NOT NULL,
    material VARCHAR(50) NOT NULL,
    acabado_color VARCHAR(50) NOT NULL,
    sku VARCHAR(100) NOT NULL UNIQUE,
    stock INT UNSIGNED DEFAULT 0,
    precio_especifico DECIMAL(10,2),
    imagen_variante VARCHAR(500),
    galeria JSON,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);

CREATE TABLE estados_pedido (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE pedidos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NOT NULL,
    estado_id INT UNSIGNED NOT NULL,
    direccion_envio TEXT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    FOREIGN KEY (estado_id) REFERENCES estados_pedido(id) ON DELETE RESTRICT
);

CREATE TABLE detalles_pedido (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT UNSIGNED NOT NULL,
    variante_id INT UNSIGNED NOT NULL,
    cantidad INT UNSIGNED NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (variante_id) REFERENCES variantes_producto(id) ON DELETE RESTRICT
);

CREATE TABLE historial_auditoria (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED,
    tabla_afectada VARCHAR(100) NOT NULL,
    accion ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    registro_id INT UNSIGNED NOT NULL,
    detalle_cambio JSON,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Índices Estratégicos
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_pedidos_usuario ON pedidos(usuario_id);
CREATE INDEX idx_auditoria_tabla ON historial_auditoria(tabla_afectada);

CREATE TABLE configuracion_portada (
    slot_index INT PRIMARY KEY,
    categoria_id INT UNSIGNED,
    imagen_url VARCHAR(255),
    descuento_porcentaje INT DEFAULT 0,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL
);

CREATE TABLE configuracion_contacto (
    id INT PRIMARY KEY DEFAULT 1,
    instagram_url VARCHAR(255),
    facebook_url VARCHAR(255),
    whatsapp VARCHAR(50),
    email_contacto VARCHAR(150),
    telefono VARCHAR(50),
    direccion_fisica TEXT,
    CHECK (id = 1)
);

-- Datos Predeterminados (Seed)

-- Roles
INSERT IGNORE INTO roles (id, nombre) VALUES (1, 'Admin'), (2, 'Cliente');

-- Usuario Admin (Contraseña: 123456)
-- Hash generado con bcrypt salt rounds 10 (Password: 123456)
INSERT IGNORE INTO usuarios (id, rol_id, nombre, apellido, email, password_hash) VALUES 
(1, 1, 'Super', 'Admin', 'admin@muebles.com', '$2b$10$KNh4Myb0Kb7C2BGVFjDpWebadzdwnlQr4EJH/FymqRj4yfSb9Y48G');

-- Estados de Pedido
INSERT IGNORE INTO estados_pedido (id, nombre) VALUES 
(1, 'Pendiente'), (2, 'Pagado'), (3, 'Enviado'), (4, 'Entregado');

-- Categorías (Con las que pediste en el diseño)
INSERT IGNORE INTO categorias (id, nombre, descripcion, imagen_url) VALUES 
(1, 'Mesas y juegos de comedor', 'Encuentra el centro perfecto para tus reuniones familiares.', NULL),
(2, 'Muebles de Cocina', 'Muebles prácticos y modernos para tu cocina.', NULL),
(3, 'Alfombras', 'Añade calidez y estilo a tus espacios.', NULL),
(4, 'Iluminación', 'Lámparas y luces para crear el ambiente perfecto.', NULL),
(5, 'Decoración hogar', 'Detalles que hacen de tu casa un hogar.', NULL),
(6, 'Menaje comedor', 'Vajilla y accesorios para lucirte en la mesa.', NULL);

-- Productos Predeterminados
INSERT IGNORE INTO productos (id, categoria_id, nombre, descripcion, precio_base, imagen_base, activo) VALUES 
(1, 1, 'Juego de Comedor Nórdico', 'Mesa de madera de roble con 6 sillas tapizadas en gris.', 850000, NULL, 1),
(2, 4, 'Lámpara de Pie Industrial', 'Lámpara de pie de metal negro mate con ampolleta vintage.', 45000, NULL, 1);

-- Variantes de Producto
INSERT IGNORE INTO variantes_producto (id, producto_id, material, acabado_color, sku, stock, precio_especifico) VALUES 
(1, 1, 'Roble/Tela', 'Madera Natural/Gris', 'COM-NOR-01', 5, 850000),
(2, 2, 'Metal', 'Negro Mate', 'ILU-IND-01', 12, 45000);

-- Configuración de Portada (Hero Grid)
INSERT IGNORE INTO configuracion_portada (slot_index, categoria_id) VALUES 
(1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (6, 6);

-- Configuración de Contacto
INSERT IGNORE INTO configuracion_contacto (id, instagram_url, facebook_url, whatsapp, email_contacto, telefono, direccion_fisica) VALUES 
(1, 'https://instagram.com/', 'https://facebook.com/', '+56900000000', 'contacto@nordichearth.com', '+56220000000', 'Av. Providencia 1234, Santiago, Chile');
