const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      if (typeof window !== "undefined") localStorage.setItem("token", token);
    } else {
      if (typeof window !== "undefined") localStorage.removeItem("token");
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("token");
    }
    return this.token;
  }

  private async fetch(path: string, options: RequestInit = {}) {
    const token = this.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

    if (res.status === 401) {
      this.setToken(null);
      if (typeof window !== "undefined") window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({ detail: "Request failed" }));
      throw new Error(error.detail || "Request failed");
    }

    if (res.status === 204) return null;
    return res.json();
  }

  // Auth
  async register(email: string, password: string, fullName?: string) {
    const data = await this.fetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async login(email: string, password: string) {
    const data = await this.fetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async getMe() {
    return this.fetch("/auth/me");
  }

  // Companies
  async listCompanies() {
    return this.fetch("/companies/");
  }

  async createCompany(data: { name: string; description?: string; niche?: string; tech_stack?: string }) {
    return this.fetch("/companies/", { method: "POST", body: JSON.stringify(data) });
  }

  async getCompany(id: number) {
    return this.fetch(`/companies/${id}`);
  }

  async updateCompany(id: number, data: Record<string, any>) {
    return this.fetch(`/companies/${id}`, { method: "PATCH", body: JSON.stringify(data) });
  }

  async deleteCompany(id: number) {
    return this.fetch(`/companies/${id}`, { method: "DELETE" });
  }

  async getCompanyLogs(id: number) {
    return this.fetch(`/companies/${id}/logs`);
  }

  async getCompanyTasks(id: number) {
    return this.fetch(`/companies/${id}/tasks`);
  }

  async getDashboardStats() {
    return this.fetch("/companies/dashboard/stats");
  }

  // Agent
  async suggestIdea(niche?: string) {
    const params = niche ? `?niche=${encodeURIComponent(niche)}` : "";
    return this.fetch(`/agent/suggest-idea${params}`, { method: "POST" });
  }

  async runCycle(companyId: number, phases?: string[]) {
    return this.fetch("/agent/run-cycle", {
      method: "POST",
      body: JSON.stringify({ company_id: companyId, phases }),
    });
  }

  async runAllCycles() {
    return this.fetch("/agent/run-all", { method: "POST" });
  }

  logout() {
    this.setToken(null);
    if (typeof window !== "undefined") window.location.href = "/login";
  }
}

export const api = new ApiClient();
