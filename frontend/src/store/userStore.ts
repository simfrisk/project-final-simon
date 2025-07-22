import { create } from "zustand";

interface AuthUser {
  email: string;
  name: string;
  userId: string;
  accessToken: string;
  role: string;
}

interface UserStore {
  user: AuthUser | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  createUser: (name: string, email: string, password: string, role: string) => Promise<boolean>;
}

// Rehydrate user info from localStorage if available
const savedEmail = localStorage.getItem("email");
const savedUserId = localStorage.getItem("userId");
const savedToken = localStorage.getItem("accessToken");
const savedRole = localStorage.getItem("role");
const savedName = localStorage.getItem("name");

const initialUser: AuthUser | null =
  savedEmail && savedUserId && savedToken && savedRole && savedName
    ? {
      email: savedEmail,
      userId: savedUserId,
      role: savedRole,
      accessToken: savedToken,
      name: savedName,
    }
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
        // Make sure backend sends back "name" in the session response
        const user = {
          email,
          userId: data.userId,
          accessToken: data.accessToken,
          role: data.role || "student",
          name: data.name || ""
        };

        // Save to localStorage
        localStorage.setItem("email", email);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("role", user.role);
        localStorage.setItem("name", user.name);

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
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    set({ user: null, isLoggedIn: false });
  },

  createUser: async (name, email, password, role) => {
    try {
      const res = await fetch("https://project-final-simon.onrender.com/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (res.ok && data.accessToken) {
        const user = { email, userId: data.userId, accessToken: data.accessToken, role, name };

        // Save to localStorage
        localStorage.setItem("email", email);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("role", role);
        localStorage.setItem("name", name);

        set({ user, isLoggedIn: true });
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error("Create user failed:", err);
      return false;
    }
  },
}));