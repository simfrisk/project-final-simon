import { create } from 'zustand';

export interface ReplyType {
  _id: string;
  content: string;
  commentId: string;
  createdAt: Date;
}

export interface MessageType {
  _id: string;
  content: string;
  projectId?: string;
  createdAt?: Date;
  timeStamp: string;
  replies?: ReplyType[];
}

interface MessageStore {
  messages: MessageType[];
  selectedTimeStamp: string | null;
  setSelectedTimeStamp: (stamp: string) => void;
  addMessage: (msg: MessageType) => Promise<void>;
  addReply: (reply: { content: string; commentId: string; projectId?: string }) => Promise<void>;
  clearMessages: () => void;
  deleteMessage: (_id: string) => void;
  fetchComments: (projectId: string) => Promise<void>;
}

export const commentStore = create<MessageStore>((set, get) => ({
  messages: [],
  selectedTimeStamp: null,

  setSelectedTimeStamp: (stamp) => set({ selectedTimeStamp: stamp }),

  addMessage: async (msg) => {
    try {
      const response = await fetch(`http://localhost:8080/projects/${msg.projectId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msg),
      });

      if (!response.ok) throw new Error("Failed to post comment");

      const data = await response.json();

      if (data.success && data.response) {
        const newMessage: MessageType = {
          _id: data.response._id,
          content: data.response.content,
          projectId: data.response.projectId,
          createdAt: new Date(data.response.createdAt),
          timeStamp: data.response.timeStamp,
          replies: [],
        };

        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      } else {
        console.error("Post failed:", data.message || "No comment in response");
      }
    } catch (err: any) {
      console.error("Error posting comment:", err.message || "Unknown error");
    }
  },

  addReply: async (reply) => {
    try {
      const response = await fetch(
        `http://localhost:8080/comments/${reply.commentId}/replies`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: reply.content }),
        }
      );

      if (!response.ok) throw new Error("Failed to post reply");

      const data = await response.json();

      if (data.success && data.response) {
        const newReply: ReplyType = {
          _id: data.response._id,
          content: data.response.content,
          commentId: data.response.commentId,
          createdAt: new Date(data.response.createdAt),
        };

        set((state) => ({
          messages: state.messages.map((msg) =>
            msg._id === newReply.commentId
              ? {
                ...msg,
                replies: [...(msg.replies || []), newReply],
              }
              : msg
          ),
        }));
      } else {
        console.error("Post reply failed:", data.message || "No reply in response");
      }
    } catch (err: any) {
      console.error("Error posting reply:", err.message || "Unknown error");
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

      if (json.success && Array.isArray(json.response)) {
        const mappedMessages: MessageType[] = json.response.map((item: any) => ({
          _id: item._id,
          content: item.content,
          projectId: item.projectId,
          createdAt: new Date(item.createdAt),
          timeStamp: item.timeStamp,
          replies: (item.replies || []).map((reply: any) => ({
            _id: reply._id,
            content: reply.content,
            commentId: reply.commentId,
            createdAt: new Date(reply.createdAt),
          })),
        }));

        set({ messages: mappedMessages });
      } else {
        console.error("Failed to fetch messages:", json.message);
      }
    } catch (err: any) {
      console.error("Fetch error:", err.message || "Unknown error");
    }
  },
}));