"use client";
import Link from "next/link";
import { Zap, Code, Rocket, BarChart3, Bot, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Bot className="w-8 h-8 text-brand-500" />
          <span className="text-xl font-bold">Polsia</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-zinc-400 hover:text-white transition">
            Log in
          </Link>
          <Link
            href="/register"
            className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg transition font-medium"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto text-center px-6 pt-20 pb-16">
        <div className="inline-flex items-center gap-2 bg-brand-600/10 border border-brand-600/20 rounded-full px-4 py-1.5 text-sm text-brand-400 mb-8">
          <Zap className="w-4 h-4" />
          AI-Powered Autonomous Business Builder
        </div>
        <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
          AI that runs your company
          <br />
          <span className="text-brand-500">while you sleep</span>
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
          An autonomous AI agent that plans, codes, deploys, and markets your micro-SaaS business
          — running 24/7 daily cycles so you don&apos;t have to.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/register"
            className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition flex items-center gap-2"
          >
            Start for Free <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="#how-it-works"
            className="border border-zinc-700 hover:border-zinc-500 text-zinc-300 px-8 py-3 rounded-lg text-lg transition"
          >
            How it Works
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid grid-cols-3 gap-6">
          {[
            { label: "Active Companies", value: "800+" },
            { label: "Code Commits / Day", value: "2,400+" },
            { label: "Revenue Generated", value: "$700K+" },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-zinc-400 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            {
              icon: <Bot className="w-8 h-8" />,
              title: "1. Pick an Idea",
              desc: "Our AI suggests a viable micro-SaaS idea based on market analysis, or bring your own.",
            },
            {
              icon: <Code className="w-8 h-8" />,
              title: "2. AI Builds It",
              desc: "The agent plans the architecture, generates code, and sets up the full stack automatically.",
            },
            {
              icon: <Rocket className="w-8 h-8" />,
              title: "3. Auto Deploy",
              desc: "Your app gets containerized and deployed with its own domain, database, and email.",
            },
            {
              icon: <BarChart3 className="w-8 h-8" />,
              title: "4. Grow on Autopilot",
              desc: "Daily cycles handle marketing, SEO, bug fixes, and feature updates autonomously.",
            },
          ].map((step) => (
            <div key={step.title} className="glass rounded-xl p-6 text-center">
              <div className="text-brand-500 flex justify-center mb-4">{step.icon}</div>
              <h3 className="font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-zinc-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Simple Pricing</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="glass rounded-xl p-8">
            <h3 className="text-xl font-semibold mb-2">Free</h3>
            <div className="text-4xl font-bold mb-4">$0<span className="text-lg text-zinc-400">/mo</span></div>
            <ul className="space-y-3 text-zinc-400 text-sm mb-8">
              <li>- 5 agent tasks</li>
              <li>- 1 company</li>
              <li>- Basic dashboard</li>
              <li>- Community support</li>
            </ul>
            <Link href="/register" className="block text-center border border-zinc-600 hover:border-zinc-400 rounded-lg py-2 transition">
              Get Started
            </Link>
          </div>
          <div className="glass rounded-xl p-8 border-brand-600/50 ring-1 ring-brand-600/30">
            <h3 className="text-xl font-semibold mb-2">Pro</h3>
            <div className="text-4xl font-bold mb-4">$49<span className="text-lg text-zinc-400">/mo</span></div>
            <ul className="space-y-3 text-zinc-400 text-sm mb-8">
              <li>- 45 agent tasks</li>
              <li>- Unlimited companies</li>
              <li>- Full autonomous cycles</li>
              <li>- Web server + DB + email</li>
              <li>- $5/mo API credits included</li>
              <li>- 20% revenue share</li>
            </ul>
            <Link href="/register" className="block text-center bg-brand-600 hover:bg-brand-700 rounded-lg py-2 transition font-medium">
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-8 text-center text-zinc-500 text-sm">
        <p>Polsia MVP — Built with AI, for AI-run businesses.</p>
      </footer>
    </div>
  );
}
