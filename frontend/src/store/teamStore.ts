//#region ----- IMPORTS -----
import { create } from "zustand"
import { getToken } from "../utils/token"
import { baseUrl } from "../config/api"
//#endregion

//#region ----- INTERFACES -----
export interface TeamMember {
  _id?: string
  name: string
  email: string
  role: string
  profileImage?: string
}

export interface Team {
  _id: string
  teamName: string
  createdBy: TeamMember
  createdAt: string
  assignedTeachers: TeamMember[]
  assignedStudents: TeamMember[]
  workspaceId: {
    _id: string
    name: string
  }
  accessTo: Array<{
    _id: string
    classTitle: string
  }>
  schemaVersion: string
}

export interface CreateTeamData {
  teamName: string
  members?: string[] // Array of user IDs
  teachers?: string[] // Array of teacher IDs
  classes?: string[] // Array of class IDs
}

export interface UpdateTeamData {
  teamName?: string
  members?: string[] // Array of user IDs to add
  teachers?: string[] // Array of teacher IDs to add
  classes?: string[] // Array of class IDs to add
}

interface TeamStore {
  teams: Team[]
  team: Team | null
  loading: boolean
  error: string | null
  message: string | null

  fetchTeams: (workspaceId: string) => Promise<void>
  fetchTeamById: (teamId: string) => Promise<void>
  createTeam: (workspaceId: string, teamData: CreateTeamData) => Promise<void>
  updateTeam: (teamId: string, teamData: UpdateTeamData) => Promise<void>
  deleteTeam: (teamId: string) => Promise<void>
  addTeamMember: (teamId: string, userId: string) => Promise<void>
  removeTeamMember: (teamId: string, userId: string) => Promise<void>
  addTeamTeacher: (teamId: string, teacherId: string) => Promise<void>
  removeTeamTeacher: (teamId: string, teacherId: string) => Promise<void>
  addTeamClass: (teamId: string, classId: string) => Promise<void>
  removeTeamClass: (teamId: string, classId: string) => Promise<void>
}
//#endregion

