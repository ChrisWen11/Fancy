"use client";
import { create } from "zustand";
import { api } from "@/lib/api";

interface User {
  id: number;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_paid: boolean;
  tasks_used: number;
  total_revenue: number;
  created_at: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),

  login: async (email, password) => {
    const data = await api.login(email, password);
    set({ user: data.user });
  },

  register: async (email, password, fullName) => {
    const data = await api.register(email, password, fullName);
    set({ user: data.user });
  },

  logout: () => {
    api.logout();
    set({ user: null });
  },

  checkAuth: async () => {
    try {
      if (!api.getToken()) {
        set({ loading: false });
        return;
      }
      const user = await api.getMe();
      set({ user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
}));
