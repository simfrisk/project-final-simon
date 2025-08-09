//#region ----- IMPORTS -----
import { create } from "zustand";
import { getToken } from "../utils/token";
import { baseUrl } from "../config/api";

//#endregion

//#region ----- INTERFACES -----
export interface ClassType {
  _id: string;
  classTitle: string;
  classDescription: string;
}

interface ClassesStore {
  classes: ClassType[];
  class: ClassType | null;
  loading: boolean;
  error: string | null;
  message: string | null;

  fetchClasses: () => Promise<void>;
  fetchClassById: (classId: string) => Promise<void>;
  addClass: (classTitle: string) => Promise<void>;
  deleteClass: (classId: string) => Promise<void>;
}

//#endregion

//#region ----- ZUSTAND CLASS STORE -----
export const useClassStore = create<ClassesStore>((set) => ({
  classes: [],
  class: null,
  loading: false,
  error: null,
  message: null,

  fetchClasses: async () => {
    set({ loading: true, error: null, message: null });
    try {
      const token = getToken();
      if (!token) throw new Error("Missing access token");

      const response = await fetch(`${baseUrl}/classes`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });

      const json = await response.json();
      if (response.ok && json.success) {
        set({ classes: json.response, loading: false, message: json.message || null });
      } else {
        throw new Error(json.message || "Failed to fetch classes");
      }
    } catch (err: any) {
      set({ loading: false, error: err.message || "Unknown error" });
    }
  },

  //#endregion

  //#region ----- FETCH CLASS BY ID -----
  fetchClassById: async (classId: string) => {
    set({ loading: true, error: null, message: null });
    try {
      const token = getToken();
      if (!token) throw new Error("Missing access token");

      const response = await fetch(`${baseUrl}/classes/${classId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });

      const json = await response.json();
      if (response.ok && json.success) {
        set({ class: json.response, loading: false, message: json.message || null });
      } else {
        throw new Error(json.message || "Failed to fetch class");
      }
    } catch (err: any) {
      set({ loading: false, error: err.message || "Unknown error" });
    }
  },
  //#endregion

  //#region ----- ADD CLASS -----
  addClass: async (classTitle: string) => {
    set({ loading: true, error: null, message: null });
    try {
      const token = getToken();
      if (!token) throw new Error("Missing access token");

      const res = await fetch(`${baseUrl}/classes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ classTitle }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        set((state) => ({
          classes: [...state.classes, json.response],
          loading: false,
          message: json.message || null,
        }));
      } else {
        throw new Error(json.message || "Failed to add class");
      }
    } catch (err: any) {
      set({ loading: false, error: err.message || "Unknown error" });
    }
  },

  //#endregion 

  //#region ----- DELETE CLASS -----
  deleteClass: async (classId: string) => {
    set({ loading: true, error: null, message: null });
    try {
      const token = getToken();
      if (!token) throw new Error("Missing access token");

      const response = await fetch(`${baseUrl}/classes/${classId}`, {
        method: "DELETE",
        headers: {
          Authorization: token,
        },
      });

      const data = await response.json();
      if (response.ok && data.success) {
        set((state) => ({
          classes: state.classes.filter((cls) => cls._id !== classId),
          loading: false,
          message: data.message || null,
        }));
      } else {
        throw new Error(data.message || "Failed to delete class");
      }
    } catch (err: any) {
      set({ loading: false, error: err.message || "Unknown error" });
    }
  },

  //#endregion
}));