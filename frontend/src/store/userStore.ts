import { create } from "zustand";

interface AuthUser {
  email: string;
  userId: string;
  accessToken: string;
}

interface UserStore {
  user: AuthUser | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isLoggedIn: false,

  login: async (email, password) => {
    try {
      const res = await fetch("https://project-final-simon.onrender.com/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.accessToken) {
        const user = { email, userId: data.userId, accessToken: data.accessToken };
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("userId", data.userId);
        set({ user, isLoggedIn: true });
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error("Login failed:", err);
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    set({ user: null, isLoggedIn: false });
  },
}));