import { create } from "zustand";

export interface ReplyType {
  reply: string;
  createdAt: Date;
  messageTimeStamp: number;
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