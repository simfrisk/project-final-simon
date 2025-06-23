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

export const useReplyStore = create<ReplyStore>((set) => ({
  replies: [],
  addReply: (aReply) =>
    set((state) => ({
      replies: [...state.replies, aReply],
    })),
}));