const BASE_URL = 'http://localhost:5000/api/products';
const API_KEY  = process.env.API_KEY || 'sk-abc123xyz789';

const headers = {
  'Content-Type': 'application/json',
  'x-api-key': API_KEY,
};

let createdId = null;
let passed    = 0;
let failed    = 0;

const check = (label, condition, detail = '') => {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.log(`  ✗ ${label} ${detail}`);
    failed++;
  }
};

const run = async () => {
  console.log('\n========================================');
  console.log('   Product Catalog API — Test Suite');
  console.log('========================================\n');

  // ── AUTH TESTS ──────────────────────────────────
  console.log('[ Auth ]');

  let r = await fetch(BASE_URL);
  check('Blocks request with no API key (401)', r.status === 401);

  r = await fetch(BASE_URL, { headers: { 'x-api-key': 'wrongkey' } });
  check('Blocks request with wrong API key (403)', r.status === 403);

  // ── CREATE ───────────────────────────────────────
  console.log('\n[ POST /api/products ]');

  r = await fetch(BASE_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({}),
  });
  check('Rejects empty body (400)', r.status === 400);

  r = await fetch(BASE_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ name: 'Test Product', price: -5, category: 'test' }),
  });
  check('Rejects negative price (400)', r.status === 400);

  r = await fetch(BASE_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name:        'Test Headset',
      description: 'A test product',
      price:       49.99,
      category:    'electronics',
      stock:       10,
      sku:         'TEST-001',
    }),
  });
  const created = await r.json();
  check('Creates valid product (201)', r.status === 201);
  check('Returns product data',        created.data?.name === 'Test Headset');
  createdId = created.data?._id;

  r = await fetch(BASE_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name:     'Duplicate SKU',
      price:    10,
      category: 'test',
      sku:      'TEST-001',
    }),
  });
  check('Rejects duplicate SKU (400)', r.status === 400);

  // ── READ ─────────────────────────────────────────
  console.log('\n[ GET /api/products ]');

  r = await fetch(`${BASE_URL}`, { headers });
  const all = await r.json();
  check('Gets all products (200)',        r.status === 200);
  check('Returns pagination metadata',   all.totalPages !== undefined);
  check('Returns count',                 all.count !== undefined);

  r = await fetch(`${BASE_URL}?category=electronics`, { headers });
  const byCategory = await r.json();
  check('Filters by category',           byCategory.data?.every(p => p.category === 'electronics'));

  r = await fetch(`${BASE_URL}?minPrice=40&maxPrice=60`, { headers });
  const byPrice = await r.json();
  check('Filters by price range',        byPrice.data?.every(p => p.price >= 40 && p.price <= 60));

  r = await fetch(`${BASE_URL}?sort=price_asc`, { headers });
  const sorted = await r.json();
  const prices = sorted.data?.map(p => p.price) || [];
  check('Sorts by price ascending',      prices.every((p, i) => i === 0 || p >= prices[i - 1]));

  r = await fetch(`${BASE_URL}?page=1&limit=2`, { headers });
  const paginated = await r.json();
  check('Paginates results',             paginated.data?.length <= 2);
  check('Returns correct page number',   paginated.page === 1);

  r = await fetch(`${BASE_URL}?sort=invalid`, { headers });
  check('Rejects invalid sort (400)',    r.status === 400);

  // ── READ SINGLE ──────────────────────────────────
  console.log('\n[ GET /api/products/:id ]');

  r = await fetch(`${BASE_URL}/${createdId}`, { headers });
  const single = await r.json();
  check('Gets product by ID (200)',      r.status === 200);
  check('Returns correct product',       single.data?._id === createdId);

  r = await fetch(`${BASE_URL}/000000000000000000000000`, { headers });
  check('Returns 404 for missing ID',    r.status === 404);

  r = await fetch(`${BASE_URL}/not-a-valid-id`, { headers });
  check('Handles invalid ID format',     r.status === 500 || r.status === 400);

  // ── UPDATE ───────────────────────────────────────
  console.log('\n[ PUT /api/products/:id ]');

  r = await fetch(`${BASE_URL}/${createdId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ price: 59.99, stock: 20 }),
  });
  const updated = await r.json();
  check('Updates product (200)',         r.status === 200);
  check('Price was updated',             updated.data?.price === 59.99);
  check('Stock was updated',             updated.data?.stock === 20);

  r = await fetch(`${BASE_URL}/${createdId}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ price: -100 }),
  });
  check('Rejects negative price update (400)', r.status === 400);

  // ── STATS ────────────────────────────────────────
  console.log('\n[ GET /api/products/stats ]');

  r = await fetch(`${BASE_URL}/stats/category`, { headers });
  const catStats = await r.json();
  check('Gets category stats (200)',     r.status === 200);
  check('Stats have category field',     catStats.data?.[0]?.category !== undefined);
  check('Stats have avgPrice field',     catStats.data?.[0]?.avgPrice !== undefined);

  r = await fetch(`${BASE_URL}/stats/price`, { headers });
  const priceStats = await r.json();
  check('Gets price stats (200)',        r.status === 200);
  check('Price buckets returned',        Array.isArray(priceStats.data));

  // ── DELETE ───────────────────────────────────────
  console.log('\n[ DELETE /api/products/:id ]');

  r = await fetch(`${BASE_URL}/${createdId}`, {
    method: 'DELETE',
    headers,
  });
  check('Deletes product (200)',         r.status === 200);

  r = await fetch(`${BASE_URL}/${createdId}`, { headers });
  check('Deleted product not in GET',    r.status === 404);

  // ── SUMMARY ──────────────────────────────────────
  console.log('\n========================================');
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log('========================================\n');
};

run().catch(console.error);