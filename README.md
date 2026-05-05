# AI Research Assistant (Stage-Ready Demo)

A production-grade, durable AI Research Assistant built to demonstrate the power of resilient workflows. This application isn't just a chatbot; it's a fully automated, fault-tolerant research pipeline that combines live internet searches and local file ingestion to generate comprehensive, professional reports.

## Overview

Designed specifically for stage demonstrations, this project features a unique **split-screen dashboard**:
- **The Product UI (Left)**: A sleek, consumer-facing application where users can launch research tasks and view resulting reports.
- **The Live Backend Feed (Right)**: A matrix-style, real-time feed of Temporal Event History, allowing the audience to "see under the hood" and witness durable execution in action.

## Key Features

*   **Live Web Search**: Integrates the **You.com API** to bypass LLM knowledge cutoffs and fetch real-time data from the internet.
*   **Local Knowledge Base**: Drop any `.txt` or `.md` files into the `knowledge/` directory, and the AI will automatically read and synthesize them alongside web results.
*   **Durable Execution**: Powered by **Temporal.io**. Network failures, API rate limits, or server crashes won't break the research task—it simply retries exactly where it left off.
*   **High-Fidelity Summarization**: Uses **Fireworks AI** (`deepseek-v4-pro`) to cross-reference multiple sources and write clean, structured markdown reports.
*   **Automatic Archival**: Past research reports are saved locally to the `reports/` folder and can be instantly pulled up from the "Recent Projects" tab.

## Technology Stack

*   **Orchestration Engine**: Temporal.io (TypeScript SDK)
*   **API Layer**: Express.js (Acts as the bridge between React and Temporal)
*   **Frontend**: React, Vite, Tailwind CSS, Lucide Icons
*   **Search Engine**: You.com API
*   **AI Model**: Fireworks AI 

## Setup & Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/CloudCorpRecords/ai-research-assistant-temporal.git
   cd ai-research-assistant-temporal
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your API keys:
   ```env
   FIREWORKS_API_KEY=your_fireworks_key_here
   YOU_API_KEY=your_you_com_key_here
   ```

4. **Start Temporal Server**:
   You must have a local Temporal server running.
   ```bash
   temporal server start-dev
   ```

## Running the Demo

To launch the stage-ready demonstration, simply run:

```bash
npm run demo
```

This single command utilizes `concurrently` to launch three services simultaneously:
1. The **Temporal Worker** (`nodemon src/worker.ts`)
2. The **Express API Bridge** (`nodemon src/server.ts`)
3. The **React Frontend** (`cd frontend && npm run dev`)

Once started, navigate to `http://localhost:5173` in your browser.

## Testing the Local Knowledge Base

1. Create a text file in the `knowledge/` folder (e.g., `knowledge/sample.txt`).
2. Write some highly specific or fictitious data inside it.
3. Search for a keyword from that file using the dashboard. 
4. The backend feed will show the `checkLocalFiles` activity firing, and the AI report will include your private, local text.
