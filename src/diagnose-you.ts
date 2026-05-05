import axios from 'axios';
import 'dotenv/config';

const key = process.env.YOU_API_KEY;

async function diagnose() {
  const variations = [
    { url: 'https://api.ydc-index.io/search', header: 'X-API-Key' },
    { url: 'https://api.ydc-index.io/search', header: 'X-API-KEY' },
    { url: 'https://api.ydc-index.io/news', header: 'X-API-Key' },
    { url: 'https://api.you.com/v1/search', header: 'X-API-Key' },
  ];

  for (const v of variations) {
    try {
      console.log(`Testing: ${v.url} with ${v.header}...`);
      const res = await axios.get(v.url, {
        params: { query: 'test' },
        headers: { [v.header]: key }
      });
      console.log(`✅ SUCCESS with ${v.url} (${v.header})`);
      process.exit(0);
    } catch (err: any) {
      console.log(`❌ FAILED: ${err.response?.status} ${JSON.stringify(err.response?.data)}`);
    }
  }
}

diagnose();
