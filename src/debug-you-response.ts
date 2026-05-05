import axios from 'axios';
import 'dotenv/config';

async function debug() {
  try {
    const res = await axios.get('https://api.you.com/v1/search', {
      params: { query: 'what is vibe coding' },
      headers: { 'X-API-Key': process.env.YOU_API_KEY }
    });
    console.log('--- FULL API RESPONSE ---');
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err: any) {
    console.error('API Error:', err.response?.status, err.response?.data || err.message);
  }
}

debug();
