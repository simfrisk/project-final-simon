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

export const useReplyStore = create<ReplyStore>((set, get) => ({
  // Load from localStorage on init, parse JSON & convert createdAt strings back to Date
  replies: (() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const parsed: ReplyType[] = JSON.parse(stored);
      // Convert createdAt strings back to Date objects
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
      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReplies));
      } catch { }
      return { replies: updatedReplies };
    });
  },
}));