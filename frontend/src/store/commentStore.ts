import { create } from 'zustand';

export interface MessageType {
  message: string;
  createdAt: Date;
}

interface MessageStore {
  messages: MessageType[];
  addMessage: (msg: MessageType) => void;
  clearMessages: () => void;
}

export const commentStore = create<MessageStore>((set) => ({
  messages: [],
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  clearMessages: () => set({ messages: [] }),
}));

export type { MessageType };