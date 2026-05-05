import { Connection, Client } from '@temporalio/client';
import { loadClientConnectConfig } from '@temporalio/envconfig';
import { approveSignal } from './workflows';

async function run() {
  const config = loadClientConnectConfig();
  const connection = await Connection.connect(config.connectionOptions);
  const client = new Client({ connection });

  const workflowId = 'research-assistant-id';
  const handle = client.workflow.getHandle(workflowId);

  console.log(`Sending approval signal to workflow: ${workflowId}`);
  await handle.signal(approveSignal);
  console.log('Signal sent! Check the workflow output.');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
