"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { api } from "@/lib/api";

interface Idea {
  name: string;
  description: string;
  niche: string;
  target_audience: string;
  monetization: string;
  tech_stack: string;
}

export default function NewCompanyPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [niche, setNiche] = useState("");
  const [techStack, setTechStack] = useState("nextjs,tailwind,postgres");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [idea, setIdea] = useState<Idea | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    try {
      const result = await api.suggestIdea(niche || undefined);
      setIdea(result);
      setName(result.name);
      setDescription(result.description);
      setNiche(result.niche);
      setTechStack(result.tech_stack);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const company = await api.createCompany({ name, description, niche, tech_stack: techStack });
      router.push(`/dashboard/companies/${company.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Create a New Company</h1>
      <p className="text-zinc-400 mb-8">Let AI suggest an idea or define your own.</p>

      {/* AI Idea Generator */}
      <div className="glass rounded-xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            AI Idea Generator
          </h2>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 border border-yellow-600/30 px-4 py-1.5 rounded-lg transition text-sm"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {generating ? "Generating..." : "Suggest an Idea"}
          </button>
        </div>
        <input
          type="text"
          value={niche}
          onChange={(e) => setNiche(e.target.value)}
          placeholder="Optional: enter a niche (e.g., 'health tech', 'developer tools')"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500 transition"
        />
        {idea && (
          <div className="mt-4 p-4 bg-zinc-900/50 rounded-lg text-sm space-y-2">
            <div><span className="text-zinc-500">Target:</span> {idea.target_audience}</div>
            <div><span className="text-zinc-500">Monetization:</span> {idea.monetization}</div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg p-3 text-sm mb-4">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleCreate} className="space-y-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Company Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-500 transition"
            placeholder="TaskFlow Pro"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-500 transition resize-none"
            placeholder="A brief description of what your company builds..."
          />
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Tech Stack</label>
          <input
            type="text"
            value={techStack}
            onChange={(e) => setTechStack(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-500 transition"
            placeholder="nextjs,tailwind,postgres"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !name}
          className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Create Company
        </button>
      </form>
    </div>
  );
}
