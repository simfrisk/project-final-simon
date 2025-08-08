import { create } from "zustand";
import type { ReplyType as BaseReplyType } from "./commentStore";
import { getToken } from "../utils/token";

export interface ReplyType extends BaseReplyType {
  likesCount?: number; // Added to track likes on replies
}

interface ReplyInput {
  content: string;
  commentId: string;
  projectId?: string;
}

interface UpdateReplyInput {
  replyId: string;
  content: string;
}

interface ReplyStore {
  replies: ReplyType[];
  addReply: (reply: ReplyInput) => Promise<void>;
  updateReply: (update: UpdateReplyInput) => Promise<void>;
}

export const replyStore = create<ReplyStore>((set) => ({
  replies: [],

  addReply: async (reply) => {
    try {
      const token = getToken();

      console.log(reply.commentId)

      const response = await fetch(
        `https://project-final-simon.onrender.com/comments/${reply.commentId}/replies`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: token } : {}),
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
          replyCreatedBy: {
            _id: data.response.replyCreatedBy?._id,
            name: data.response.replyCreatedBy?.name,
            profileImage: data.response.replyCreatedBy?.profileImage,
            role: data.response.replyCreatedBy?.role,
          },
          likesCount: data.response.likes?.length || 0,
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

  updateReply: async ({ replyId, content }) => {
    try {
      const token = getToken();

      const response = await fetch(
        `https://project-final-simon.onrender.com/replies/${replyId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: token } : {}),
          },
          body: JSON.stringify({ content }),
        }
      );

      if (!response.ok) throw new Error("Failed to update reply");

      const data = await response.json();

      if (data.success && data.response) {
        set((state) => ({
          replies: state.replies.map((reply) =>
            reply._id === replyId
              ? { ...reply, content: data.response.content }
              : reply
          ),
        }));
      } else {
        console.error("Update failed:", data.message || "No reply returned");
      }
    } catch (err: any) {
      console.error("Error updating reply:", err.message || "Unknown error");
    }
  },
}));