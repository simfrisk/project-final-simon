import { create } from "zustand";
import type { ReplyType } from "./commentStore";

interface ReplyInput {
  content: string;
  commentId: string;
  projectId: string;
}

interface ReplyStore {
  replies: ReplyType[];
  addReply: (reply: ReplyInput) => Promise<void>;
}

export const replyStore = create<ReplyStore>((set) => ({
  replies: [],

  addReply: async (reply) => {
    try {
      const response = await fetch(
        `http://localhost:8080/comments/${reply.commentId}/replies`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
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
          replies: [...state.replies, newReply],
        }));
      } else {
        console.error("Post failed:", data.message || "No reply returned");
      }
    } catch (err: any) {
      console.error("Error posting reply:", err.message || "Unknown error");
    }
  },
}));