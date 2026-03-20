const BASE_URL = 'http://localhost:5000/api/products';
const API_KEY  = 'sk-abc123xyz789';

const headers = {
  'Content-Type': 'application/json',
  'x-api-key': API_KEY,
};

const run = async () => {
  // Test 1: POST empty body
  console.log('\n--- POST empty body ---');
  const r1 = await fetch(BASE_URL, { method: 'POST', headers, body: JSON.stringify({}) });
  console.log('Status:', r1.status);
  console.log('Body:',   await r1.json());

  // Test 2: GET all products
  console.log('\n--- GET all products ---');
  const r2 = await fetch(BASE_URL, { headers });
  console.log('Status:', r2.status);
  console.log('Body:',   await r2.json());
};

run().catch(console.error);