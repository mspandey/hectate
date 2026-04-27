const axios = require('axios');

async function testKYC() {
  const url = 'http://localhost:5000/api/kyc/52596605-40f6-469b-b8d0-38f1fbb53e1f';
  const userId = '17750494755540';

  console.log('--- TEST 1: Female Verification (Success) ---');
  try {
    const res1 = await axios.post(url, {
      userId,
      full_name: 'Test Woman',
      id_number: '123456789012',
      document: 'test_doc_female'
    });
    console.log('Success:', res1.data);
  } catch (err) {
    console.error('Failed (unexpectedly):', err.response?.data || err.message);
  }

  console.log('\n--- TEST 2: Male Rejection (Gender Policy) ---');
  try {
    const res2 = await axios.post(url, {
      userId,
      full_name: 'Test Man',
      id_number: 'M12345678901',
      document: 'test_doc_male'
    });
    console.log('Success (unexpected):', res2.data);
  } catch (err) {
    console.log('Rejection (expected):', err.response?.data || err.message);
  }
}

testKYC();