//#region ----- ZUSTAND TEAM STORE -----
export const useTeamStore = create<TeamStore>((set, get) => ({
  teams: [],
  team: null,
  loading: false,
  error: null,
  message: null,

  //#endregion

  //#region ----- FETCH TEAMS -----
  fetchTeams: async (workspaceId: string) => {
    set({ loading: true, error: null, message: null })
    try {
      const token = getToken()
      if (!token) throw new Error("Missing access token")

      const response = await fetch(`${baseUrl}/workspace/${workspaceId}/teams`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch teams")
      }

      const data = await response.json()
      set({
        teams: data.response,
        loading: false,
        error: null,
        message: "Teams fetched successfully",
      })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch teams"
      set({ error: errorMessage, loading: false, message: null })
    }
  },
  //#endregion

  //#region ----- FETCH TEAM BY ID -----
  fetchTeamById: async (teamId: string) => {
    set({ loading: true, error: null, message: null })
    try {
      const token = getToken()
      if (!token) throw new Error("Missing access token")

      const response = await fetch(`${baseUrl}/teams/${teamId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to fetch team")
      }

      const data = await response.json()
      set({
        team: data.response,
        loading: false,
        error: null,
        message: "Team fetched successfully",
      })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch team"
      set({ error: errorMessage, loading: false, message: null })
    }
  },
  //#endregion

  //#region ----- CREATE TEAM -----
  createTeam: async (workspaceId: string, teamData: CreateTeamData) => {
    set({ loading: true, error: null, message: null })
    try {
      const token = getToken()
      if (!token) throw new Error("Missing access token")

      const response = await fetch(`${baseUrl}/workspace/${workspaceId}/teams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(teamData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to create team")
      }

      const data = await response.json()
      set((state) => ({
        teams: [...state.teams, data.response],
        loading: false,
        error: null,
        message: "Team created successfully",
      }))
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create team"
      set({ error: errorMessage, loading: false, message: null })
    }
  },
  //#endregion

  //#region ----- UPDATE TEAM -----
  updateTeam: async (teamId: string, teamData: UpdateTeamData) => {
    set({ loading: true, error: null, message: null })
    try {
      const token = getToken()
      if (!token) throw new Error("Missing access token")

      const response = await fetch(`${baseUrl}/teams/${teamId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(teamData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update team")
      }

      const data = await response.json()
      set((state) => ({
        teams: state.teams.map((team) =>
          team._id === teamId ? { ...team, ...data.response } : team
        ),
        team: state.team?._id === teamId ? { ...state.team, ...data.response } : state.team,
        loading: false,
        error: null,
        message: "Team updated successfully",
      }))
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update team"
      set({ error: errorMessage, loading: false, message: null })
    }
  },
  //#endregion

  //#region ----- DELETE TEAM -----
  deleteTeam: async (teamId: string) => {
    set({ loading: true, error: null, message: null })
    try {
      const token = getToken()
      if (!token) throw new Error("Missing access token")

      const response = await fetch(`${baseUrl}/teams/${teamId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete team")
      }

      set((state) => ({
        teams: state.teams.filter((team) => team._id !== teamId),
        team: state.team?._id === teamId ? null : state.team,
        loading: false,
        error: null,
        message: "Team deleted successfully",
      }))
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete team"
      set({ error: errorMessage, loading: false, message: null })
    }
  },
  //#endregion

  //#region ----- ADD TEAM MEMBER -----
  addTeamMember: async (teamId: string, userId: string) => {
    set({ loading: true, error: null, message: null })
    try {
      const token = getToken()
      if (!token) throw new Error("Missing access token")

      const response = await fetch(`${baseUrl}/teams/${teamId}/members/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to add team member")
      }

      // Fetch updated team data to get the newly added member info
      await get().fetchTeamById(teamId)
      set({ message: "Team member added successfully" })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add team member"
      set({ error: errorMessage, loading: false, message: null })
    }
  },
  //#endregion

  //#region ----- REMOVE TEAM MEMBER -----
  removeTeamMember: async (teamId: string, userId: string) => {
    set({ loading: true, error: null, message: null })
    try {
      const token = getToken()
      if (!token) throw new Error("Missing access token")

      const response = await fetch(`${baseUrl}/teams/${teamId}/members/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to remove team member")
      }

      set((state) => ({
        teams: state.teams.map((team) =>
          team._id === teamId
            ? {
                ...team,
                assignedTeachers: team.assignedTeachers.filter((teacher) => teacher._id !== userId),
              }
            : team
        ),
        team:
          state.team?._id === teamId
            ? {
                ...state.team,
                assignedTeachers: state.team.assignedTeachers.filter(
                  (teacher) => teacher._id !== userId
                ),
              }
            : state.team,
        loading: false,
        error: null,
        message: "Team member removed successfully",
      }))
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to remove team member"
      set({ error: errorMessage, loading: false, message: null })
    }
  },
  //#endregion

  //#region ----- ADD TEAM TEACHER -----
  addTeamTeacher: async (teamId: string, teacherId: string) => {
    set({ loading: true, error: null, message: null })
    try {
      const token = getToken()
      if (!token) throw new Error("Missing access token")

      const response = await fetch(`${baseUrl}/teams/${teamId}/teachers/${teacherId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to add team teacher")
      }

      // Fetch updated team data to get the newly added teacher info
      await get().fetchTeamById(teamId)
      set({ message: "Team teacher added successfully" })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add team teacher"
      set({ error: errorMessage, loading: false, message: null })
    }
  },
  //#endregion

  //#region ----- REMOVE TEAM TEACHER -----
  removeTeamTeacher: async (teamId: string, teacherId: string) => {
    set({ loading: true, error: null, message: null })
    try {
      const token = getToken()
      if (!token) throw new Error("Missing access token")

      const response = await fetch(`${baseUrl}/teams/${teamId}/teachers/${teacherId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to remove team teacher")
      }

      set((state) => ({
        teams: state.teams.map((team) =>
          team._id === teamId
            ? {
                ...team,
                assignedTeachers: team.assignedTeachers.filter(
                  (teacher) => teacher._id !== teacherId
                ),
              }
            : team
        ),
        team:
          state.team?._id === teamId
            ? {
                ...state.team,
                assignedTeachers: state.team.assignedTeachers.filter(
                  (teacher) => teacher._id !== teacherId
                ),
              }
            : state.team,
        loading: false,
        error: null,
        message: "Team teacher removed successfully",
      }))
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to remove team teacher"
      set({ error: errorMessage, loading: false, message: null })
    }
  },
  //#endregion

  //#region ----- ADD TEAM CLASS -----
  addTeamClass: async (teamId: string, classId: string) => {
    set({ loading: true, error: null, message: null })
    try {
      const token = getToken()
      if (!token) throw new Error("Missing access token")

      const response = await fetch(`${baseUrl}/teams/${teamId}/classes/${classId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to add team class")
      }

      // Fetch updated team data to get the newly added class info
      await get().fetchTeamById(teamId)
      set({ message: "Team class added successfully" })
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add team class"
      set({ error: errorMessage, loading: false, message: null })
    }
  },
  //#endregion

  //#region ----- REMOVE TEAM CLASS -----
  removeTeamClass: async (teamId: string, classId: string) => {
    set({ loading: true, error: null, message: null })
    try {
      const token = getToken()
      if (!token) throw new Error("Missing access token")

      const response = await fetch(`${baseUrl}/teams/${teamId}/classes/${classId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to remove team class")
      }

      set((state) => ({
        teams: state.teams.map((team) =>
          team._id === teamId
            ? {
                ...team,
                accessTo: team.accessTo.filter((classItem) => classItem._id !== classId),
              }
            : team
        ),
        team:
          state.team?._id === teamId
            ? {
                ...state.team,
                accessTo: state.team.accessTo.filter((classItem) => classItem._id !== classId),
              }
            : state.team,
        loading: false,
        error: null,
        message: "Team class removed successfully",
      }))
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to remove team class"
      set({ error: errorMessage, loading: false, message: null })
    }
  },
  //#endregion
}))
//#endregion
