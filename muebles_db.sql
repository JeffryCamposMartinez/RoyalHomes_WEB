-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: muebles_db
-- ------------------------------------------------------
-- Server version	5.5.5-10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `imagen_url` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES (1,'Mesas y juegos de comedor','Encuentra el centro perfecto para tus reuniones familiares.','/uploads/image-1784304647194-346821569.webp'),(2,'Cocina','Muebles prácticos y modernos para tu cocina.','/uploads/image-1784303389578-253471540.webp'),(3,'Alfombras','Añade calidez y estilo a tus espacios.','/uploads/image-1784304653235-52525649.jfif'),(4,'Iluminación','Lámparas y luces para crear el ambiente perfecto.','/uploads/image-1784304659818-44879123.webp'),(5,'Decoración hogar','Detalles que hacen de tu casa un hogar.','/uploads/image-1784304665811-989497659.jfif'),(6,'Menaje comedor','Vajilla y accesorios para lucirte en la mesa.','/uploads/image-1784304670849-133079628.avif');
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuracion_contacto`
--

DROP TABLE IF EXISTS `configuracion_contacto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracion_contacto` (
  `id` int(11) NOT NULL DEFAULT 1,
  `instagram_url` varchar(255) DEFAULT NULL,
  `facebook_url` varchar(255) DEFAULT NULL,
  `whatsapp` varchar(50) DEFAULT NULL,
  `email_contacto` varchar(150) DEFAULT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `direccion_fisica` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `CONSTRAINT_1` CHECK (`id` = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracion_contacto`
--

