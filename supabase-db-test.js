const fetch = require('node-fetch');

// Define your token here
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxOTBkNzNkNi0xYTNhLTQ1MDMtOTdkMC02NTJhMDkyNzc4YjQiLCJlbWFpbCI6Im1lcmNoYW50QGdtYWlsLmNvbSIsInJvbGUiOiJtZXJjaGFudCIsImlhdCI6MTczMzI5ODY2MSwiZXhwIjoxNzMzMzg1MDYxfQ.Broy8CfI2f7rsSnV_jpBmQ2rKu-G-e0TpFFqFYYY2rY';

async function testEndpoint() {
  try {
    const response = await fetch('http://localhost:3000/api/merchants', {
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

async function runTests() {
  for (let i = 0; i < 40; i++) {
    console.log(`Test ${i + 1}:`);
    await testEndpoint();
    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds between requests
  }
}

runTests();