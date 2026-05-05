import axios from 'axios';
import 'dotenv/config';

async function test() {
  try {
    const response = await axios.get('https://api.ydc-index.io/search', {
      params: { query: 'who is rene turcios' },
      headers: {
        'X-API-Key': process.env.YOU_API_KEY,
      },
    });
    console.log('Success:', JSON.stringify(response.data, null, 2).slice(0, 500));
  } catch (err: any) {
    console.error('Error:', err.response?.data || err.message);
  }
}

test();
