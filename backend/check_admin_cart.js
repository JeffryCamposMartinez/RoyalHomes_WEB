const db = require('./config/db');

async function checkCart() {
  const [users] = await db.query("SELECT id, nombre, email, carrito FROM usuarios WHERE id = 1");
  console.log(users);
  process.exit(0);
}

checkCart();
