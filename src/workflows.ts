import { proxyActivities, defineSignal, defineQuery, condition, setHandler } from '@temporalio/workflow';
import type * as activities from './activities';

const { searchWeb, summarizeResults, sendReport, saveReportToFile, checkLocalFiles } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

// Define signals and queries
export const approveSignal = defineSignal('approve');
export const getStatusQuery = defineQuery<string>('getStatus');

export async function researchAssistantWorkflow(topic: string): Promise<string> {
  let isApproved = false;
  let status = 'Initializing';

  setHandler(getStatusQuery, () => status);

  // 1. Research phase
  status = 'Checking local files';
  const localData = await checkLocalFiles(topic);

  status = 'Searching the web';
  const articles = await searchWeb(topic);
  
  status = 'Summarizing results';
  const summary = await summarizeResults([...localData, ...articles]);

  // 2. Action phase
  status = 'Saving report';
  await saveReportToFile(summary);
  
  status = 'Completed';
  return await sendReport(summary);
}
