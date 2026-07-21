const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const billingRoutes = require('./routes/billingRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

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
}
runMigrations();

// Configurar servidor HTTP y Socket.io
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

// Importar lógica de Sockets
require('./socketHandler')(io);

server.listen(PORT, () => {
  console.log(`Backend Profesional corriendo en http://localhost:${PORT}`);
});
