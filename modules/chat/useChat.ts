import { useToast } from '@/hooks/useToast';
import { EVENTS, useEventBus } from '@/modules/events/eventBus';
import { create } from 'zustand';
import { ChatMessage, ChatService } from './chat.service';

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  subscriptionActive: boolean;

  // Actions
  fetchMessages: (classroomId: string) => Promise<void>;
  subscribeToMessages: (classroomId: string) => Promise<void>;
  unsubscribeFromMessages: () => void;
  sendMessage: (classroomId: string, senderId: string, message: string) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
}

let unsubscribe: (() => void) | null = null;
let eventBusUnsubscribe: (() => void) | null = null;

export const useChat = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  isSending: false,
  error: null,
  subscriptionActive: false,

  fetchMessages: async (classroomId) => {
    set({ isLoading: true, error: null });
    try {
      const messages = await ChatService.getMessages(classroomId, 100);
      set({ messages });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  subscribeToMessages: async (classroomId) => {
    try {
      // Fetch initial messages
      await get().fetchMessages(classroomId);

      // Set up real-time subscription
      unsubscribe = await ChatService.subscribeToMessages(classroomId, (newMessage) => {
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      });

      // Listen to event bus for local message additions
      eventBusUnsubscribe = useEventBus.getState().on(EVENTS.MESSAGE_ADDED, (message) => {
        if (message.classroom_id === classroomId) {
          set((state) => ({
            messages: [...state.messages, message],
          }));
        }
      });

      set({ subscriptionActive: true });
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  unsubscribeFromMessages: () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
    if (eventBusUnsubscribe) {
      eventBusUnsubscribe();
      eventBusUnsubscribe = null;
    }
    set({ subscriptionActive: false });
  },

  sendMessage: async (classroomId, senderId, message) => {
    if (!message.trim()) return;

    set({ isSending: true, error: null });
    const toast = useToast();

    try {
      const { error } = await ChatService.sendMessage(classroomId, senderId, message);

      if (error) {
        throw error;
      }

      toast.success('Message sent');
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to send message';
      set({ error: errorMsg });
      toast.error(errorMsg);
    } finally {
      set({ isSending: false });
    }
  },

  clearMessages: () => {
    set({ messages: [] });
  },

  clearError: () => {
    set({ error: null });
  },
}));
