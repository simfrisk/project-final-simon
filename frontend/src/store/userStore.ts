//#region ----- IMPORTS -----
import { create } from "zustand"
import { baseUrl } from "../config/api"
//#endregion

//#region ----- INTERFACES -----
interface AuthUser {
  email: string
  name: string
  userId: string
  accessToken: string
  role: string
  profileImage: string
}

interface UserStore {
  user: AuthUser | null
  isLoggedIn: boolean
  users: AuthUser[] // Add this
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  createUser: (formData: FormData) => Promise<{ success: boolean; message: string }>
  getAllUsers: () => Promise<{ success: boolean; message: string }> // Add this
}
//#endregion

//#region ----- GET USER FROM LOCAL STORAGE -----
const savedEmail = localStorage.getItem("email")
const savedUserId = localStorage.getItem("userId")
const savedToken = localStorage.getItem("accessToken")
const savedRole = localStorage.getItem("role")
const savedName = localStorage.getItem("name")
const savedProfileImage = localStorage.getItem("profileImage")
//#endregion

//#region ----- INITIAL USER -----
const initialUser: AuthUser | null =
  savedEmail && savedUserId && savedToken && savedRole && savedName && savedProfileImage
    ? {
        email: savedEmail,
        userId: savedUserId,
        role: savedRole,
        accessToken: savedToken,
        name: savedName,
        profileImage: savedProfileImage,
      }
    : null
//#endregion

//#region ----- ZUSTAND USER STORE -----
export const useUserStore = create<UserStore>((set) => ({
  user: initialUser,
  isLoggedIn: !!initialUser,
  users: [], // Add this

  //#region ----- LOGIN -----
  login: async (email, password) => {
    try {
      const res = await fetch(`${baseUrl}/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (res.ok && data.accessToken) {
        const user = {
          email,
          userId: data.userId,
          accessToken: data.accessToken,
          role: data.role || "student",
          name: data.name || "",
          profileImage: data.profileImage || "/SImon.png",
        }

        // Save to localStorage
        localStorage.setItem("email", email)
        localStorage.setItem("userId", data.userId)
        localStorage.setItem("accessToken", data.accessToken)
        localStorage.setItem("role", user.role)
        localStorage.setItem("name", user.name)
        localStorage.setItem("profileImage", user.profileImage)

        set({ user, isLoggedIn: true })
        return { success: true, message: "Login successful" }
      } else {
        if (res.status === 401) {
          return { success: false, message: "Incorrect email or password" }
        } else if (res.status === 404) {
          return { success: false, message: "User does not exist" }
        } else {
          return {
            success: false,
            message: data.error || data.message || "Login failed",
          }
        }
      }
    } catch (err: any) {
      console.error("Login failed:", err)
      return { success: false, message: err.message || "Login failed" }
    }
  },
  //#endregion

  //#region ----- LOGOUT -----
  logout: () => {
    localStorage.removeItem("email")
    localStorage.removeItem("userId")
    localStorage.removeItem("accessToken")
    localStorage.removeItem("role")
    localStorage.removeItem("name")
    localStorage.removeItem("profileImage")
    set({ user: null, isLoggedIn: false })
  },
  //#endregion

  //#region ----- CREATE USER -----
  createUser: async (formData: FormData) => {
    try {
      const res = await fetch(`${baseUrl}/users`, {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (res.ok && data.accessToken) {
        const user = {
          email: formData.get("email") as string,
          userId: data.userId,
          accessToken: data.accessToken,
          role: formData.get("role") as string,
          name: formData.get("name") as string,
          profileImage: data.profileImage,
        }

        // Save to localStorage
        localStorage.setItem("email", user.email)
        localStorage.setItem("userId", user.userId)
        localStorage.setItem("accessToken", user.accessToken)
        localStorage.setItem("role", user.role)
        localStorage.setItem("name", user.name)
        localStorage.setItem("profileImage", user.profileImage)

        set({ user, isLoggedIn: true })

        return { success: true, message: "User created successfully" }
      } else {
        return {
          success: false,
          message: data.message || "Could not create user",
        }
      }
    } catch (err: any) {
      console.error("Create user failed:", err)
      return { success: false, message: err.message || "Could not create user" }
    }
  },
  //#endregion

  //#region ----- GET ALL USERS -----
  getAllUsers: async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const res = await fetch(`${baseUrl}/users`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const data = await res.json()

      if (res.ok && data.success) {
        set({ users: data.response })
        return { success: true, message: "Users fetched successfully" }
      } else {
        return {
          success: false,
          message: data.message || "Failed to fetch users",
        }
      }
    } catch (err: unknown) {
      console.error("Get users failed:", err)
      return { success: false, message: "Failed to fetch users" }
    }
  },
  //#endregion
}))
