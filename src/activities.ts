import OpenAI from 'openai';
import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';

const fireworks = new OpenAI({
  apiKey: process.env.FIREWORKS_API_KEY,
  baseURL: 'https://api.fireworks.ai/inference/v1',
});

export async function checkLocalFiles(topic: string): Promise<string[]> {
  console.log(`[DATA_SOURCE] Checking local knowledge base for: "${topic}"...`);
  const knowledgeDir = path.join(process.cwd(), 'knowledge');
  if (!fs.existsSync(knowledgeDir)) {
    return [];
  }

  const files = fs.readdirSync(knowledgeDir);
  const localData: string[] = [];

  for (const file of files) {
    if (file.endsWith('.txt') || file.endsWith('.md')) {
      const content = fs.readFileSync(path.join(knowledgeDir, file), 'utf-8');
      
      // Simple relevance check: if the file contains any key word from the topic, include it.
      const words = topic.toLowerCase().split(' ').filter(w => w.length > 3);
      const isRelevant = words.some(w => content.toLowerCase().includes(w)) || words.length === 0;
      
      if (isRelevant) {
        console.log(`[ANALYSIS] Found relevant local file: ${file}`);
        localData.push(`[Source: Local Document - ${file}]\n${content.substring(0, 2000)}`);
      }
    }
  }

  return localData;
}

export async function searchWeb(query: string): Promise<string[]> {
  const key = process.env.YOU_API_KEY;
  const cleanQuery = query.trim();
  console.log(`[DEBUG] YOU_API_KEY loaded: ${key ? key.substring(0, 8) + '...' : 'MISSING'}`);

  const queries = [cleanQuery, `${cleanQuery} AI developer`].slice(0, 2);
  
  for (const q of queries) {
    console.log(`[DATA_SOURCE] Searching You.com for: "${q}"...`);
    try {
      const response = await axios.get('https://api.you.com/v1/search', {
        params: { query: q },
        headers: { 'X-API-Key': key },
      });

      const hits = response.data.hits || [];
      
      const snippets = hits.map((hit: any) => {
        if (!hit) return '';
        return [
          hit.title,
          hit.description,
          hit.snippet,
          hit.text,
          hit.body,
          ...(hit.snippets || [])
        ].filter(Boolean).join(' ');
      }).filter((s: string) => s.trim().length > 0).slice(0, 5);
      
      if (snippets.length > 0) {
        return snippets;
      } else {
        // Force the raw JSON back to the UI so we can see exactly what the API sent
        return [`API ERROR - RAW JSON: ${JSON.stringify(response.data)}`];
      }
    } catch (err: any) {
      console.error(`[ERROR] Search failed for "${q}":`, err.response?.data || err.message);
      return [`API ERROR - CATCH: ${err.message}`];
    }
  }

  return ['Fatal Error: Search loop exited.'];
}

export async function summarizeResults(articles: string[]): Promise<string> {
  console.log('[AI_ENGINE] Initializing DeepSeek-v4-pro model...');
  console.log('[AI_ENGINE] Processing tokens and cross-referencing findings...');

  const response = await fireworks.chat.completions.create({
    model: 'accounts/fireworks/models/deepseek-v4-pro',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful research assistant. Summarize the provided articles into a concise report.',
      },
      {
        role: 'user',
        content: `Please summarize these findings: ${articles.join('\n')}`,
      },
    ],
  });

  console.log('[AI_ENGINE] Summary generated successfully.');
  return response.choices[0].message.content || 'Failed to generate summary.';
}

export async function saveReportToFile(summary: string): Promise<string> {
  console.log('[STORAGE] Preparing to save report to local disk...');
  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir);
  }
  const fileName = `research_report_${Date.now()}.txt`;
  const filePath = path.join(reportsDir, fileName);
  fs.writeFileSync(filePath, summary);
  console.log(`[STORAGE] Report successfully saved to: ${filePath}`);
  return filePath;
}

export async function sendReport(summary: string): Promise<string> {
  console.log('[NOTIFIER] Finalizing report for delivery...');
  return `REAL AI REPORT:\n\n${summary}`;
}
