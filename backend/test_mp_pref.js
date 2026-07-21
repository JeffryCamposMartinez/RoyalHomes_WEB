require('dotenv').config();
const { MercadoPagoConfig, Preference } = require('mercadopago');

async function testMP() {
  try {
     const client = new MercadoPagoConfig({ accessToken: 'APP_USR-171952012324667-071916-43e936144d64f264c3f88b589c165361-1840749678' });
     const preference = new Preference(client);

     const body = {
         items: [
             {
                 id: '123',
                 title: 'Test',
                 quantity: 1,
                 unit_price: 100,
                 currency_id: 'CLP',
             }
         ],
         back_urls: {
             success: `https://royalhomes.cl/admin?payment=success`,
             failure: `https://royalhomes.cl/admin?payment=failure`,
             pending: `https://royalhomes.cl/admin?payment=pending`
         },
         auto_return: 'approved',
         notification_url: `https://api.royalhomes.cl/api/billing/webhook/mercadopago`
     };

     const result = await preference.create({ body });
     console.log('Success:', result.id);
  } catch (err) {
     console.error('Error:', err.message || err);
     if (err.cause) console.error('Cause:', err.cause);
     if (err.response) console.error('Response:', err.response);
  }
}

testMP();
