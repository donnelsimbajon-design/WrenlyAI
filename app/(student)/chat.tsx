import { theme } from '@/config/theme';
import { useToast } from '@/hooks/useToast';
import { useChat } from '@/modules/chat/useChat';
import { useAuth } from '@/modules/security/useAuth';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatScreen() {
  const { user } = useAuth();
  const { messages, isLoading, isSending, sendMessage, subscribeToMessages, unsubscribeFromMessages } = useChat();
  const [message, setMessage] = useState('');
  const [chatMode, setChatMode] = useState<'class' | 'ai'>('ai');
  const scrollViewRef = useRef<ScrollView>(null);
  const toast = useToast();

  // For now, use a mock classroom ID - in production this would come from navigation
  const CLASSROOM_ID = 'mock-classroom-id';

  useEffect(() => {
    const setupChat = async () => {
      await subscribeToMessages(CLASSROOM_ID);
    };
    setupChat();

    return () => {
      unsubscribeFromMessages();
    };
  }, []);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !user?.id) {
      toast.warning('Message cannot be empty');
      return;
    }

    const msgText = message;
    setMessage('');

    await sendMessage(CLASSROOM_ID, user.id, msgText);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F2F5', zIndex: 10 }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E0F0F0', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
          <FontAwesome5 name="user-graduate" size={18} color="#00665E" />
        </View>
        <Text style={{ flex: 1, color: '#00665E', fontWeight: '800', fontSize: 18 }}>
          Wrenly
        </Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#566B80" />
        </TouchableOpacity>
      </View>

      {/* Toggle Bar */}
      <View style={{ backgroundColor: '#FFFFFF', paddingHorizontal: 24, paddingBottom: 16, paddingTop: 16 }}>
        <View style={{ flexDirection: 'row', backgroundColor: '#F0F2F5', borderRadius: 100, padding: 4 }}>
          <TouchableOpacity
            onPress={() => setChatMode('class')}
            style={{ flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 100, backgroundColor: chatMode === 'class' ? '#FFFFFF' : 'transparent', shadowColor: chatMode === 'class' ? '#000' : 'transparent', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: chatMode === 'class' ? 1 : 0 }}
          >
            <Text style={{ fontWeight: chatMode === 'class' ? '700' : '600', fontSize: 13, color: chatMode === 'class' ? '#00665E' : '#8A9BA8' }}>Class Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setChatMode('ai')}
            style={{ flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 100, backgroundColor: chatMode === 'ai' ? '#00665E' : 'transparent', shadowColor: chatMode === 'ai' ? '#000' : 'transparent', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: chatMode === 'ai' ? 2 : 0 }}
          >
            <Text style={{ fontWeight: chatMode === 'ai' ? '700' : '600', fontSize: 13, color: chatMode === 'ai' ? '#FFFFFF' : '#8A9BA8' }}>Wrenly AI</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat Feed */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {isLoading ? (
            <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 40 }}>
              <ActivityIndicator color={theme.colors.wrenly.primary} size="large" />
              <Text style={{ marginTop: 16, color: '#9CA3AF', fontSize: 14 }}>Loading chat...</Text>
            </View>
          ) : messages.length === 0 ? (
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#F0FAF8', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <MaterialCommunityIcons name="chat-outline" size={32} color={theme.colors.wrenly.primary} />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#1F2937', marginBottom: 8 }}>No messages yet</Text>
              <Text style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center' }}>
                Start a conversation with Wrenly AI or join a class discussion!
              </Text>
            </View>
          ) : (
            messages.map((msg, index) => (
              <View key={msg.id || index} style={{ marginBottom: 16 }}>
                {msg.is_ai ? (
                  // AI Message
                  <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.wrenly.primary, alignItems: 'center', justifyContent: 'center', marginRight: 12, marginBottom: 8 }}>
                      <FontAwesome5 name="paw" size={16} color="#FFFFFF" />
                    </View>
                    <View style={{ flex: 1, backgroundColor: '#F0FDF8', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#E8F7F5', maxWidth: '85%' }}>
                      <Text style={{ color: '#2C3E50', fontSize: 14, lineHeight: 20 }}>{msg.message}</Text>
                      <Text style={{ color: '#9CA3AF', fontSize: 11, marginTop: 6 }}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                ) : (
                  // User Message
                  <View style={{ alignItems: 'flex-end', marginBottom: 0 }}>
                    <View style={{ backgroundColor: theme.colors.wrenly.primary, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, borderBottomRightRadius: 4, maxWidth: '85%' }}>
                      <Text style={{ color: '#FFFFFF', fontSize: 14, lineHeight: 20 }}>{msg.message}</Text>
                      <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 6 }}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={{ padding: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F0F2F5', flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F6F9', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 4, marginRight: 12 }}>
            <TextInput
              placeholder={chatMode === 'ai' ? 'Ask Wrenly to explain...' : 'Type a message...'}
              placeholderTextColor="#A0AEBA"
              value={message}
              onChangeText={setMessage}
              editable={!isSending}
              style={{ flex: 1, height: 40, fontSize: 15, color: '#2C3E50' }}
            />
            {message.trim() && (
              <TouchableOpacity onPress={handleSendMessage} disabled={isSending}>
                <Ionicons name="send" size={20} color={isSending ? '#D1D5DB' : theme.colors.wrenly.primary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            disabled={isSending || !message.trim()}
            style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: isSending ? '#D1D5DB' : theme.colors.wrenly.primary, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}
          >
            {isSending ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <MaterialCommunityIcons name="send" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}