LOCK TABLES `configuracion_contacto` WRITE;
/*!40000 ALTER TABLE `configuracion_contacto` DISABLE KEYS */;
INSERT INTO `configuracion_contacto` VALUES (1,'','','+56 9 9790 2291','muebles@gmail.com','','Virrey don ambrosio 664');
/*!40000 ALTER TABLE `configuracion_contacto` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuracion_portada`
--

DROP TABLE IF EXISTS `configuracion_portada`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracion_portada` (
  `slot_index` int(11) NOT NULL,
  `categoria_id` int(10) unsigned DEFAULT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `descuento_porcentaje` int(11) DEFAULT 0,
  PRIMARY KEY (`slot_index`),
  KEY `categoria_id` (`categoria_id`),
  CONSTRAINT `configuracion_portada_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracion_portada`
--

LOCK TABLES `configuracion_portada` WRITE;
/*!40000 ALTER TABLE `configuracion_portada` DISABLE KEYS */;
INSERT INTO `configuracion_portada` VALUES (1,2,'/uploads/image-1784252788261-535360952.jfif',0),(2,1,'/uploads/image-1784302383996-652215341.jfif',0),(3,6,'/uploads/image-1784252788267-193637984.jfif',0),(4,4,'/uploads/image-1784304659818-44879123.webp',15),(5,6,'/uploads/image-1784304670849-133079628.avif',0),(6,5,'/uploads/image-1784252788263-887700468.jfif',0);
/*!40000 ALTER TABLE `configuracion_portada` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuracion_tienda`
--

DROP TABLE IF EXISTS `configuracion_tienda`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracion_tienda` (
  `id` int(11) NOT NULL DEFAULT 1,
  `hero_text` text DEFAULT NULL,
  `footer_text` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `CONSTRAINT_1` CHECK (`id` = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracion_tienda`
--

LOCK TABLES `configuracion_tienda` WRITE;
/*!40000 ALTER TABLE `configuracion_tienda` DISABLE KEYS */;
INSERT INTO `configuracion_tienda` VALUES (1,'Elevando tus espacios a través de la esencia del diseño Japandi. Combinamos el minimalismo funcional escandinavo con la elegancia atemporal japonesa.','Elevando tus espacios a través de la esencia del diseño Japandi. Combinamos el minimalismo funcional escandinavo con la elegancia atemporal japonesa.');
/*!40000 ALTER TABLE `configuracion_tienda` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `detalles_pedido`
--

DROP TABLE IF EXISTS `detalles_pedido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `detalles_pedido` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `pedido_id` int(10) unsigned NOT NULL,
  `variante_id` int(10) unsigned NOT NULL,
  `cantidad` int(10) unsigned NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `pedido_id` (`pedido_id`),
  KEY `variante_id` (`variante_id`),
  CONSTRAINT `detalles_pedido_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `detalles_pedido_ibfk_2` FOREIGN KEY (`variante_id`) REFERENCES `variantes_producto` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `detalles_pedido`
--

LOCK TABLES `detalles_pedido` WRITE;
/*!40000 ALTER TABLE `detalles_pedido` DISABLE KEYS */;
/*!40000 ALTER TABLE `detalles_pedido` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estados_pedido`
--

DROP TABLE IF EXISTS `estados_pedido`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estados_pedido` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estados_pedido`
--

LOCK TABLES `estados_pedido` WRITE;
/*!40000 ALTER TABLE `estados_pedido` DISABLE KEYS */;
INSERT INTO `estados_pedido` VALUES (5,'Cancelado'),(4,'Entregado'),(3,'Enviado'),(2,'Pagado'),(1,'Pendiente');
/*!40000 ALTER TABLE `estados_pedido` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_auditoria`
--

DROP TABLE IF EXISTS `historial_auditoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historial_auditoria` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` int(10) unsigned DEFAULT NULL,
  `tabla_afectada` varchar(100) NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `registro_id` int(10) unsigned NOT NULL,
  `detalle_cambio` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`detalle_cambio`)),
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `idx_auditoria_tabla` (`tabla_afectada`),
  CONSTRAINT `historial_auditoria_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_auditoria`
--

LOCK TABLES `historial_auditoria` WRITE;
/*!40000 ALTER TABLE `historial_auditoria` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_auditoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pedidos`
--

DROP TABLE IF EXISTS `pedidos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pedidos` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `usuario_id` int(10) unsigned NOT NULL,
  `estado_id` int(10) unsigned NOT NULL,
  `direccion_envio` text NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `mercadopago_preference_id` varchar(255) DEFAULT NULL,
  `payment_id` varchar(255) DEFAULT NULL,
  `payment_status` varchar(50) DEFAULT 'pending',
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `estado_id` (`estado_id`),
  KEY `idx_pedidos_usuario` (`usuario_id`),
  CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `pedidos_ibfk_2` FOREIGN KEY (`estado_id`) REFERENCES `estados_pedido` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pedidos`
--

LOCK TABLES `pedidos` WRITE;
/*!40000 ALTER TABLE `pedidos` DISABLE KEYS */;
/*!40000 ALTER TABLE `pedidos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `productos` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `categoria_id` int(10) unsigned NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio_base` decimal(10,2) NOT NULL,
  `imagen_base` varchar(500) DEFAULT NULL,
  `galeria` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`galeria`)),
  `activo` tinyint(1) DEFAULT 1,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_productos_categoria` (`categoria_id`),
  CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (1,1,'Juego de Comedor Nórdico','Mesa de madera de roble con 6 sillas tapizadas en gris.',850000.00,'/uploads/image-1784309001864-766822589.jfif','[\"/uploads/image-1784387339083-127284440.jfif\",\"/uploads/image-1784387339090-285019508.jfif\",\"/uploads/image-1784387339095-68322357.jfif\"]',1,'2026-07-17 01:32:37','2026-07-18 15:08:59'),(2,4,'Lámpara de Pie Industrial','Lámpara de pie de metal negro mate con ampolleta vintage.',45000.00,'/uploads/image-1784252665520-536137899.webp','[]',1,'2026-07-17 01:32:37','2026-07-17 01:44:25'),(3,1,'Mesa de Comedor Nórdica \"Oslo\"','Mesa de diseño nórdico con capacidad para 6 personas, patas de madera maciza.',1200000.00,'/uploads/image-1784389892931-5991.webp','[\"/uploads/image-1784389893875-8456.webp\"]',1,'2026-07-18 15:40:44','2026-07-18 15:51:34'),(4,1,'Juego de Comedor \"Viena\" 6 Puestos','Juego completo con mesa rectangular y 6 sillas tapizadas.',2500000.00,'/uploads/image-1784389896444-3913.webp','[\"/uploads/image-1784389897210-7635.webp\"]',1,'2026-07-18 15:40:44','2026-07-18 15:51:37'),(5,1,'Mesa Extensible \"Copenhague\"','Mesa versátil que se adapta a tus necesidades, ideal para reuniones grandes.',1800000.00,'/uploads/image-1784389899633-5797.webp','[\"/uploads/image-1784389900383-4323.webp\"]',1,'2026-07-18 15:40:44','2026-07-18 15:51:41'),(6,2,'Isla de Cocina \"Berna\"','Isla central con almacenamiento y espacio para taburetes.',1500000.00,'/uploads/image-1784389902757-445.webp','[\"/uploads/image-1784389903689-4663.webp\"]',1,'2026-07-18 15:40:44','2026-07-18 15:51:44'),(7,2,'Alacena Vertical \"Milán\"','Mueble organizador con estantes ajustables para tu despensa.',850000.00,'/uploads/image-1784389906350-9458.webp','[\"/uploads/image-1784389907109-7994.webp\"]',1,'2026-07-18 15:40:44','2026-07-18 15:51:47'),(8,2,'Carrito Auxiliar \"Roma\"','Carrito con ruedas, muy práctico para servir o guardar elementos esenciales.',350000.00,'/uploads/image-1784389909525-7139.webp','[\"/uploads/image-1784389910279-8818.webp\"]',1,'2026-07-18 15:40:44','2026-07-18 15:51:51'),(9,3,'Alfombra de Yute \"Tierra\"','Alfombra 100% natural, aporta calidez y textura a tus espacios.',280000.00,'/uploads/image-1784389912702-59.webp','[\"/uploads/image-1784389913624-5349.webp\"]',1,'2026-07-18 15:40:44','2026-07-18 17:00:58'),(10,3,'Alfombra Shaggy \"Nube\"','Alfombra de pelo largo, extremadamente suave al tacto.',420000.00,'/uploads/image-1784389916033-1043.webp','[\"/uploads/image-1784389916731-4566.webp\"]',1,'2026-07-18 15:40:44','2026-07-18 15:51:57'),(11,3,'Alfombra Geométrica \"Triana\"','Diseño moderno con patrones geométricos para un toque contemporáneo.',310000.00,'/uploads/image-1784389919104-9948.webp','[\"/uploads/image-1784389919853-3106.webp\"]',1,'2026-07-18 15:40:44','2026-07-18 15:52:00'),(12,4,'Lámpara Colgante \"Aura\"','Lámpara de techo estilo industrial con acabado mate.',180000.00,'/uploads/image-1784389922197-6400.webp','[\"/uploads/image-1784389923116-9562.webp\"]',1,'2026-07-18 15:40:44','2026-07-18 15:52:03'),(13,4,'Lámpara de Pie \"Zen\"','Lámpara de diseño minimalista, ideal para el rincón de lectura.',250000.00,'/uploads/image-1784389925474-3649.webp','[\"/uploads/image-1784389926234-2498.webp\"]',1,'2026-07-18 15:40:44','2026-07-18 15:52:06'),(14,4,'Lámpara de Mesa \"Luz\"','Lámpara de noche con regulador de intensidad.',120000.00,'/uploads/image-1784389928643-584.webp','[\"/uploads/image-1784389929365-1256.webp\"]',1,'2026-07-18 15:40:44','2026-07-18 15:52:10'),(15,5,'Espejo Redondo \"Sol\"','Espejo de pared con marco metálico delgado.',150000.00,'/uploads/image-1784389931813-9071.webp','[\"/uploads/image-1784389932785-8584.webp\"]',1,'2026-07-18 15:40:44','2026-07-18 15:52:13'),(16,5,'Jarrón de Cerámica \"Tierra\"','Jarrón artesanal perfecto para flores secas o frescas.',85000.00,'/uploads/image-1784389935215-7031.webp','[\"/uploads/image-1784389935973-8644.webp\"]',1,'2026-07-18 15:40:44','2026-07-18 15:52:16'),(17,5,'Reloj de Pared Minimalista','Reloj sin números de estilo moderno.',110000.00,'/uploads/image-1784389938361-5729.webp','[\"/uploads/image-1784389939095-6453.webp\"]',1,'2026-07-18 15:40:44','2026-07-18 15:52:19'),(18,6,'Vajilla de Porcelana 16 Piezas','Set completo de vajilla blanca para 4 personas.',290000.00,'/uploads/image-1784389941477-9908.webp','[\"/uploads/image-1784389942398-1624.webp\"]',1,'2026-07-18 15:40:44','2026-07-18 15:52:23'),(19,6,'Set de Copas de Cristal (6 uds)','Copas elegantes ideales para vino o cócteles.',120000.00,'/uploads/image-1784389944750-5977.webp','[\"/uploads/image-1784389945503-9511.webp\"]',1,'2026-07-18 15:40:44','2026-07-18 15:52:26'),(20,6,'Cubertería de Acero Inoxidable','Juego de cubiertos de 24 piezas de alta durabilidad.',180000.00,'/uploads/image-1784389947849-3889.webp','[\"/uploads/image-1784389948601-9053.webp\"]',1,'2026-07-18 15:40:44','2026-07-18 15:52:29'),(21,1,'Producto Extra de Prueba','Para ver la paginación',100000.00,NULL,'[]',1,'2026-07-18 15:47:05','2026-07-18 15:47:05');
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Admin'),(2,'Cliente');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `rol_id` int(10) unsigned NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `rut` varchar(20) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `carrito` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`carrito`)),
  `direcciones` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`direcciones`)),
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `actualizado_en` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `rol_id` (`rol_id`),
  KEY `idx_usuarios_email` (`email`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,1,'Jeffry','Campos','admin@muebles.com','20.210.529-7',NULL,'$2b$10$KNh4Myb0Kb7C2BGVFjDpWebadzdwnlQr4EJH/FymqRj4yfSb9Y48G','+56 9 3310 5415',1,'[{\"id\":2,\"variantId\":2,\"name\":\"Lámpara de Pie Industrial\",\"image\":\"/uploads/image-1784252665520-536137899.webp\",\"variant\":\"Metal - Negro Mate\",\"price\":\"45000.00\",\"quantity\":2},{\"id\":11,\"variantId\":20,\"name\":\"Alfombra Geométrica \\\"Triana\\\"\",\"image\":\"/uploads/image-1784389919104-9948.webp\",\"variant\":\"Metal - Natural\",\"price\":\"317000.00\",\"quantity\":2}]','[{\"nombre\":\"Mi casa\",\"region\":\"Región de Ñuble\",\"ciudad\":\"Chillán Viejo\",\"direccion\":\"Virrey Don Ambrosio\",\"infoAdicional\":\"664\",\"quienRecibe\":\"jeffry marcel campos martinez\",\"id\":1784265660515},{\"id\":1784266285123,\"nombre\":\"segunda casa\",\"region\":\"Región de Ñuble\",\"ciudad\":\"Chillán Viejo\",\"direccion\":\"Virrey Don Ambrosio\",\"infoAdicional\":\"664\",\"quienRecibe\":\"jeffry marcel campos martinez\"}]','2026-07-17 01:32:37','2026-07-18 16:51:44');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `variantes_producto`
--

DROP TABLE IF EXISTS `variantes_producto`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `variantes_producto` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `producto_id` int(10) unsigned NOT NULL,
  `material` varchar(50) NOT NULL,
  `acabado_color` varchar(50) NOT NULL,
  `sku` varchar(100) NOT NULL,
  `stock` int(10) unsigned DEFAULT 0,
  `precio_especifico` decimal(10,2) DEFAULT NULL,
  `imagen_variante` varchar(500) DEFAULT NULL,
  `galeria` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`galeria`)),
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku` (`sku`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `variantes_producto_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `variantes_producto`
--

LOCK TABLES `variantes_producto` WRITE;
/*!40000 ALTER TABLE `variantes_producto` DISABLE KEYS */;
INSERT INTO `variantes_producto` VALUES (1,1,'Roble/Tela','Madera Natural/Gris','COM-NOR-01',6,850000.00,'/uploads/image-1784388144895-488521914.webp','[\"/uploads/image-1784388144903-518001862.jfif\",\"/uploads/image-1784388144908-984480980.avif\"]'),(2,2,'Metal','Negro Mate','ILU-IND-01',12,45000.00,NULL,NULL),(3,3,'Roble','Blanco','SKU-3-V1',10,1246000.00,'/uploads/image-1784389894631-1366.webp','[]'),(4,3,'Nogal','Negro','SKU-3-V2',5,1218000.00,'/uploads/image-1784389895536-7889.webp','[]'),(5,4,'Nogal','Negro','SKU-4-V1',10,2549000.00,'/uploads/image-1784389897991-6381.webp','[]'),(6,4,'Metal','Gris','SKU-4-V2',5,2545000.00,'/uploads/image-1784389898725-815.webp','[]'),(7,5,'Metal','Gris','SKU-5-V1',10,1826000.00,'/uploads/image-1784389901116-3833.webp','[]'),(8,5,'Cerámica','Natural','SKU-5-V2',5,1844000.00,'/uploads/image-1784389901848-6615.webp','[]'),(9,6,'Cerámica','Natural','SKU-6-V1',10,1546000.00,'/uploads/image-1784389904480-1285.webp','[]'),(10,6,'Vidrio','Cobre','SKU-6-V2',5,1548000.00,'/uploads/image-1784389905242-1856.webp','[]'),(11,7,'Vidrio','Cobre','SKU-7-V1',10,850000.00,'/uploads/image-1784389907866-5266.webp','[]'),(12,7,'Algodón','Dorado','SKU-7-V2',5,857000.00,'/uploads/image-1784389908621-6574.webp','[]'),(13,8,'Algodón','Dorado','SKU-8-V1',10,386000.00,'/uploads/image-1784389911003-4806.webp','[]'),(14,8,'Yute','Blanco','SKU-8-V2',5,360000.00,'/uploads/image-1784389911758-225.webp','[]'),(15,9,'Yute','Blanco','SKU-9-V1',10,322000.00,'/uploads/image-1784389914379-4632.webp','[]'),(16,9,'Roble','Negro','SKU-9-V2',5,311000.00,'/uploads/image-1784389915122-8266.webp','[]'),(17,10,'Roble','Negro','SKU-10-V1',10,451000.00,'/uploads/image-1784389917458-567.webp','[]'),(18,10,'Nogal','Gris','SKU-10-V2',5,430000.00,'/uploads/image-1784389918201-3662.webp','[]'),(19,11,'Nogal','Gris','SKU-11-V1',10,317000.00,'/uploads/image-1784389920599-1220.webp','[]'),(20,11,'Metal','Natural','SKU-11-V2',5,317000.00,'/uploads/image-1784389921330-109.webp','[]'),(21,12,'Metal','Natural','SKU-12-V1',10,193000.00,'/uploads/image-1784389923876-852.webp','[]'),(22,12,'Cerámica','Cobre','SKU-12-V2',5,225000.00,'/uploads/image-1784389924623-9251.webp','[]'),(23,13,'Cerámica','Cobre','SKU-13-V1',10,286000.00,'/uploads/image-1784389926960-6937.webp','[]'),(24,13,'Vidrio','Dorado','SKU-13-V2',5,297000.00,'/uploads/image-1784389927677-8327.webp','[]'),(25,14,'Vidrio','Dorado','SKU-14-V1',10,147000.00,'/uploads/image-1784389930122-4253.webp','[]'),(26,14,'Algodón','Blanco','SKU-14-V2',5,163000.00,'/uploads/image-1784389930876-7809.webp','[]'),(27,15,'Algodón','Blanco','SKU-15-V1',10,187000.00,'/uploads/image-1784389933537-5090.webp','[]'),(28,15,'Yute','Negro','SKU-15-V2',5,157000.00,'/uploads/image-1784389934293-7882.webp','[]'),(29,16,'Yute','Negro','SKU-16-V1',10,110000.00,'/uploads/image-1784389936695-7203.webp','[]'),(30,16,'Roble','Gris','SKU-16-V2',5,90000.00,'/uploads/image-1784389937444-7898.webp','[]'),(31,17,'Roble','Gris','SKU-17-V1',10,110000.00,'/uploads/image-1784389939826-2398.webp','[]'),(32,17,'Nogal','Natural','SKU-17-V2',5,146000.00,'/uploads/image-1784389940551-5913.webp','[]'),(33,18,'Nogal','Natural','SKU-18-V1',10,319000.00,'/uploads/image-1784389943127-483.webp','[]'),(34,18,'Metal','Cobre','SKU-18-V2',5,329000.00,'/uploads/image-1784389943848-1401.webp','[]'),(35,19,'Metal','Cobre','SKU-19-V1',10,126000.00,'/uploads/image-1784389946228-9508.webp','[]'),(36,19,'Cerámica','Dorado','SKU-19-V2',5,134000.00,'/uploads/image-1784389946960-4698.webp','[]'),(37,20,'Cerámica','Dorado','SKU-20-V1',10,184000.00,'/uploads/image-1784389949360-3416.webp','[]'),(38,20,'Vidrio','Blanco','SKU-20-V2',5,207000.00,'/uploads/image-1784389950051-5020.webp','[]');
/*!40000 ALTER TABLE `variantes_producto` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-18 23:05:40
