const http = require('http');
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/orbit-simulator';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const latency = Date.now() - start;
        resolve({ status: res.statusCode, latency, data });
      });
    }).on('error', reject);
  });
}

async function audit() {
  console.log('=== GWD ORBIT SIMULATOR SYSTEM HEALTH AUDIT ===');

  // 1. Database connection check
  console.log('\n[1/3] Database Connection & Collection Integrity Check:');
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('  ✅ Connected to MongoDB:', MONGODB_URI);

    const collections = ['users', 'teams', 'deals', 'teammessages', 'leads', 'notifications'];
    for (const col of collections) {
      const count = await mongoose.connection.collection(col).countDocuments();
      console.log(`  📦 Collection '${col}': ${count} documents`);
    }
  } catch (err) {
    console.error('  ❌ DB Connection Failed:', err.message);
  } finally {
    await mongoose.disconnect();
  }

  // 2. API Endpoints Latency & Health Check
  console.log('\n[2/3] API Endpoints Latency & Response Audit:');
  const endpoints = [
    'http://localhost:3000/api/admin/event',
    'http://localhost:3000/api/scores',
    'http://localhost:3000/api/teams',
  ];

  for (const url of endpoints) {
    try {
      const res = await fetchUrl(url);
      const pass = res.status === 200 && res.latency < 200;
      console.log(`  ${pass ? '✅' : '⚠️'} GET ${url} → Status: ${res.status} | Latency: ${res.latency}ms`);
    } catch (err) {
      console.error(`  ❌ GET ${url} → Error: ${err.message}`);
    }
  }

  console.log('\n=== AUDIT COMPLETE ===');
}

audit();
