const { MercadoPagoConfig, Preference } = require('mercadopago');
const dotenv = require('dotenv');
dotenv.config();

async function testCreatePreference() {
  const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || 'APP_USR-171952012324667-071916-43e936144d64f264c3f88b589c165361-1840749678' });
  const preference = new Preference(client);

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const backendUrl = process.env.PUBLIC_BACKEND_URL || "http://localhost:3001";

  const body = {
      items: [
          {
              id: '123',
              title: 'Mensualidad',
              quantity: 1,
              unit_price: 100,
              currency_id: 'CLP',
          }
      ],
      back_urls: {
          success: `${frontendUrl}/admin?payment=success`,
          failure: `${frontendUrl}/admin?payment=failure`,
          pending: `${frontendUrl}/admin?payment=pending`
      },
      auto_return: 'approved',
      notification_url: `${backendUrl}/api/billing/webhook/mercadopago`
  };

  try {
      const result = await preference.create({ body });
      console.log('Success:', result.id);
  } catch (err) {
      console.error('Error creating MP preference:', err);
  }
}

testCreatePreference();
