const billingController = require('./controllers/billingController');

const req = {
    body: {
        invoiceIds: [1]
    }
};

const res = {
    status: function(code) {
        console.log('Status:', code);
        return this;
    },
    json: function(data) {
        console.log('Response JSON:', data);
    }
};

// Mock billingDb
const billingDb = require('./config/billingDb');
// We can just run the controller directly because it connects to the real DB 
// using the config which connects to the remote DB!

billingController.createPreference(req, res).then(() => {
    console.log('Done');
}).catch(console.error);
