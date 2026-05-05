import OpenAI from 'openai';
import 'dotenv/config';

async function listModels() {
  const fireworks = new OpenAI({
    apiKey: process.env.FIREWORKS_API_KEY,
    baseURL: 'https://api.fireworks.ai/inference/v1',
  });

  try {
    const list = await fireworks.models.list();
    console.log('Available models:');
    list.data.forEach(m => console.log(m.id));
  } catch (err) {
    console.error('Error:', err);
  }
}

listModels();
