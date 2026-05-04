import { EVENTS, useEventBus } from '@/modules/events/eventBus';
import { supabase } from '@/services/supabase';

export interface ChatMessage {
  id: string;
  classroom_id: string;
  sender_id: string;
  message: string;
  is_ai: boolean;
  sender_name?: string;
  created_at: string;
}

export const ChatService = {
  async sendMessage(
    classroomId: string,
    senderId: string,
    message: string,
    isAi: boolean = false
  ): Promise<{ data: ChatMessage | null; error: any }> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        classroom_id: classroomId,
        sender_id: senderId,
        message: message.trim(),
        is_ai: isAi,
      })
      .select()
      .single();

    if (!error && data) {
      // Emit event for real-time update across tabs/windows
      useEventBus.getState().emit(EVENTS.MESSAGE_ADDED, data);
    }

    return { data, error };
  },

  async getMessages(classroomId: string, limit = 50): Promise<ChatMessage[]> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        classroom_id,
        sender_id,
        message,
        is_ai,
        created_at,
        profiles!sender_id(full_name)
      `)
      .eq('classroom_id', classroomId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return (data || []).map((msg: any) => ({
      ...msg,
      sender_name: msg.profiles?.full_name || 'Unknown',
    })).reverse();
  },

  subscribeToMessages(
    classroomId: string,
    onMessage: (message: ChatMessage) => void
  ): () => void {
    const unsubscribeFunctions: (() => void)[] = [];

    try {
      // Subscribe to new messages via Supabase real-time
      const subscription = supabase.channel(`messages:${classroomId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `classroom_id=eq.${classroomId}`,
          },
          (payload: any) => {
            const newMessage: ChatMessage = {
              id: payload.new.id,
              classroom_id: payload.new.classroom_id,
              sender_id: payload.new.sender_id,
              message: payload.new.message,
              is_ai: payload.new.is_ai,
              created_at: payload.new.created_at,
              sender_name: payload.new.sender_name,
            };
            onMessage(newMessage);
            useEventBus.getState().emit(EVENTS.MESSAGE_ADDED, newMessage);
          }
        )
        .subscribe();

      unsubscribeFunctions.push(() => subscription.unsubscribe());

      // Also subscribe to event bus for local message updates
      const unsubscribeEventBus = useEventBus.getState().on(EVENTS.MESSAGE_ADDED, (_msg: any) => {
        // Message already processed by Supabase
      });

      unsubscribeFunctions.push(unsubscribeEventBus);

      return () => {
        unsubscribeFunctions.forEach((unsub) => unsub());
      };
    } catch (error) {
      console.error('Error subscribing to messages:', error);
      return () => {};
    }
  },

  async deleteMessage(messageId: string): Promise<{ error: any }> {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    return { error };
  },

  async updateMessage(messageId: string, newMessage: string): Promise<{ data: ChatMessage | null; error: any }> {
    const { data, error } = await supabase
      .from('messages')
      .update({ message: newMessage.trim() })
      .eq('id', messageId)
      .select()
      .single();

    return { data: (data as ChatMessage) || null, error };
  },
};
