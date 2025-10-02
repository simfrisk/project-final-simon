//#region ----- IMPORTS -----
import { create } from "zustand"
import { baseUrl } from "../config/api"
//#endregion

//#region ----- INTERFACES -----
interface AuthUser {
  _id?: string
  email: string
  name: string
  userId: string
  accessToken: string
  role: string
  profileImage: string
  workspaceId?: string
}

interface UserStore {
  user: AuthUser | null
  isLoggedIn: boolean
  users: AuthUser[]
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  createUser: (formData: FormData) => Promise<{ success: boolean; message: string }>
  getAllUsers: () => Promise<{ success: boolean; message: string }>
  deleteUser: (userId: string) => Promise<{ success: boolean; message: string }>
  updateUser: (
    userId: string,
    updates: {
      newName?: string
      newEmail?: string
      newRole?: string
      newPassword?: string
      newProfileImage?: string
      newWorkspaceId?: string
    }
  ) => Promise<{ success: boolean; message: string }>
  sortUsersByRole: () => void
  setUserWorkspace: (workspaceId: string) => void
  fetchCurrentUser: () => Promise<void>
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
        _id: savedUserId, // Use userId as _id for initial user
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
export const useUserStore = create<UserStore>((set, get) => ({
  user: initialUser,
  isLoggedIn: !!initialUser,
  users: [],
  loading: false,

  //#endregion

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
          _id: data.userId, // Include _id when available
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
    } catch (err: unknown) {
      console.error("Login failed:", err)
      return { success: false, message: err instanceof Error ? err.message : "Login failed" }
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
          _id: data.userId, // Include _id when available
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
    } catch (err: unknown) {
      console.error("Create user failed:", err)
      return {
        success: false,
        message: err instanceof Error ? err.message : "Could not create user",
      }
    }
  },
  //#endregion

  //#region ----- DELETE USER -----
  deleteUser: async (userId: string) => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${baseUrl}/users/${userId}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      if (!response.ok) throw new Error("Failed to delete user")

      const data = await response.json()
      if (data.success) {
        set({ users: get().users.filter((user) => user._id !== userId) })
        return { success: true, message: "User deleted successfully" }
      } else {
        return {
          success: false,
          message: data.message || "Failed to delete user",
        }
      }
    } catch (err: unknown) {
      console.error("Error deleting user:", err)
      return {
        success: false,
        message: err instanceof Error ? err.message : "Failed to delete user",
      }
    }
  },

  //#endregion

  //#region ----- PATCH USER -----

  updateUser: async (
    userId: string,
    updates: {
      newName?: string
      newEmail?: string
      newRole?: string
      newPassword?: string
      newProfileImage?: string
    }
  ) => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`${baseUrl}/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) throw new Error("Failed to patch user")

      const data = await response.json()
      if (data.success) {
        // Update the current user if it's the same user being updated
        const currentUser = get().user
        if (currentUser && currentUser._id === userId) {
          const updatedUser = { ...currentUser, ...data.response }
          set({ user: updatedUser })

          // Update localStorage to persist changes on reload
          if (updatedUser.name) localStorage.setItem("name", updatedUser.name)
          if (updatedUser.email) localStorage.setItem("email", updatedUser.email)
          if (updatedUser.role) localStorage.setItem("role", updatedUser.role)
          if (updatedUser.profileImage)
            localStorage.setItem("profileImage", updatedUser.profileImage)
        }

        // Update the user in the users array
        set((state) => ({
          users: state.users.map((user) =>
            user._id === userId ? { ...user, ...data.response } : user
          ),
        }))

        return { success: true, message: "User updated successfully" }
      } else {
        return {
          success: false,
          message: data.message || "Failed to update user",
        }
      }
    } catch (err: unknown) {
      return {
        success: false,
        message: err instanceof Error ? err.message : "Failed to update user",
      }
    }
  },

  //#endregion

  //#region ----- FETCH CURRENT USER -----
  fetchCurrentUser: async () => {
    set({ loading: true })
    try {
      const token = localStorage.getItem("accessToken")
      if (!token) throw new Error("Missing access token")

      const response = await fetch(`${baseUrl}/users/${localStorage.getItem("userId")}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Failed to fetch current user")

      const data = await response.json()
      if (data.success) {
        set({ user: data.response, loading: false })
      }
    } catch (error) {
      console.error("Failed to fetch current user:", error)
      set({ loading: false })
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

  //#region ----- SORT USERS BY ROLE -----

  sortUsersByRole: () => {
    const { users } = get()
    const sortedUsers = [...users].sort((a, b) => {
      // Define role priority (customize this order as needed)
      const rolePriority = { admin: 1, teacher: 2, student: 3 }
      return (
        (rolePriority[a.role as keyof typeof rolePriority] || 4) -
        (rolePriority[b.role as keyof typeof rolePriority] || 4)
      )
    })
    set({ users: sortedUsers })
  },

  //#endregion

  //#region ----- SET USER WORKSPACE -----

  setUserWorkspace: (workspaceId: string) => {
    const currentUser = get().user
    if (currentUser) {
      const updatedUser = { ...currentUser, workspaceId }
      set({ user: updatedUser })
      localStorage.setItem("workspaceId", workspaceId)
    }
  },

  //#endregion
}))
