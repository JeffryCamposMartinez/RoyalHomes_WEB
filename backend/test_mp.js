require('dotenv').config({ path: 'c:\\Users\\Jeffry\\Desktop\\catalogo de muebles\\backend\\.env' });
const { MercadoPagoConfig, Preference } = require('mercadopago');

async function testMP() {
  try {
    const client = new MercadoPagoConfig({ accessToken: 'APP_USR-8946320439617951-071916-b3b3ca6ef839fc6f2551bc07ac0331f1-3541788762' });
    const preference = new Preference(client);
    const body = {
      items: [
        {
          id: '1',
          title: 'Test',
          quantity: 1,
          unit_price: 25000,
          currency_id: 'CLP',
        }
      ],
      back_urls: {
        success: "http://localhost:5173",
        failure: "http://localhost:5173",
        pending: "http://localhost:5173"
      },
    };

    const result = await preference.create({ body });
    console.log("SUCCESS:", result.init_point);
  } catch (err) {
    console.error("ERROR:", err);
  }
}

testMP();
