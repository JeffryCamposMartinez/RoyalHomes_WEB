const { initializeApp, cert } = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');

let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  try {
    serviceAccount = require('./serviceAccountKey.json');
  } catch (error) {
    console.error("No se encontró FIREBASE_SERVICE_ACCOUNT ni serviceAccountKey.json");
  }
}

const app = initializeApp({
  credential: cert(serviceAccount)
});

module.exports = { app, getAuth };
