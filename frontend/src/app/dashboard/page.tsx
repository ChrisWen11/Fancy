"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, DollarSign, CheckCircle2, Zap, Plus, Play } from "lucide-react";
import { api } from "@/lib/api";

interface Stats {
  total_companies: number;
  active_companies: number;
  total_revenue: number;
  tasks_completed: number;
  tasks_remaining: number;
}

interface Company {
  id: number;
  name: string;
  status: string;
  revenue: number;
  last_cycle_at: string | null;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [runningAll, setRunningAll] = useState(false);

  useEffect(() => {
    api.getDashboardStats().then(setStats).catch(console.error);
    api.listCompanies().then(setCompanies).catch(console.error);
  }, []);

  const handleRunAll = async () => {
    setRunningAll(true);
    try {
      await api.runAllCycles();
    } catch (err) {
      console.error(err);
    } finally {
      setRunningAll(false);
    }
  };

  const statusColor: Record<string, string> = {
    idea: "bg-zinc-600",
    planning: "bg-blue-600",
    building: "bg-yellow-600",
    deployed: "bg-green-600",
    marketing: "bg-purple-600",
    active: "bg-emerald-500",
    paused: "bg-zinc-500",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-3">
          <button
            onClick={handleRunAll}
            disabled={runningAll}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition text-sm"
          >
            <Play className="w-4 h-4" />
            {runningAll ? "Running..." : "Run All Cycles"}
          </button>
          <Link
            href="/dashboard/companies/new"
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg transition text-sm"
          >
            <Plus className="w-4 h-4" />
            New Company
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Companies", value: stats.total_companies, icon: <Building2 className="w-5 h-5" />, color: "text-brand-400" },
            { label: "Active", value: stats.active_companies, icon: <Zap className="w-5 h-5" />, color: "text-emerald-400" },
            { label: "Revenue", value: `$${stats.total_revenue.toFixed(0)}`, icon: <DollarSign className="w-5 h-5" />, color: "text-yellow-400" },
            { label: "Tasks Left", value: stats.tasks_remaining, icon: <CheckCircle2 className="w-5 h-5" />, color: "text-purple-400" },
          ].map((card) => (
            <div key={card.label} className="glass rounded-xl p-5">
              <div className={`${card.color} mb-2`}>{card.icon}</div>
              <div className="text-2xl font-bold text-white">{card.value}</div>
              <div className="text-sm text-zinc-500">{card.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Companies List */}
      <div className="glass rounded-xl">
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="font-semibold">Your Companies</h2>
        </div>
        {companies.length === 0 ? (
          <div className="p-12 text-center text-zinc-500">
            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No companies yet. Create your first AI-run company!</p>
            <Link
              href="/dashboard/companies/new"
              className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg transition text-sm mt-4"
            >
              <Plus className="w-4 h-4" /> Create Company
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {companies.map((company) => (
              <Link
                key={company.id}
                href={`/dashboard/companies/${company.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-zinc-800/30 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-brand-600/20 flex items-center justify-center text-brand-400 font-medium">
                    {company.name[0]}
                  </div>
                  <div>
                    <div className="font-medium text-white">{company.name}</div>
                    <div className="text-xs text-zinc-500">
                      Last cycle: {company.last_cycle_at ? new Date(company.last_cycle_at).toLocaleDateString() : "Never"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-zinc-400">${company.revenue.toFixed(0)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full text-white ${statusColor[company.status] || "bg-zinc-600"}`}>
                    {company.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
