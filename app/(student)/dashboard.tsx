import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/modules/security/useAuth';
import { useStudentDashboard } from '@/modules/classroom/useStudentDashboard';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { FontAwesome5, Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function StudentDashboard() {
  const { user } = useAuth();
  const isLoading = false;
  const isJoining = false;
  const joinClass = async (code: string) => ({ success: true });
  
  const announcements = [
    { id: '1', title: 'Science Fair project submissions are due next Friday. Please finalize your topics!', created_at: new Date().toISOString() },
    { id: '2', title: 'Welcome to the new semester! Please review the updated syllabus in the Materials tab.', created_at: new Date(Date.now() - 86400000).toISOString() },
  ];

  const classrooms = [
    { id: '1', subject: 'Advanced Mathematics', name: 'Advanced Mathematics', profiles: { full_name: 'Sarah Jenkins' } },
    { id: '2', subject: 'World History', name: 'World History', profiles: { full_name: 'Robert Chen' } },
  ];
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

  const studentName = user?.full_name || 'Student Name';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }} edges={['top']}>
      <StatusBar style="dark" />
      <OfflineBanner />

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        
        {/* Header Section */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E0F0F0', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
              <FontAwesome5 name="user-graduate" size={18} color="#00665E" />
            </View>
            <View>
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#8A9BA8', letterSpacing: 0.5 }}>DASHBOARD</Text>
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#00665E' }}>Wrenly</Text>
            </View>
          </View>
          <TouchableOpacity style={{ position: 'relative' }}>
            <Ionicons name="notifications" size={24} color="#566B80" />
            <View style={{ position: 'absolute', top: 0, right: 2, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4757', borderWidth: 1, borderColor: '#FAFAFA' }} />
          </TouchableOpacity>
        </View>

        {/* Greeting & Action */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 32, fontWeight: '800', color: '#00665E', letterSpacing: -0.5, lineHeight: 36, marginBottom: 8 }}>
            Hello, {studentName}
          </Text>
          <Text style={{ fontSize: 13, color: '#6A7A82', marginBottom: 20 }}>
            You have 2 lessons scheduled for today.
          </Text>

          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={{ width: '100%', height: 48, backgroundColor: '#00665E', borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' }}
          >
            <Feather name="plus" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>Join Class</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Announcements Section */}
        <View style={{ marginBottom: 36 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#2C3E50' }}>Recent Announcements</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="chevron-left" size={16} color="#A0AEBA" />
              </TouchableOpacity>
              <TouchableOpacity style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' }}>
                <Feather name="chevron-right" size={16} color="#566B80" />
              </TouchableOpacity>
            </View>
          </View>

          {isLoading ? (
            <ActivityIndicator color="#00665E" />
          ) : announcements.length === 0 ? (
            <View style={{ backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F0F2F5', alignItems: 'center' }}>
              <Text style={{ color: '#8A9BA8', fontSize: 13 }}>No new announcements</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 24 }} style={{ marginHorizontal: -24, paddingLeft: 24 }}>
              {announcements.map((ann) => (
                <View key={ann.id} style={{ width: 260, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2, marginRight: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F7F5', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginBottom: 12 }}>
                    <MaterialCommunityIcons name="bullhorn" size={12} color="#00665E" style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#00665E', letterSpacing: 0.5 }}>SCHOOL EVENT</Text>
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#2C3E50', marginBottom: 16, lineHeight: 22 }} numberOfLines={3}>
                    {ann.title}
                  </Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                    <Text style={{ fontSize: 12, color: '#8A9BA8', fontWeight: '500' }}>{new Date(ann.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                    <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#00665E', marginRight: 4 }}>Read more</Text>
                      <Feather name="arrow-right" size={12} color="#00665E" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* My Subjects Grid */}
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#2C3E50' }}>My Subjects</Text>
            <TouchableOpacity>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#00665E' }}>View All</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator color="#00665E" />
          ) : classrooms.length === 0 ? (
            <View style={{ backgroundColor: '#FFFFFF', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#F0F2F5', alignItems: 'center' }}>
              <Text style={{ color: '#8A9BA8', textAlign: 'center', fontSize: 13 }}>
                You haven't joined any classes yet.{'\n'}Tap "+ Join Class" to get started!
              </Text>
            </View>
          ) : (
            <View>
              {classrooms.map((c: any, index: number) => {
                const subjectColors = ['#E8F7F5', '#F4F6F9', '#FFF0ED'];
                const headerColor = subjectColors[index % subjectColors.length];
                
                return (
                  <View key={c.id} style={{ backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2, marginBottom: 20 }}>
                    {/* Top colored section */}
                    <View style={{ backgroundColor: headerColor, padding: 16, paddingBottom: 24 }}>
                      <View style={{ backgroundColor: '#00665E', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, marginBottom: 16 }}>
                        <Text style={{ fontSize: 9, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.5 }}>NEW MATERIALS</Text>
                      </View>
                      <Text style={{ fontSize: 16, fontWeight: '800', color: '#00665E' }} numberOfLines={1}>{c.subject || c.name}</Text>
                    </View>
                    
                    {/* Bottom details section */}
                    <View style={{ padding: 16, backgroundColor: '#FFFFFF' }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: '#F0F2F5', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                            <FontAwesome5 name="user" size={16} color="#8A9BA8" />
                          </View>
                          <View>
                            <Text style={{ fontSize: 10, color: '#8A9BA8', fontWeight: '600' }}>Teacher</Text>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: '#2C3E50' }}>{c.profiles?.full_name ? `Mr. ${c.profiles.full_name.split(' ').pop()}` : 'Teacher'}</Text>
                          </View>
                        </View>
                        
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#F0F2F5', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF', zIndex: 3 }}>
                            <Text style={{ fontSize: 8, fontWeight: '700', color: '#566B80' }}>JD</Text>
                          </View>
                          <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#E8F7F5', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFFFFF', marginLeft: -8, zIndex: 2 }}>
                            <Text style={{ fontSize: 8, fontWeight: '700', color: '#00665E' }}>MK</Text>
                          </View>
                          <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#FAFAFA', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#E2E8F0', marginLeft: -8, zIndex: 1 }}>
                            <Text style={{ fontSize: 8, fontWeight: '700', color: '#8A9BA8' }}>+12</Text>
                          </View>
                        </View>
                      </View>
                      
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <Text style={{ fontSize: 11, fontWeight: '600', color: '#8A9BA8' }}>Course Progress</Text>
                        <Text style={{ fontSize: 11, fontWeight: '800', color: '#00665E' }}>65%</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={{ flex: 1, height: 4, backgroundColor: '#F0F2F5', borderRadius: 2, overflow: 'hidden' }}>
                          <View style={{ width: '65%', height: '100%', backgroundColor: '#00665E', borderRadius: 2 }} />
                        </View>
                        <Feather name="chevron-right" size={16} color="#A0AEBA" style={{ marginLeft: 12 }} />
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Join Class Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#FFFFFF', width: '100%', padding: 24, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 5 }}>
            <Text style={{ fontSize: 20, fontWeight: '800', color: '#2C3E50', marginBottom: 8 }}>Join a Class</Text>
            <Text style={{ fontSize: 13, color: '#6A7A82', marginBottom: 24, lineHeight: 20 }}>Enter the class code provided by your teacher.</Text>
            
            <TextInput
              value={classCode}
              onChangeText={setClassCode}
              placeholder="e.g. A1B2C3"
              placeholderTextColor="#A0AEBA"
              autoCapitalize="characters"
              style={{ height: 48, paddingHorizontal: 16, borderRadius: 8, fontSize: 15, color: '#2C3E50', backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 24, fontWeight: '700' }}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={{ paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center' }}
              >
                <Text style={{ color: '#566B80', fontWeight: '700', fontSize: 14 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleJoinClass}
                disabled={isJoining || !classCode.trim()}
                style={{ backgroundColor: '#00665E', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, justifyContent: 'center', opacity: (isJoining || !classCode.trim()) ? 0.5 : 1 }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>{isJoining ? 'Joining...' : 'Join'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
