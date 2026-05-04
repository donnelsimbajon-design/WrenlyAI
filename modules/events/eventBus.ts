import { create } from 'zustand';

type EventCallback = (data: any) => void;

interface EventBusStore {
  listeners: Record<string, EventCallback[]>;
  emit: (event: string, data: any) => void;
  on: (event: string, callback: EventCallback) => () => void;
  off: (event: string, callback: EventCallback) => void;
  clear: (event: string) => void;
  clearAll: () => void;
}

export const useEventBus = create<EventBusStore>((set, get) => ({
  listeners: {},

  emit: (event, data) => {
    const callbacks = get().listeners[event] || [];
    callbacks.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
    });
  },

  on: (event, callback) => {
    set((state) => ({
      listeners: {
        ...state.listeners,
        [event]: [...(state.listeners[event] || []), callback],
      },
    }));

    // Return unsubscribe function
    return () => {
      get().off(event, callback);
    };
  },

  off: (event, callback) => {
    set((state) => ({
      listeners: {
        ...state.listeners,
        [event]: (state.listeners[event] || []).filter((cb) => cb !== callback),
      },
    }));
  },

  clear: (event) => {
    set((state) => ({
      listeners: {
        ...state.listeners,
        [event]: [],
      },
    }));
  },

  clearAll: () => {
    set({ listeners: {} });
  },
}));

// Event names for consistency
export const EVENTS = {
  MATERIAL_ADDED: 'material:added',
  MATERIAL_UPDATED: 'material:updated',
  ANNOUNCEMENT_ADDED: 'announcement:added',
  ANNOUNCEMENT_UPDATED: 'announcement:updated',
  MESSAGE_ADDED: 'message:added',
  QUIZ_ATTEMPT_COMPLETED: 'quiz_attempt:completed',
  ENROLLMENT_ADDED: 'enrollment:added',
  CLASSROOM_UPDATED: 'classroom:updated',
} as const;
