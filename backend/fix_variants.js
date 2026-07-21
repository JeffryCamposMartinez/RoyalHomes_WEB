const db = require('./config/db');

async function fixVariants() {
  try {
    const [variants] = await db.query('SELECT * FROM variantes_producto WHERE material = "Estándar" AND acabado_color = "Único" AND imagen_variante IS NULL');
    
    for (let variant of variants) {
      const [products] = await db.query('SELECT imagen_base, galeria FROM productos WHERE id = ?', [variant.producto_id]);
      if (products.length > 0) {
        const p = products[0];
        await db.query('UPDATE variantes_producto SET imagen_variante = ?, galeria = ? WHERE id = ?', [p.imagen_base, p.galeria, variant.id]);
        console.log(`Updated variant ${variant.id} for product ${variant.producto_id}`);
      }
    }
    console.log('Done fixing variants.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixVariants();
