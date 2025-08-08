import { create } from "zustand";
import { baseUrl } from "../config/api";

interface AuthUser {
  email: string;
  name: string;
  userId: string;
  accessToken: string;
  role: string;
  profileImage: string;
}

interface UserStore {
  user: AuthUser | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  createUser: (formData: FormData) => Promise<boolean>;
}

// Rehydrate user info from localStorage if available
const savedEmail = localStorage.getItem("email");
const savedUserId = localStorage.getItem("userId");
const savedToken = localStorage.getItem("accessToken");
const savedRole = localStorage.getItem("role");
const savedName = localStorage.getItem("name");
const savedProfileImage = localStorage.getItem("profileImage");

const initialUser: AuthUser | null =
  savedEmail &&
    savedUserId &&
    savedToken &&
    savedRole &&
    savedName &&
    savedProfileImage
    ? {
      email: savedEmail,
      userId: savedUserId,
      role: savedRole,
      accessToken: savedToken,
      name: savedName,
      profileImage: savedProfileImage,
    }
    : null;

export const useUserStore = create<UserStore>((set) => ({
  user: initialUser,
  isLoggedIn: !!initialUser,

  login: async (email, password) => {
    try {
      const res = await fetch(`${baseUrl}/session`, {
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
          name: data.name || "",
          profileImage: data.profileImage || "/SImon.png",
        };

        // Save to localStorage
        localStorage.setItem("email", email);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("role", user.role);
        localStorage.setItem("name", user.name);
        localStorage.setItem("profileImage", user.profileImage);

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
    localStorage.removeItem("profileImage");
    set({ user: null, isLoggedIn: false });
  },

  createUser: async (formData: FormData) => {
    try {
      const res = await fetch(`${baseUrl}/user`, {
        method: "POST",
        body: formData, // No need to set headers manually for FormData
      });

      const data = await res.json();

      if (res.ok && data.accessToken) {
        const user = {
          email: formData.get("email") as string,
          userId: data.userId,
          accessToken: data.accessToken,
          role: formData.get("role") as string,
          name: formData.get("name") as string,
          profileImage: data.profileImage,
        };

        // Save to localStorage
        localStorage.setItem("email", user.email);
        localStorage.setItem("userId", user.userId);
        localStorage.setItem("accessToken", user.accessToken);
        localStorage.setItem("role", user.role);
        localStorage.setItem("name", user.name);
        localStorage.setItem("profileImage", user.profileImage);

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