import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MockUser {
  email: string;
  password: string;
  name: string;
  role: "user" | "partner";
}

const mockUsers: MockUser[] = [
  { email: "user@yolo.co", password: "user123", name: "Test User", role: "user" },
  { email: "partner@yolo.co", password: "partner123", name: "Partner User", role: "partner" },
  { email: "admin@yolo.co", password: "admin123", name: "Admin User", role: "user" },
];

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "partner";
  avatar?: string;
  createdAt?: string;
  phone?: string;
}

interface AuthStore {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  applyAsPartner: (businessName: string, contactName: string, phone: string, city: string, businessType: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (name: string, phone: string) => void;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        await new Promise((r) => setTimeout(r, 300));
        const found = mockUsers.find((u) => u.email === email && u.password === password);
        if (!found) {
          return { success: false, error: "Invalid email or password" };
        }
        const user: AuthUser = {
          id: "u_" + Math.random().toString(36).slice(2, 8),
          name: found.name,
          email: found.email,
          role: found.role,
          avatar: undefined,
          createdAt: new Date().toISOString(),
        };
        set({ user, isAuthenticated: true });
        return { success: true };
      },

      loginWithGoogle: async () => {
        await new Promise((r) => setTimeout(r, 500));
        const user: AuthUser = {
          id: "u_" + Math.random().toString(36).slice(2, 8),
          name: "Google User",
          email: "google-user@gmail.com",
          role: "user",
          avatar: undefined,
          createdAt: new Date().toISOString(),
        };
        set({ user, isAuthenticated: true });
        return { success: true };
      },

      register: async (name: string, email: string, password: string) => {
        await new Promise((r) => setTimeout(r, 300));
        if (mockUsers.some((u) => u.email === email)) {
          return { success: false, error: "Email already registered" };
        }
        mockUsers.push({ email, password, name, role: "user" });
        const user: AuthUser = {
          id: "u_" + Math.random().toString(36).slice(2, 8),
          name,
          email,
          role: "user",
          avatar: undefined,
          createdAt: new Date().toISOString(),
        };
        set({ user, isAuthenticated: true });
        return { success: true };
      },

      logout: () => set({ user: null, isAuthenticated: false }),

      applyAsPartner: async (_businessName, _contactName, _phone, _city, _businessType) => {
        await new Promise((r) => setTimeout(r, 300));
        const { user } = get();
        if (!user) {
          return { success: false, error: "You must be logged in" };
        }
        set({ user: { ...user, role: "partner" } });
        return { success: true };
      },

      updateProfile: (name: string, phone: string) => {
        const { user } = get();
        if (!user) return;
        set({ user: { ...user, name, phone } });
      },

      resetPassword: async (email: string) => {
        await new Promise((r) => setTimeout(r, 400));
        const exists = mockUsers.some((u) => u.email === email);
        if (!exists) {
          return { success: false, error: "Email not found — vérifie ton adresse" };
        }
        return { success: true };
      },
    }),
    { name: "yolo-auth" }
  )
);
