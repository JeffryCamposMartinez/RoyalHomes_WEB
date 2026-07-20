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

// Auto-migraciones para asegurar que la estructura de la BD esté actualizada en producción
const db = require('./config/db');
async function runMigrations() {
  try {
    await db.query("ALTER TABLE productos ADD COLUMN especificaciones TEXT NULL");
    console.log("Migración exitosa: Columna 'especificaciones' agregada a productos.");
  } catch (e) {
    if (e.code !== 'ER_DUP_FIELDNAME') console.error("Error en migración productos:", e);
  }
  
  try {
    await db.query("ALTER TABLE variantes_producto ADD COLUMN especificaciones TEXT NULL");
    console.log("Migración exitosa: Columna 'especificaciones' agregada a variantes.");
  } catch (e) {
    if (e.code !== 'ER_DUP_FIELDNAME') console.error("Error en migración variantes:", e);
  }
}
runMigrations();

app.listen(PORT, () => {
  console.log(`Backend Profesional corriendo en http://localhost:${PORT}`);
});
