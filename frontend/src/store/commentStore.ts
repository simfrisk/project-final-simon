import { create } from 'zustand';

export interface MessageType {
  _id?: string;
  message: string;
  createdAt: Date;
  timeStamp: string;
  replies?: ReplyType[]; // 👈 add this
}

interface MessageStore {
  messages: MessageType[];
  selectedTimeStamp: string | null;
  setSelectedTimeStamp: (stamp: string) => void;
  addMessage: (msg: MessageType) => void;
  clearMessages: () => void;
  deleteMessage: (_id: string) => void;
  fetchComments: (projectId: string) => Promise<void>;
}

export const commentStore = create<MessageStore>((set) => ({
  messages: [],
  selectedTimeStamp: null,

  setSelectedTimeStamp: (stamp) => set({ selectedTimeStamp: stamp }),

  addMessage: (msg) =>
    set((state) => ({
      messages: [...state.messages, msg],
    })),

  clearMessages: () => set({ messages: [] }),

  deleteMessage: (_id) =>
    set((state) => ({
      messages: state.messages.filter((msg) => msg._id !== _id),
    })),

  fetchComments: async (projectId) => {
    try {
      const response = await fetch(`http://localhost:8080/projects/${projectId}/comments`);
      if (!response.ok) throw new Error("Network response was not ok");

      const json = await response.json();
      console.log("messages fetch:", json);

      if (json.success && Array.isArray(json.response)) {
        // Find the correct project by ID
        const project = json.response.find((proj) => proj._id === projectId);
        const comments = project?.comments || [];

        set({ messages: comments });
      } else {
        console.error("Failed to fetch messages:", json.message);
      }
    } catch (err: any) {
      console.error("Fetch error:", err.message || "Unknown error");
    }
  }
}));