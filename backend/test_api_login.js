const axios = require('axios');

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:5000/api/admin/auth/login', {
      email: 'admin@hectate.app',
      password: 'Admin@Hectate123'
    });
    console.log('Login successful:', response.data);
  } catch (error) {
    console.log('Login failed:', error.response ? error.response.data : error.message);
  }
}

testLogin();
