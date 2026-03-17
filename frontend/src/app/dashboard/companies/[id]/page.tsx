"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Play, Code, Rocket, Megaphone, ClipboardList, Loader2, Clock, CheckCircle2, XCircle } from "lucide-react";
import { api } from "@/lib/api";

interface Company {
  id: number;
  name: string;
  description: string;
  niche: string;
  status: string;
  tech_stack: string;
  domain: string | null;
  port: number | null;
  revenue: number;
  monthly_visitors: number;
  last_cycle_at: string | null;
  created_at: string;
}

interface Log {
  id: number;
  cycle_number: number;
  phase: string;
  message: string;
  created_at: string;
}

interface Task {
  id: number;
  task_type: string;
  title: string;
  status: string;
  created_at: string;
}

export default function CompanyDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [company, setCompany] = useState<Company | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [running, setRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<"logs" | "tasks">("logs");

  useEffect(() => {
    if (!id) return;
    api.getCompany(id).then(setCompany).catch(console.error);
    api.getCompanyLogs(id).then(setLogs).catch(console.error);
    api.getCompanyTasks(id).then(setTasks).catch(console.error);
  }, [id]);

  const handleRunCycle = async (phases?: string[]) => {
    setRunning(true);
    try {
      await api.runCycle(id, phases);
      // Refresh after a short delay
      setTimeout(() => {
        api.getCompany(id).then(setCompany);
        api.getCompanyLogs(id).then(setLogs);
        api.getCompanyTasks(id).then(setTasks);
        setRunning(false);
      }, 2000);
    } catch (err) {
      console.error(err);
      setRunning(false);
    }
  };

  const phaseIcon: Record<string, React.ReactNode> = {
    plan: <ClipboardList className="w-4 h-4" />,
    code: <Code className="w-4 h-4" />,
    deploy: <Rocket className="w-4 h-4" />,
    market: <Megaphone className="w-4 h-4" />,
  };

  const phaseColor: Record<string, string> = {
    plan: "text-blue-400",
    code: "text-yellow-400",
    deploy: "text-green-400",
    market: "text-purple-400",
  };

  const statusIcon: Record<string, React.ReactNode> = {
    pending: <Clock className="w-4 h-4 text-zinc-500" />,
    running: <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />,
    completed: <CheckCircle2 className="w-4 h-4 text-green-400" />,
    failed: <XCircle className="w-4 h-4 text-red-400" />,
  };

  if (!company) {
    return <div className="text-zinc-500">Loading...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">{company.name}</h1>
          <p className="text-zinc-400 text-sm">{company.description}</p>
          <div className="flex items-center gap-3 mt-3 text-xs text-zinc-500">
            <span>Niche: {company.niche || "General"}</span>
            <span>Stack: {company.tech_stack}</span>
            {company.domain && <span>Domain: {company.domain}</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => handleRunCycle(["plan"])}
            disabled={running}
            className="flex items-center gap-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-600/30 px-3 py-1.5 rounded-lg transition text-sm"
          >
            <ClipboardList className="w-4 h-4" /> Plan
          </button>
          <button
            onClick={() => handleRunCycle(["code"])}
            disabled={running}
            className="flex items-center gap-1.5 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 border border-yellow-600/30 px-3 py-1.5 rounded-lg transition text-sm"
          >
            <Code className="w-4 h-4" /> Code
          </button>
          <button
            onClick={() => handleRunCycle()}
            disabled={running}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg transition text-sm"
          >
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Full Cycle
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Status", value: company.status },
          { label: "Revenue", value: `$${company.revenue.toFixed(0)}` },
          { label: "Visitors", value: company.monthly_visitors.toLocaleString() },
          { label: "Last Cycle", value: company.last_cycle_at ? new Date(company.last_cycle_at).toLocaleDateString() : "Never" },
        ].map((s) => (
          <div key={s.label} className="glass rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-1">{s.label}</div>
            <div className="text-lg font-semibold text-white capitalize">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-zinc-800 mb-6">
        <button
          onClick={() => setActiveTab("logs")}
          className={`pb-3 text-sm font-medium transition ${activeTab === "logs" ? "text-white border-b-2 border-brand-500" : "text-zinc-500 hover:text-zinc-300"}`}
        >
          Agent Logs ({logs.length})
        </button>
        <button
          onClick={() => setActiveTab("tasks")}
          className={`pb-3 text-sm font-medium transition ${activeTab === "tasks" ? "text-white border-b-2 border-brand-500" : "text-zinc-500 hover:text-zinc-300"}`}
        >
          Tasks ({tasks.length})
        </button>
      </div>

      {/* Log Timeline */}
      {activeTab === "logs" && (
        <div className="space-y-3">
          {logs.length === 0 ? (
            <div className="text-center text-zinc-500 py-12">
              No logs yet. Run an agent cycle to get started.
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="glass rounded-lg p-4 flex items-start gap-3">
                <div className={phaseColor[log.phase] || "text-zinc-400"}>
                  {phaseIcon[log.phase] || <ClipboardList className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium uppercase text-zinc-500">
                      Cycle {log.cycle_number} &middot; {log.phase}
                    </span>
                    <span className="text-xs text-zinc-600">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-300 mt-1">{log.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tasks */}
      {activeTab === "tasks" && (
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <div className="text-center text-zinc-500 py-12">
              No tasks yet. Run a planning cycle to generate tasks.
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="glass rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {statusIcon[task.status] || statusIcon.pending}
                  <div>
                    <div className="text-sm font-medium text-white">{task.title}</div>
                    <div className="text-xs text-zinc-500">{task.task_type}</div>
                  </div>
                </div>
                <span className="text-xs text-zinc-500 capitalize">{task.status}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
