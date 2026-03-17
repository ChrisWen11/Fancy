import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Polsia MVP — AI That Runs Your Company",
  description: "Autonomous AI agent that plans, codes, deploys, and markets your micro-SaaS business.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0a0f] text-zinc-200 antialiased">
        {children}
      </body>
    </html>
  );
}
