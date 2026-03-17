"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bot, LayoutDashboard, Building2, Settings, LogOut, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, checkAuth, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-zinc-500">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 p-4 flex flex-col">
        <div className="flex items-center gap-2 mb-8">
          <Bot className="w-7 h-7 text-brand-500" />
          <span className="text-lg font-bold">Polsia</span>
        </div>

        <nav className="flex-1 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link
            href="/dashboard/companies"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition"
          >
            <Building2 className="w-5 h-5" />
            Companies
          </Link>
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition"
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
        </nav>

        {/* User section */}
        <div className="border-t border-zinc-800 pt-4 mt-4">
          <div className="flex items-center gap-3 px-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-brand-600/20 flex items-center justify-center text-brand-400 text-sm font-medium">
              {user.email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white truncate">{user.full_name || user.email}</div>
              <div className="text-xs text-zinc-500 flex items-center gap-1">
                {user.is_paid ? (
                  <><Zap className="w-3 h-3 text-yellow-400" /> Pro</>
                ) : (
                  "Free"
                )}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800/50 transition w-full"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
