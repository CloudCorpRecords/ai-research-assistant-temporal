import axios from 'axios';
import 'dotenv/config';

async function testYouApi() {
  const query = 'what is vibe coding';
  const key = process.env.YOU_API_KEY;

  if (!key) {
    console.error('ERROR: YOU_API_KEY is not set in .env');
    return;
  }

  console.log(`Testing query: "${query}" with key: ${key.substring(0, 5)}...`);

  try {
    const response = await axios.get('https://api.you.com/v1/search', {
      params: { query },
      headers: { 'X-API-Key': key }
    });

    console.log(`Status: ${response.status}`);
    
    // Check hits
    const hits = response.data.hits || [];
    console.log(`Found ${hits.length} hits`);
    
    if (hits.length > 0) {
      console.log('First hit titles/snippets:');
      hits.forEach((h: any, i: number) => {
        console.log(`  Hit ${i+1}: ${h.title} (Snippets: ${h.snippets?.length || 0})`);
      });
    } else {
      console.log('Full Response Body:', JSON.stringify(response.data, null, 2));
    }

  } catch (err: any) {
    console.error('API Error:', err.response?.status, err.response?.data || err.message);
  }
}

testYouApi();
