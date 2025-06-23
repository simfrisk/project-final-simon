import { create } from "zustand";

export interface ReplyType {
  replyId: number;
  reply: string;
  createdAt: Date;
  commentId: number;
}

interface ReplyStore {
  replies: ReplyType[];
  addReply: (aReply: ReplyType) => void;
}

const STORAGE_KEY = "replyStore";

export const useReplyStore = create<ReplyStore>((set) => ({
  replies: (() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const parsed: ReplyType[] = JSON.parse(stored);
      return parsed.map(reply => ({
        ...reply,
        createdAt: new Date(reply.createdAt),
      }));
    } catch {
      return [];
    }
  })(),
  addReply: (aReply) => {
    set((state) => {
      const updatedReplies = [...state.replies, aReply];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReplies));
      } catch (error) {
        console.error('Failed to save replies to localStorage', error);
      }
      return { replies: updatedReplies };
    });
  },
}));