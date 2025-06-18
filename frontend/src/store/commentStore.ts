import { create } from 'zustand';

export interface MessageType {
  message: string;
  createdAt: Date;
}

interface MessageStore {
  messages: MessageType[];
  addMessage: (msg: MessageType) => void;
  clearMessages: () => void;
  deleteMessage: (createdAt: Date) => void;  // Add deleteMessage here, using createdAt as identifier
}

const STORAGE_KEY = 'commentStoreMessages';

const loadMessagesFromStorage = (): MessageType[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    const parsed = JSON.parse(stored) as { message: string; createdAt: string }[];
    return parsed.map((item) => ({
      message: item.message,
      createdAt: new Date(item.createdAt),
    }));
  } catch {
    return [];
  }
};

export const commentStore = create<MessageStore>((set) => ({
  messages: loadMessagesFromStorage(),
  addMessage: (msg) => {
    set((state) => {
      const newMessages = [...state.messages, msg];
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newMessages));
      }
      return { messages: newMessages };
    });
  },
  clearMessages: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    set({ messages: [] });
  },
  deleteMessage: (createdAt) => {
    set((state) => {
      const newMessages = state.messages.filter(
        (msg) => msg.createdAt.getTime() !== createdAt.getTime()
      );
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newMessages));
      }
      return { messages: newMessages };
    });
  },
}));