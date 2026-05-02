import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function ChatScreen() {
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
          <TouchableOpacity style={{ flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 100, backgroundColor: '#00665E', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}>
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

          {/* User Message 1 */}
          <View style={{ alignItems: 'flex-end', marginBottom: 24 }}>
            <View style={{ backgroundColor: '#E2E8F0', padding: 16, borderRadius: 20, borderTopRightRadius: 4, maxWidth: '85%' }}>
              <Text style={{ color: '#2C3E50', fontSize: 15, lineHeight: 22 }}>
                Can you explain the difference between mitosis and meiosis in simple terms?
              </Text>
            </View>
          </View>

          {/* AI Message 1 */}
          <View style={{ flexDirection: 'row', marginBottom: 24, alignItems: 'flex-end' }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#00665E', alignItems: 'center', justifyContent: 'center', marginRight: 12, marginBottom: 8 }}>
              <FontAwesome5 name="paw" size={16} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1, backgroundColor: '#F0FDF8', padding: 20, borderRadius: 20, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#E8F7F5' }}>
              
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ color: '#00665E', fontWeight: '800', fontSize: 13 }}>Wrenly AI</Text>
                <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="volume-medium" size={16} color="#00665E" style={{ marginRight: 4 }} />
                  <Text style={{ color: '#00665E', fontSize: 13, fontWeight: '600' }}>Listen</Text>
                </TouchableOpacity>
              </View>

              <Text style={{ color: '#2C3E50', fontSize: 15, lineHeight: 24, marginBottom: 16 }}>
                Think of it like this: <Text style={{ fontWeight: '800' }}>Mitosis</Text> is about making "identical twins," while <Text style={{ fontWeight: '800' }}>Meiosis</Text> is about making "unique family members."
              </Text>
              
              <Text style={{ color: '#2C3E50', fontSize: 15, lineHeight: 24, marginBottom: 16 }}>
                <Text style={{ fontWeight: '800' }}>Mitosis:</Text> One cell divides into two identical cells. It's used for growth and repair in your body.
              </Text>

              <Text style={{ color: '#2C3E50', fontSize: 15, lineHeight: 24 }}>
                <Text style={{ fontWeight: '800' }}>Meiosis:</Text> This creates sperm and egg cells. It divides twice to result in four unique cells with half the DNA, which is why children look like a mix of both parents!
              </Text>

            </View>
          </View>

          {/* User Message 2 */}
          <View style={{ alignItems: 'flex-end', marginBottom: 24 }}>
            <View style={{ backgroundColor: '#E2E8F0', padding: 16, borderRadius: 20, borderTopRightRadius: 4, maxWidth: '85%' }}>
              <Text style={{ color: '#2C3E50', fontSize: 15, lineHeight: 22 }}>
                That makes sense! Which one happens more often in the human body?
              </Text>
            </View>
          </View>

          {/* AI Typing Indicator */}
          <View style={{ flexDirection: 'row', marginBottom: 24, alignItems: 'flex-end' }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#00665E', alignItems: 'center', justifyContent: 'center', marginRight: 12, marginBottom: 8 }}>
              <FontAwesome5 name="paw" size={16} color="#FFFFFF" />
            </View>
            <View style={{ backgroundColor: '#F0FDF8', paddingHorizontal: 20, paddingVertical: 16, borderRadius: 20, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#E8F7F5', flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#8ED1C6' }} />
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#00665E' }} />
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#8ED1C6' }} />
            </View>
          </View>

        </ScrollView>

        {/* Input Bar */}
        <View style={{ padding: 16, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F0F2F5', flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F6F9', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 4, marginRight: 12 }}>
            <TextInput
              placeholder="Ask Wrenly to explain..."
              placeholderTextColor="#A0AEBA"
              style={{ flex: 1, height: 40, fontSize: 15, color: '#2C3E50' }}
            />
            <TouchableOpacity style={{ padding: 8 }}>
              <Ionicons name="send" size={20} color="#00665E" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#00665E', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 }}>
            <MaterialCommunityIcons name="microphone" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

    </SafeAreaView>
  );
}
