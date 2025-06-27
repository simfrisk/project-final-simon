import { create } from 'zustand';

export interface MessageType {
  _id?: string;
  projectID?: string;
  message: string;
  createdAt: Date;
  timeStamp: string;
}

interface MessageStore {
  messages: MessageType[];
  selectedTimeStamp: string | null;
  setSelectedTimeStamp: (stamp: string) => void;
  addMessage: (msg: MessageType) => Promise<void>;
  clearMessages: () => void;
  deleteMessage: (_id: string) => void;
  fetchComments: (projectId: string) => Promise<void>;
}

export const commentStore = create<MessageStore>((set) => ({
  messages: [],
  selectedTimeStamp: null,

  setSelectedTimeStamp: (stamp) => set({ selectedTimeStamp: stamp }),

  addMessage: async (msg) => {
    try {
      const response = await fetch(`http://localhost:8080/projects/${msg.projectID}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(msg),
      });

      if (!response.ok) throw new Error("Failed to post comment");

      const data = await response.json();

      if (data.success && data.comment) {
        set((state) => ({
          messages: [...state.messages, data.comment], // assuming server returns full comment with _id
        }));
      } else {
        console.error("Post failed:", data.message || "No comment in response");
      }
    } catch (err: any) {
      console.error("Error posting comment:", err.message || "Unknown error");
    }
  },

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