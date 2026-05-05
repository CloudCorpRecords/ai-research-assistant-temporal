import OpenAI from 'openai';
import 'dotenv/config';

async function test() {
  const fireworks = new OpenAI({
    apiKey: process.env.FIREWORKS_API_KEY,
    baseURL: 'https://api.fireworks.ai/inference/v1',
  });

  try {
    const response = await fireworks.chat.completions.create({
      model: 'accounts/fireworks/models/llama-v3-8b-instruct',
      messages: [{ role: 'user', content: 'Say hello' }],
    });
    console.log('Success:', response.choices[0].message.content);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
