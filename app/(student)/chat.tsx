import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useChat } from '@/modules/wrenly-brain/useChat';
import * as Speech from 'expo-speech';

export default function ChatScreen() {
  const { messages, inputText, setInputText, isTyping, sendMessage } = useChat();

  const handleListen = (text: string) => {
    Speech.stop();
    Speech.speak(text, { language: 'en-US', rate: 0.9 });
  };

  const renderBoldText = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <Text key={index} style={{ fontWeight: '800', color: '#00665E' }}>{part.slice(2, -2)}</Text>;
      }
      return <Text key={index} style={{ color: '#2C3E50', lineHeight: 24 }}>{part}</Text>;
    });
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
          <Ionicons name="notifications" size={24} color="#566B80" />
        </TouchableOpacity>
      </View>

      {/* Toggle Bar */}
      <View style={{ backgroundColor: '#FFFFFF', paddingHorizontal: 24, paddingBottom: 16, paddingTop: 16 }}>
        <View style={{ flexDirection: 'row', backgroundColor: '#F0F2F5', borderRadius: 100, padding: 4 }}>
          <TouchableOpacity style={{ flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 100 }}>
            <Text style={{ fontWeight: '600', fontSize: 13, color: '#8A9BA8' }}>Class Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 100, backgroundColor: '#00665E', }}>
            <Text style={{ fontWeight: '700', fontSize: 13, color: '#FFFFFF' }}>Wrenly AI Assistant</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat Feed */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
          
          {/* Date Pill */}
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <View style={{ backgroundColor: '#E2E8F0', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 100 }}>
              <Text style={{ color: '#566B80', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>TODAY</Text>
            </View>
          </View>

          {messages.length === 0 && (
            <View style={{ alignItems: 'center', marginTop: 40, opacity: 0.5 }}>
              <View style={{ overflow: 'hidden', width: 80, height: 80, alignSelf: 'center', marginBottom: 16, alignItems: 'center', justifyContent: 'center', borderRadius: 40, backgroundColor: '#00665E' }}>
                <Image source={require('@/assets/images/wrenly-icon.png')} style={{ width: 140, height: 140 }} resizeMode="contain" />
              </View>
              <Text style={{ color: '#566B80', fontSize: 15, textAlign: 'center' }}>
                Hi! I'm Wrenly, your AI assistant.{"\n"}Ask me anything you'd like to learn!
              </Text>
            </View>
          )}

          {messages.map((msg) => {
            if (msg.role === 'user') {
              return (
                <View key={msg.id} style={{ alignItems: 'flex-end', marginBottom: 24 }}>
                  <View style={{ backgroundColor: '#E2E8F0', padding: 16, borderRadius: 20, borderTopRightRadius: 4, maxWidth: '85%' }}>
                    <Text style={{ color: '#2C3E50', fontSize: 15, lineHeight: 22 }}>
                      {msg.content}
                    </Text>
                  </View>
                </View>
              );
            } else {
              return (
                <View key={msg.id} style={{ flexDirection: 'row', marginBottom: 24, alignItems: 'flex-end' }}>
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#00665E', alignItems: 'center', justifyContent: 'center', marginRight: 12, marginBottom: 8, overflow: 'hidden' }}>
                    <Image source={require('@/assets/images/wrenly-icon.png')} style={{ width: 80, height: 80 }} resizeMode="contain" />
                  </View>
                  <View style={{ flex: 1, backgroundColor: '#F0FDF8', padding: 20, borderRadius: 20, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#E8F7F5' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <Text style={{ color: '#00665E', fontWeight: '800', fontSize: 13 }}>Wrenly AI</Text>
                      <TouchableOpacity onPress={() => handleListen(msg.content)} style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="volume-medium" size={16} color="#00665E" style={{ marginRight: 4 }} />
                        <Text style={{ color: '#00665E', fontSize: 13, fontWeight: '600' }}>Listen</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={{ color: '#2C3E50', fontSize: 15, lineHeight: 24 }}>
                      {renderBoldText(msg.content)}
                    </Text>
                  </View>
                </View>
              );
            }
          })}

          {/* AI Typing Indicator */}
          {isTyping && (
            <View style={{ flexDirection: 'row', marginBottom: 24, alignItems: 'flex-end' }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#00665E', alignItems: 'center', justifyContent: 'center', marginRight: 12, marginBottom: 8, overflow: 'hidden' }}>
                <Image source={require('@/assets/images/wrenly-icon.png')} style={{ width: 80, height: 80 }} resizeMode="contain" />
              </View>
              <View style={{ backgroundColor: '#F0FDF8', paddingHorizontal: 20, paddingVertical: 16, borderRadius: 20, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#E8F7F5', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#8ED1C6' }} />
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#00665E' }} />
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#8ED1C6' }} />
              </View>
            </View>
          )}

        </ScrollView>

        {/* Input Bar */}
        <View style={{ padding: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F0F2F5', flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F6F9', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 4, marginRight: 12 }}>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={sendMessage}
              placeholder="Ask Wrenly to explain..."
              placeholderTextColor="#A0AEBA"
              style={{ flex: 1, height: 40, fontSize: 15, color: '#2C3E50' }}
            />
            <TouchableOpacity onPress={sendMessage} disabled={!inputText.trim()} style={{ padding: 8, opacity: !inputText.trim() ? 0.5 : 1 }}>
              <Ionicons name="send" size={20} color="#00665E" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#00665E', alignItems: 'center', justifyContent: 'center', }}>
            <MaterialCommunityIcons name="microphone" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}
