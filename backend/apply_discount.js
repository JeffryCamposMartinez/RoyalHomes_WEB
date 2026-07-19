const db = require('./config/db');

async function applyDiscounts() {
  try {
    // Iluminación (categoria_id: 4) -> 20% discount
    await db.query('UPDATE configuracion_portada SET descuento_porcentaje = 20 WHERE categoria_id = 4');
    
    // Mesas y juegos de comedor (categoria_id: 1) -> 15% discount
    await db.query('UPDATE configuracion_portada SET descuento_porcentaje = 15 WHERE categoria_id = 1');
    
    console.log('Discounts applied to DB successfully');
  } catch (err) {
    console.error('Error applying discounts:', err);
  } finally {
    process.exit();
  }
}

applyDiscounts();
