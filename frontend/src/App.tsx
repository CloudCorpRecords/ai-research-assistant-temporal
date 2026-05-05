import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Terminal, 
  CheckCircle2, 
  Loader2, 
  Send, 
  FileText, 
  ChevronRight,
  Database,
  ShieldCheck,
  Zap,
  Clock
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const API_BASE = 'http://localhost:3001/api';

export default function App() {
  const [topic, setTopic] = useState('');
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isResearching, setIsResearching] = useState(false);
  const historyEndRef = useRef<HTMLDivElement>(null);

  const [pastReports, setPastReports] = useState<any[]>([]);

  const fetchPastReports = async () => {
    try {
      const res = await fetch(`${API_BASE}/reports`);
      const data = await res.json();
      setPastReports(data.slice(0, 5)); // Keep top 5
    } catch (err) {
      console.error('Failed to fetch past reports', err);
    }
  };

  useEffect(() => {
    fetchPastReports();
  }, []);

  // Poll for status and history
  useEffect(() => {
    let interval: any;
    if (workflowId && status !== 'Completed' && !workflowId.endsWith('.txt')) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE}/research/${workflowId}`);
          const data = await res.json();
          setStatus(data.status);
          if (data.result) {
            setResult(data.result);
            fetchPastReports(); // Refresh list when a new report finishes
          }

          const histRes = await fetch(`${API_BASE}/research/${workflowId}/history`);
          const histData = await histRes.json();
          setHistory(histData);
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [workflowId, status]);

  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const startResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic) return;

    setIsResearching(true);
    setResult(null);
    setStatus('Initializing');
    setHistory([]);
    
    try {
      const res = await fetch(`${API_BASE}/research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      setWorkflowId(data.workflowId);
    } catch (err) {
      console.error('Start research error:', err);
      setIsResearching(false);
    }
  };

  const approve = async () => {
    if (!workflowId) return;
    try {
      await fetch(`${API_BASE}/research/${workflowId}/approve`, { method: 'POST' });
    } catch (err) {
      console.error('Approve error:', err);
    }
  };

  const loadPastReport = async (filename: string) => {
    try {
      const res = await fetch(`${API_BASE}/reports/${filename}`);
      const data = await res.json();
      setResult(data.content);
      setStatus('Completed');
      setWorkflowId(filename); // Set to filename so polling stops
      setHistory([]); // Clear live feed for past runs
    } catch (err) {
      console.error('Load past report error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-gray-100 font-sans p-6 selection:bg-purple-500/30">
      <header className="max-w-7xl mx-auto flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600 rounded-lg shadow-lg shadow-purple-600/20">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">AI Research <span className="text-purple-500 text-sm font-medium ml-1 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 uppercase tracking-widest">Assistant</span></h1>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Temporal Server: Online
          </div>
          <div className="h-4 w-px bg-gray-800" />
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            Durable Execution Active
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
        {/* Left Side: Product Interface */}
        <section className="flex flex-col gap-6">
          <div className="bg-[#1a1c23] rounded-2xl border border-gray-800 p-6 shadow-xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-purple-400" /> New Research Project
            </h2>
            <form onSubmit={startResearch} className="relative">
              <input 
                type="text" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What would you like to research today?"
                className="w-full bg-[#0f1117] border border-gray-700 rounded-xl px-4 py-4 pr-16 focus:outline-none focus:border-purple-500 transition-colors text-lg"
                disabled={isResearching && status !== 'Completed'}
              />
              <button 
                type="submit"
                disabled={!topic || (isResearching && status !== 'Completed')}
                className="absolute right-2 top-2 bottom-2 px-4 bg-purple-600 rounded-lg hover:bg-purple-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="bg-[#1a1c23] rounded-2xl border border-gray-800 p-6 shadow-xl">
            <h2 className="text-sm font-bold flex items-center gap-2 text-purple-400 uppercase tracking-widest mb-4">
              <Clock className="w-4 h-4" /> Recent Projects
            </h2>
            <div className="flex flex-col gap-2">
              {pastReports.length === 0 ? (
                <div className="text-gray-500 text-sm italic">No past reports found.</div>
              ) : (
                pastReports.map((r, i) => (
                  <button 
                    key={i}
                    onClick={() => loadPastReport(r.filename)}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#0f1117] border border-gray-800 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-gray-500 group-hover:text-purple-400 transition-colors" />
                      <span className="text-gray-300 font-medium truncate max-w-[200px]">
                        {r.filename.replace('research_report_', 'Project_').replace('.txt', '')}
                      </span>
                    </div>
                    <span className="text-xs text-gray-600 truncate max-w-[120px]">{r.date}</span>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="bg-[#1a1c23] rounded-2xl border border-gray-800 p-6 shadow-xl flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-400" /> Analysis & Insights
              </h2>
              {status && (
                <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-xs font-medium text-purple-400 uppercase tracking-widest">
                  {status === 'Waiting for approval' ? (
                    <span className="flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Pending Approval</span>
                  ) : status === 'Completed' ? (
                    <span className="flex items-center gap-1 text-green-400"><CheckCircle2 className="w-3 h-3" /> Ready</span>
                  ) : (
                    <span className="flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> {status}</span>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {!workflowId ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-600 text-center p-8">
                  <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                    <Database className="w-8 h-8 opacity-20" />
                  </div>
                  <p>Start a new project to see the AI agent in action.</p>
                </div>
              ) : status === 'Completed' && result ? (
                <div className="space-y-6 animate-in fade-in duration-700">
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-lg">
                      {result.replace('REAL AI REPORT:', '').trim()}
                    </p>
                  </div>
                  <button className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl font-bold text-white shadow-lg shadow-purple-600/20 hover:scale-[1.02] active:scale-[0.98] transition-transform">
                    Download Full PDF Report
                  </button>
                </div>
              ) : status === 'Waiting for approval' ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-purple-500/5 border border-dashed border-purple-500/20 rounded-xl">
                  <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-4 text-purple-400">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Research Complete</h3>
                  <p className="text-gray-400 mb-8 max-w-xs">The AI agent has finished its work. Please review and approve the findings to proceed.</p>
                  <button 
                    onClick={approve}
                    className="px-12 py-4 bg-white text-[#0f1117] rounded-xl font-black text-lg hover:bg-gray-200 transition-colors shadow-2xl"
                  >
                    APPROVE REPORT
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="h-4 bg-gray-800 rounded-full w-3/4 animate-pulse" />
                  <div className="h-4 bg-gray-800 rounded-full w-1/2 animate-pulse" />
                  <div className="h-4 bg-gray-800 rounded-full w-5/6 animate-pulse" />
                  <div className="h-4 bg-gray-800 rounded-full w-2/3 animate-pulse" />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Right Side: Live Backend Feed */}
        <section className="bg-[#1a1c23] rounded-2xl border border-gray-800 flex flex-col shadow-2xl sticky top-8 h-[calc(100vh-60px)]">
          <div className="p-4 bg-[#23262e] border-b border-gray-800 flex items-center justify-between">
            <h2 className="text-sm font-bold flex items-center gap-2 text-purple-400 uppercase tracking-widest">
              <Terminal className="w-4 h-4" /> Live Backend Feed
            </h2>
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/30" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/30" />
              <div className="w-3 h-3 rounded-full bg-green-500/30" />
            </div>
          </div>
          <div className="flex-1 p-4 font-mono text-[12px] overflow-y-auto bg-[#0a0b0e] space-y-3">
            {history.length === 0 ? (
              <div className="text-gray-700 italic">Waiting for telemetry data...</div>
            ) : (
              history.map((event, index) => (
                <div key={index} className="flex gap-3 group">
                  <span className="text-gray-600 select-none">{String(index + 1).padStart(3, '0')}</span>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                        event.eventType.includes('Workflow') ? "bg-blue-500/20 text-blue-400" :
                        event.eventType.includes('Activity') ? "bg-amber-500/20 text-amber-400" :
                        "bg-purple-500/20 text-purple-400"
                      )}>
                        {event.eventType.replace('EVENT_TYPE_', '')}
                      </span>
                      <span className="text-gray-500 text-[10px]">{new Date(Number(event.eventTime.seconds) * 1000).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-gray-400 group-hover:text-gray-300 transition-colors">
                      {event.activityTaskScheduledEventAttributes?.activityType?.name && (
                        <span>Scheduled activity: <span className="text-amber-300">{event.activityTaskScheduledEventAttributes.activityType.name}</span></span>
                      )}
                      {event.workflowExecutionSignaledEventAttributes?.signalName && (
                        <span className="text-purple-300 font-bold">Received Signal: {event.workflowExecutionSignaledEventAttributes.signalName}</span>
                      )}
                      {!event.activityTaskScheduledEventAttributes?.activityType?.name && !event.workflowExecutionSignaledEventAttributes?.signalName && (
                        <span className="opacity-60">{event.eventType.toLowerCase().replace(/_/g, ' ')} initialized</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={historyEndRef} />
          </div>
          <div className="p-3 bg-[#0a0b0e] border-t border-gray-800/50 flex items-center justify-between text-[10px] text-gray-500">
            <div className="flex items-center gap-4">
              <span>Namespace: default</span>
              <span>TaskQueue: hello-world</span>
            </div>
            <span>v1.17.0</span>
          </div>
        </section>
      </main>
    </div>
  );
}
