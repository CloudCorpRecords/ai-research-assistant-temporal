# Temporal Code Exchange Submission Answers

Here are the exact answers you can copy and paste into the GitHub issue form:

### Add a title
[Submission] Stage-Ready AI Research Assistant

### Project link
https://github.com/CloudCorpRecords/ai-research-assistant-temporal

### Language
TypeScript

### Short description (max 256 chars)
A stage-ready, durable AI Research Assistant that seamlessly orchestrates live web searches and local file ingestion into automated, fault-tolerant pipelines using Temporal and Fireworks AI.

### Long Description
This project is a production-grade AI Research Assistant specifically built to demonstrate the power of resilient workflows to a live audience. It goes beyond standard chatbot interactions by executing long-running, multi-step research tasks that involve:
1. Automatically scanning local directories for private context files.
2. Querying the live internet (via You.com API) for real-time, up-to-date factual data.
3. Synthesizing all the gathered intelligence into a cohesive markdown report using Fireworks AI (`deepseek-v4-pro`).

**What types of problems does it solve?**
It solves the extreme fragility inherent in typical AI agent pipelines. AI applications frequently suffer from unpredictable API timeouts, strict rate limits, and network failures. By orchestrating the AI research pipeline through Temporal, this project guarantees **Durable Execution**. If the web search API fails or the LLM inference times out, Temporal automatically handles the retries and state management without dropping the user's research task or crashing the application.

**Key Demo Features:**
- **Split-Screen Dashboard**: A sleek React/Vite frontend featuring a consumer-facing product UI on the left and a matrix-style "Live Backend Feed" of Temporal Event History on the right. This perfectly visualizes durable execution for audiences under the hood.
- **Local Knowledge Base**: Ingests private documents seamlessly before hitting the web.
- **Recent Projects History**: Automatically archives and instantly retrieves past research reports via an Express.js API bridge.

### Author(s)
CloudCorpRecords
