"use client";
import { useAuth } from "@/hooks/useAuth";
import { Zap } from "lucide-react";

export default function SettingsPage() {
  const user = useAuth((s) => s.user);

  if (!user) return null;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>

      {/* Account */}
      <div className="glass rounded-xl p-6 mb-6">
        <h2 className="font-semibold mb-4">Account</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-400">Email</span>
            <span className="text-white">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Name</span>
            <span className="text-white">{user.full_name || "Not set"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Plan</span>
            <span className="text-white flex items-center gap-1">
              {user.is_paid ? (
                <><Zap className="w-4 h-4 text-yellow-400" /> Pro</>
              ) : (
                "Free"
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Tasks Used</span>
            <span className="text-white">{user.tasks_used}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Total Revenue</span>
            <span className="text-white">${user.total_revenue.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Upgrade */}
      {!user.is_paid && (
        <div className="glass rounded-xl p-6 border-brand-600/30 ring-1 ring-brand-600/20">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Upgrade to Pro
          </h2>
          <p className="text-sm text-zinc-400 mb-4">
            Get 45 agent tasks, unlimited companies, full autonomous cycles, and dedicated infrastructure.
          </p>
          <button className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-lg transition text-sm font-medium">
            Upgrade — $49/mo
          </button>
        </div>
      )}
    </div>
  );
}
