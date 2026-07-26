const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const billingRoutes = require('./routes/billingRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Configurar servidor HTTP y Socket.io tempranamente para inyectarlo en req
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173', 
      'http://localhost:4173',
      'https://royalhomes.cl', 
      'https://www.royalhomes.cl'
    ],
    methods: ['GET', 'POST']
  }
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:4173',
    'https://royalhomes.cl', 
    'https://www.royalhomes.cl'
  ],
  credentials: true
}));
app.use(express.json());

// Rutas desacopladas (Clean Architecture)
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/notifications', notificationRoutes);

// Servir archivos estáticos de la carpeta uploads y Publicidad
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/Publicidad', express.static(path.join(__dirname, 'Publicidad')));

// Auto-migraciones
const db = require('./config/db');
async function runMigrations() {
  try {
    await db.query("ALTER TABLE productos ADD COLUMN especificaciones TEXT NULL");
    console.log("Migración exitosa: Columna 'especificaciones' agregada a productos.");
  } catch (e) {
    if (e.code !== 'ER_DUP_FIELDNAME') console.error("Error en migración productos:", e);
  }

  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS notificaciones (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario_id INT NOT NULL,
        mensaje TEXT NOT NULL,
        tipo VARCHAR(50) DEFAULT 'info',
        leida BOOLEAN DEFAULT FALSE,
        referencia_id INT NULL,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("Migración exitosa: Tabla 'notificaciones' verificada/creada.");
  } catch (e) {
    console.error("Error en migración notificaciones:", e);
  }
}
runMigrations();

// Importar lógica de Sockets
require('./socketHandler')(io);

server.listen(PORT, () => {
  console.log(`Backend Profesional corriendo en http://localhost:${PORT}`);
});
