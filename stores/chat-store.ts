import { create } from 'zustand';
import type { ChatMessage } from '@/types';

interface ChatStore {
  messages: ChatMessage[];
  currentDocId: string | null;
  isLoading: boolean;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  clearMessages: () => void;
  setCurrentDocId: (docId: string | null) => void;
  setLoading: (loading: boolean) => void;
  getMessageById: (id: string) => ChatMessage | undefined;
}

/**
 * Chat store for managing conversation state with type-safe operations
 */
export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  currentDocId: null,
  isLoading: false,

  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        },
      ],
    })),

  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg)),
    })),

  clearMessages: () => set({ messages: [] }),

  setCurrentDocId: (docId) => set({ currentDocId: docId }),

  setLoading: (loading) => set({ isLoading: loading }),

  getMessageById: (id) => {
    return get().messages.find((msg) => msg.id === id);
  },
}));
