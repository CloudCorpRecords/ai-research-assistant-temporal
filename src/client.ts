import { Connection, Client } from '@temporalio/client';
import { loadClientConnectConfig } from '@temporalio/envconfig';
import { researchAssistantWorkflow } from './workflows';

async function run() {
  const config = loadClientConnectConfig();
  const connection = await Connection.connect(config.connectionOptions);
  const client = new Client({ connection });

  const workflowId = 'research-assistant-id';

  const handle = await client.workflow.start(researchAssistantWorkflow, {
    taskQueue: 'hello-world',
    args: ['Temporal.io'],
    workflowId,
  });
  console.log(`Started Research Assistant Workflow: ${handle.workflowId}`);
  console.log(`Open the UI to see it waiting for approval: http://localhost:8233`);

  // Wait for the final result (this will block until you run the approve script)
  const result = await handle.result();
  console.log(`Final Result: ${result}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
