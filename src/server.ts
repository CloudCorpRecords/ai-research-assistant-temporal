import express from 'express';
import cors from 'cors';
import * as fs from 'fs';
import * as path from 'path';
import { Connection, Client } from '@temporalio/client';
import { loadClientConnectConfig } from '@temporalio/envconfig';
import { researchAssistantWorkflow, getStatusQuery, approveSignal } from './workflows';

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const config = loadClientConnectConfig();
  const connection = await Connection.connect(config.connectionOptions);
  const client = new Client({ connection });

  // Start a new research workflow
  app.post('/api/research', async (req, res) => {
    const { topic } = req.body;
    try {
      const workflowId = `research-${Date.now()}`;
      const handle = await client.workflow.start(researchAssistantWorkflow, {
        taskQueue: 'hello-world',
        args: [topic],
        workflowId,
      });
      res.json({ workflowId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to start research' });
    }
  });

  // Get status and results of a research workflow
  app.get('/api/research/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const handle = client.workflow.getHandle(id);
      const description = await handle.describe();
      
      let status = 'Unknown';
      let result = null;

      if (description.status.name === 'RUNNING') {
        status = await handle.query(getStatusQuery);
      } else if (description.status.name === 'COMPLETED') {
        status = 'Completed';
        result = await handle.result();
      } else {
        status = description.status.name;
      }

      res.json({ status, result });
    } catch (err) {
      res.status(404).json({ error: 'Workflow not found' });
    }
  });

  // Approve a research workflow
  app.post('/api/research/:id/approve', async (req, res) => {
    const { id } = req.params;
    try {
      const handle = client.workflow.getHandle(id);
      await handle.signal(approveSignal);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to signal workflow' });
    }
  });

  // Get Event History (The "Raw Data" for the demo)
  app.get('/api/research/:id/history', async (req, res) => {
    const { id } = req.params;
    try {
      const handle = client.workflow.getHandle(id);
      const history = await handle.fetchHistory();
      res.json(history.events);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch history' });
    }
  });

  // Get all past reports
  app.get('/api/reports', (req, res) => {
    try {
      const reportsDir = path.join(process.cwd(), 'reports');
      if (!fs.existsSync(reportsDir)) {
        return res.json([]);
      }
      
      const files = fs.readdirSync(reportsDir).filter(f => f.endsWith('.txt'));
      const reports = files.map(filename => {
        const filePath = path.join(reportsDir, filename);
        const stats = fs.statSync(filePath);
        return {
          filename,
          timestamp: stats.mtimeMs,
          date: new Date(stats.mtimeMs).toLocaleString()
        };
      }).sort((a, b) => b.timestamp - a.timestamp); // Newest first
      
      res.json(reports);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch reports' });
    }
  });

  // Get specific report content
  app.get('/api/reports/:filename', (req, res) => {
    try {
      const { filename } = req.params;
      const filePath = path.join(process.cwd(), 'reports', filename);
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Report not found' });
      }
      
      const content = fs.readFileSync(filePath, 'utf-8');
      res.json({ content });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to read report' });
    }
  });

  const PORT = 3001;
  app.listen(PORT, () => {
    console.log(`Backend API running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error(err);
  process.exit(1);
});
