// import { create } from "zustand";
// import { persist } from "zustand/middleware";

// interface User {
//   _id?: string;
//   email: string;
//   password: string;
// }

// interface UserState {
//   users: User[];
//   currentUser: User | null;
//   loading: boolean;
//   error: string | null;
//   message: string | null;
//   addUser: (newUser: User) => Promise<void>;
//   loginUser: (credentials: { email: string; password: string }) => Promise<void>;
//   logout: () => void;
// }

// export const useUserStore = create<UserState>()(
//   persist(
//     (set, get) => ({
//       users: [],
//       currentUser: null,
//       loading: false,
//       error: null,
//       message: null,

//       addUser: async (newUser) => {
//         set({ loading: true, error: null, message: null });
//         try {
//           const res = await fetch("https://project-final-simon.onrender.com/user", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify(newUser),
//           });

//           if (!res.ok) throw new Error("Failed to add user");
//           const json = await res.json();

//           if (json.success) {
//             set((state) => ({
//               users: [...state.users, json.response],
//               loading: false,
//               error: null,
//               message: json.user,
//             }));
//           } else {
//             set({ loading: false, error: json.user || "Failed to add user", message: null });
//           }
//         } catch (err: any) {
//           set({ loading: false, error: err.message, message: null });
//         }
//       },

//       loginUser: async ({ email, password }) => {
//         set({ loading: true, error: null, message: null });
//         try {
//           const res = await fetch("https://project-final-simon.onrender.com/login", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ email, password }),
//           });

//           if (!res.ok) throw new Error("Login failed");
//           const json = await res.json();

//           if (json.success) {
//             set({
//               currentUser: json.user,
//               loading: false,
//               message: "Login successful",
//             });
//             // You can also store the token separately if needed
//             // localStorage.setItem("token", json.token);
//           } else {
//             set({ loading: false, error: json.message || "Login failed", message: null });
//           }
//         } catch (err: any) {
//           set({ loading: false, error: err.message, message: null });
//         }
//       },

//       logout: () => {
//         set({ currentUser: null, message: "Logged out" });
//         // localStorage.removeItem("token"); // if you're manually storing token
//       },
//     }),
//     {
//       name: "user-storage", // localStorage key
//       partialize: (state) => ({ currentUser: state.currentUser }), // Only persist currentUser
//     }
//   )
// );