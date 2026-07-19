

async function testCart() {
  console.log("1. Logging in...");
  const loginRes = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@muebles.com', password: '123456' })
  });
  const loginData = await loginRes.json();
  console.log("Login data:", loginData);

  const token = loginData.accessToken;

  console.log("2. Syncing cart to [ { id: 1, name: 'Test' } ]");
  const syncRes = await fetch('http://localhost:3001/api/auth/sync-cart', {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ cart: [ { id: 1, name: 'Test' } ] })
  });
  const syncData = await syncRes.json();
  console.log("Sync response:", syncData);

  console.log("3. Logging in again to see if cart persisted...");
  const loginRes2 = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@muebles.com', password: '123456' })
  });
  const loginData2 = await loginRes2.json();
  console.log("Login data 2 (cart should have 1 item):", loginData2.cart);

}

testCart().catch(console.error);
