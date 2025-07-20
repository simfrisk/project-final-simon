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

// Rehydrate user info from localStorage if available
const savedEmail = localStorage.getItem("email");
const savedUserId = localStorage.getItem("userId");
const savedToken = localStorage.getItem("accessToken");

const initialUser: AuthUser | null =
  savedEmail && savedUserId && savedToken
    ? { email: savedEmail, userId: savedUserId, accessToken: savedToken }
    : null;

export const useUserStore = create<UserStore>((set) => ({
  user: initialUser,
  isLoggedIn: !!initialUser,

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
        // Save to localStorage
        localStorage.setItem("email", email);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("accessToken", data.accessToken);
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
    localStorage.removeItem("email");
    localStorage.removeItem("userId");
    localStorage.removeItem("accessToken");
    set({ user: null, isLoggedIn: false });
  },
}));