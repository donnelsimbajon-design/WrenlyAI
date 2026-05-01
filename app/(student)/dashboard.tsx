import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import { useStudentDashboard } from '@/modules/classroom/useStudentDashboard';
import { OfflineBanner } from '@/components/ui/OfflineBanner';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const { classrooms, announcements, isLoading, isJoining, joinClass } = useStudentDashboard();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [classCode, setClassCode] = useState('');

  const handleJoinClass = async () => {
    if (!classCode.trim()) return;
    const result = await joinClass(classCode.trim());
    if (result.success) {
      setModalVisible(false);
      setClassCode('');
      Alert.alert('Success', 'You have successfully joined the class!');
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-wrenly-background" edges={['top']}>
      <StatusBar style="light" />
      <OfflineBanner />

      <ScrollView contentContainerClassName="p-6 pb-20">
        
        {/* Header Section */}
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-3xl font-bold text-wrenly-text tracking-tight font-poppins">
              Hello, {user?.full_name?.split(' ')[0] || 'Student'}
            </Text>
            <Text className="text-sm text-wrenly-textSecondary mt-1">Ready to learn today?</Text>
          </View>

          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="bg-wrenly-primary px-4 py-2 rounded-xl flex-row items-center shadow-sm"
          >
            <Text className="text-wrenly-text font-bold text-sm">+ Join Class</Text>
          </TouchableOpacity>
        </View>

        {/* Announcements Section */}
        <View className="mb-8">
          <Text className="text-xl font-bold text-wrenly-text mb-4 font-poppins">Recent Announcements</Text>
          {isLoading ? (
            <ActivityIndicator color="#00C896" />
          ) : announcements.length === 0 ? (
            <View className="bg-wrenly-surface p-4 rounded-2xl border border-wrenly-border items-center">
              <Text className="text-wrenly-textSecondary text-sm">No new announcements</Text>
            </View>
          ) : (
            announcements.map((ann) => (
              <View key={ann.id} className="bg-wrenly-surface p-4 rounded-2xl border border-wrenly-border mb-3 shadow-sm">
                <Text className="text-wrenly-text font-semibold text-base mb-1">{ann.title}</Text>
                <Text className="text-wrenly-textSecondary text-xs mb-2">
                  {new Date(ann.created_at).toLocaleDateString()}
                </Text>
                <Text className="text-wrenly-text text-sm" numberOfLines={2}>{ann.body}</Text>
              </View>
            ))
          )}
        </View>

        {/* Subjects Grid */}
        <View>
          <Text className="text-xl font-bold text-wrenly-text mb-4 font-poppins">My Subjects</Text>
          {isLoading ? (
            <ActivityIndicator color="#00C896" />
          ) : classrooms.length === 0 ? (
            <View className="bg-wrenly-surface p-6 rounded-2xl border border-wrenly-border items-center text-center">
              <Text className="text-wrenly-textSecondary text-center">
                You haven't joined any classes yet.{'\n'}Tap "+ Join Class" to get started!
              </Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {classrooms.map((c: any) => (
                <View key={c.id} className="w-[48%] bg-wrenly-surface p-4 rounded-2xl border border-wrenly-border mb-4 shadow-sm">
                  <View className="w-10 h-10 rounded-full bg-wrenly-background items-center justify-center mb-3">
                    <Text className="text-wrenly-accent text-lg">📚</Text>
                  </View>
                  <Text className="text-wrenly-text font-bold text-base mb-1" numberOfLines={1}>{c.subject || c.name}</Text>
                  <Text className="text-wrenly-textSecondary text-xs mb-3" numberOfLines={1}>
                    {c.profiles?.full_name ? `Mr. ${c.profiles.full_name.split(' ').pop()}` : 'Teacher'}
                  </Text>
                  
                  {/* Fake Progress for now, later fetched from quiz_attempts */}
                  <View className="w-full bg-wrenly-background h-2 rounded-full overflow-hidden">
                    <View className="h-full bg-wrenly-primary rounded-full" style={{ width: '45%' }} />
                  </View>
                  <Text className="text-right text-[10px] text-wrenly-primary font-bold mt-1">45%</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Join Class Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center px-6">
          <View className="bg-wrenly-surface w-full p-6 rounded-2xl border border-wrenly-border shadow-lg">
            <Text className="text-xl font-bold text-wrenly-text mb-2 font-poppins">Join a Class</Text>
            <Text className="text-sm text-wrenly-textSecondary mb-6">Enter the class code provided by your teacher.</Text>
            
            <TextInput
              value={classCode}
              onChangeText={setClassCode}
              placeholder="e.g. A1B2C3"
              placeholderTextColor="#A0A0B0"
              autoCapitalize="characters"
              className="h-12 px-4 rounded-xl text-base text-wrenly-text bg-wrenly-background border border-wrenly-border mb-6 font-bold"
            />

            <View className="flex-row justify-end gap-3">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="px-4 py-2 rounded-xl border border-wrenly-border justify-center"
              >
                <Text className="text-wrenly-text font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleJoinClass}
                disabled={isJoining || !classCode.trim()}
                className={`bg-wrenly-primary px-6 py-2 rounded-xl justify-center ${isJoining || !classCode.trim() ? 'opacity-50' : ''}`}
              >
                <Text className="text-wrenly-text font-bold">{isJoining ? 'Joining...' : 'Join'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
