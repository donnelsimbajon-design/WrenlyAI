import { AnnouncementCard } from '@/components/AnnouncementCard';
import { MemberAvatar } from '@/components/MemberAvatar';
import { MaterialCard } from '@/components/MaterialCard';
import { theme } from '@/config/theme';
import { useChat } from '@/modules/chat/useChat';
import { useClassroom } from '@/modules/classroom/useClassroom';
import { useAuth } from '@/modules/security/useAuth';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Tab = 'Materials' | 'Chat' | 'Members' | 'Analytics';
const TABS: Tab[] = ['Materials', 'Chat', 'Members', 'Analytics'];

export default function TeacherClassroomDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const {
    currentClassroom, members, announcements, materials,
    isLoading,
    fetchClassroom, fetchMembers, fetchAnnouncements, fetchMaterials, postAnnouncement,
    subscribeToUpdates, unsubscribeFromUpdates,
  } = useClassroom();

  const { messages, sendMessage, subscribeToMessages, unsubscribeFromMessages, isSending } = useChat();

  const [activeTab, setActiveTab] = useState<Tab>('Materials');
  const [annModal, setAnnModal] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annBody, setAnnBody] = useState('');
  const [posting, setPosting] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMode, setChatMode] = useState<'class' | 'ai'>('class');

  useEffect(() => {
    if (!id) return;
    fetchClassroom(id);
    fetchMembers(id);
    fetchAnnouncements(id);
    fetchMaterials(id);
    subscribeToMessages(id);
    
    // Enable real-time subscriptions for live updates
    const setupSubscriptions = async () => {
      await subscribeToUpdates(id);
    };
    setupSubscriptions();

    // Polling fallback: refresh materials every 2 seconds to catch status updates
    const materialsPollingInterval = setInterval(() => {
      fetchMaterials(id);
    }, 2000);

    return () => {
      unsubscribeFromUpdates();
      unsubscribeFromMessages();
      clearInterval(materialsPollingInterval);
    };
  }, [id]);

  const handlePostAnnouncement = async () => {
    if (!annTitle.trim()) return;
    setPosting(true);
    const { error } = await postAnnouncement(id!, user!.id, annTitle.trim(), annBody.trim());
    setPosting(false);
    if (error) { Alert.alert('Error', 'Could not post announcement.'); return; }
    setAnnModal(false);
    setAnnTitle('');
    setAnnBody('');
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !user?.id || !id) return;
    await sendMessage(id, user.id, chatInput.trim());
    setChatInput('');
  };

  const getAnalyticsData = () => {
    const totalStudents = members.length;
    const materialsCount = materials.length;
    const readyMaterials = materials.filter(m => m.processing_status === 'done').length;
    const avgProgress = totalStudents > 0 ? Math.round((readyMaterials / materialsCount) * 100) : 0;
    return { totalStudents, materialsCount, readyMaterials, avgProgress };
  };

  if (isLoading && !currentClassroom) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' }}>
        <ActivityIndicator color={theme.colors.wrenly.primary} size="large" />
      </View>
    );
  }

  const cls = currentClassroom;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }} edges={['top']}>
      <StatusBar style="dark" />

      {/* ── Header ─────────────────────────────────────────────────── */}
      <View style={{
        backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 0,
        borderBottomWidth: 1, borderBottomColor: '#F0F2F5',
      }}>
        {/* Top row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}
          >
            <Feather name="arrow-left" size={18} color="#374151" />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 17, fontWeight: '800', color: '#1F2937' }} numberOfLines={1}>
              {cls?.name ?? '…'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
              {/* Student count */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons name="account-group" size={13} color="#9CA3AF" />
                <Text style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 4 }}>
                  {cls?.studentCount ?? 0} students
                </Text>
              </View>

              {/* Join code chip */}
              <View style={{
                backgroundColor: '#F0FAF8', paddingHorizontal: 8, paddingVertical: 2,
                borderRadius: 8, borderWidth: 1, borderColor: theme.colors.wrenly.primary + '30',
              }}>
                <Text style={{ fontSize: 12, fontWeight: '800', color: theme.colors.wrenly.primary, letterSpacing: 1.5 }}>
                  {cls?.class_code}
                </Text>
              </View>
            </View>
          </View>

          {activeTab === 'Materials' ? (
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/(teacher)/upload', params: { classroomId: id } })}
              style={{
                backgroundColor: theme.colors.wrenly.primary,
                paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
                flexDirection: 'row', alignItems: 'center',
              }}
            >
              <Feather name="upload" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>Upload</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setAnnModal(true)}
              style={{
                backgroundColor: theme.colors.wrenly.primary,
                paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
                flexDirection: 'row', alignItems: 'center',
              }}
            >
              <Feather name="bell" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>Post</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tab bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 0 }}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                paddingHorizontal: 16, paddingBottom: 14, paddingTop: 4,
                borderBottomWidth: 2.5,
                borderBottomColor: activeTab === tab ? theme.colors.wrenly.primary : 'transparent',
                marginRight: 4,
              }}
            >
              <Text style={{
                fontSize: 14, fontWeight: '700',
                color: activeTab === tab ? theme.colors.wrenly.primary : '#9CA3AF',
              }}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Tab content ────────────────────────────────────────────── */}
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 80 }}>

        {activeTab === 'Materials' && (
          <>
            {/* Announcements at top */}
            {announcements.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#6B7280', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Announcements
                </Text>
                {announcements.slice(0, 2).map(a => (
                  <AnnouncementCard key={a.id} announcement={a} />
                ))}
              </View>
            )}

            {/* Materials list */}
            <Text style={{ fontSize: 13, fontWeight: '800', color: '#6B7280', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Uploaded Materials
            </Text>
            {materials.length === 0 ? (
              <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#F0F2F5' }}>
                <Feather name="upload-cloud" size={32} color="#D1D5DB" style={{ marginBottom: 12 }} />
                <Text style={{ color: '#9CA3AF', fontSize: 13, textAlign: 'center' }}>
                  No materials uploaded yet.{'\n'}Go to Upload to add files.
                </Text>
              </View>
            ) : (
              materials.map(m => (
                <MaterialCard 
                  key={m.id} 
                  material={m} 
                  onPress={() => router.push(`/(teacher)/material/${m.id}`)}
                />
              ))
            )}
          </>
        )}

        {activeTab === 'Chat' && (
          <View style={{ flex: 1 }}>
            {/* Chat Mode Toggle */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              <TouchableOpacity
                onPress={() => setChatMode('class')}
                style={{
                  flex: 1, paddingVertical: 10, borderRadius: 10,
                  backgroundColor: chatMode === 'class' ? theme.colors.wrenly.primary : '#F0F2F5',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontWeight: '700', color: chatMode === 'class' ? '#FFFFFF' : '#9CA3AF', fontSize: 13 }}>
                  Class Chat
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setChatMode('ai')}
                style={{
                  flex: 1, paddingVertical: 10, borderRadius: 10,
                  backgroundColor: chatMode === 'ai' ? theme.colors.wrenly.primary : '#F0F2F5',
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontWeight: '700', color: chatMode === 'ai' ? '#FFFFFF' : '#9CA3AF', fontSize: 13 }}>
                  AI Assistant
                </Text>
              </TouchableOpacity>
            </View>

            {/* Messages List */}
            {messages.length === 0 ? (
              <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                <Ionicons name="chatbubble-outline" size={48} color="#D1D5DB" />
                <Text style={{ color: '#9CA3AF', marginTop: 12, fontSize: 14 }}>
                  No messages yet. Start a conversation!
                </Text>
              </View>
            ) : (
              <FlatList
                data={messages}
                inverted
                scrollEnabled={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={{
                    marginBottom: 12,
                    alignItems: item.sender_id === user?.id ? 'flex-end' : 'flex-start',
                  }}>
                    <View style={{
                      maxWidth: '80%',
                      backgroundColor: item.sender_id === user?.id ? theme.colors.wrenly.primary : '#E8F7F5',
                      paddingHorizontal: 14, paddingVertical: 10,
                      borderRadius: 14,
                    }}>
                      {item.sender_id !== user?.id && (
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#6B7280', marginBottom: 4 }}>
                          {item.sender_name || 'Unknown'}
                        </Text>
                      )}
                      <Text style={{
                        fontSize: 14,
                        color: item.sender_id === user?.id ? '#FFFFFF' : '#1F2937',
                      }}>
                        {item.message}
                      </Text>
                      <Text style={{
                        fontSize: 11,
                        color: item.sender_id === user?.id ? 'rgba(255,255,255,0.7)' : '#9CA3AF',
                        marginTop: 4,
                      }}>
                        {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </View>
                )}
              />
            )}

            {/* Message Input */}
            <View style={{
              flexDirection: 'row', gap: 8, marginTop: 16,
              paddingHorizontal: 16, paddingVertical: 12,
              backgroundColor: '#FFFFFF', borderRadius: 14,
              borderWidth: 1, borderColor: '#F0F2F5',
            }}>
              <TextInput
                value={chatInput}
                onChangeText={setChatInput}
                placeholder="Type a message..."
                placeholderTextColor="#C4C9D4"
                style={{ flex: 1, fontSize: 14 }}
              />
              <TouchableOpacity
                onPress={handleSendMessage}
                disabled={!chatInput.trim() || isSending}
                style={{ justifyContent: 'center' }}
              >
                {isSending ? (
                  <ActivityIndicator size="small" color={theme.colors.wrenly.primary} />
                ) : (
                  <Feather name="send" size={18} color={chatInput.trim() ? theme.colors.wrenly.primary : '#D1D5DB'} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'Members' && (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: '#1F2937' }}>
                Enrolled Students ({members.length})
              </Text>
              <MemberAvatar members={members} max={4} />
            </View>

            {members.length === 0 ? (
              <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#F0F2F5' }}>
                <MaterialCommunityIcons name="account-group-outline" size={36} color="#D1D5DB" style={{ marginBottom: 12 }} />
                <Text style={{ color: '#9CA3AF', fontSize: 13 }}>No students enrolled yet.</Text>
              </View>
            ) : (
              members.map((m) => (
                <View key={m.id} style={{
                  backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 10,
                  flexDirection: 'row', alignItems: 'center',
                  borderWidth: 1, borderColor: '#F0F2F5',
                }}>
                  <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F7F5', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <Text style={{ fontWeight: '800', color: theme.colors.wrenly.primary }}>
                      {m.full_name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#1F2937' }}>{m.full_name}</Text>
                    {m.grade_level && (
                      <Text style={{ fontSize: 11, color: '#9CA3AF' }}>Grade {m.grade_level}</Text>
                    )}
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {activeTab === 'Analytics' && (
          <View>
            {(() => {
              const { totalStudents, materialsCount, readyMaterials, avgProgress } = getAnalyticsData();
              return (
                <>
                  <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
                    {/* Card 1: Total Students */}
                    <View style={{ flex: 1, backgroundColor: '#E8F7F5', borderRadius: 14, padding: 16, alignItems: 'center' }}>
                      <MaterialCommunityIcons name="account-group" size={24} color={theme.colors.wrenly.primary} />
                      <Text style={{ fontSize: 20, fontWeight: '800', color: '#1F2937', marginTop: 8 }}>
                        {totalStudents}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>Students</Text>
                    </View>

                    {/* Card 2: Materials Count */}
                    <View style={{ flex: 1, backgroundColor: '#FFF0ED', borderRadius: 14, padding: 16, alignItems: 'center' }}>
                      <Feather name="file" size={24} color="#FF4757" />
                      <Text style={{ fontSize: 20, fontWeight: '800', color: '#1F2937', marginTop: 8 }}>
                        {readyMaterials}/{materialsCount}
                      </Text>
                      <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>Ready</Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View style={{ backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F0F2F5' }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: '#1F2937' }}>
                        Course Readiness
                      </Text>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: theme.colors.wrenly.primary }}>
                        {avgProgress}%
                      </Text>
                    </View>
                    <View style={{ height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, overflow: 'hidden' }}>
                      <View
                        style={{
                          height: '100%',
                          backgroundColor: theme.colors.wrenly.primary,
                          width: `${avgProgress}%`,
                        }}
                      />
                    </View>
                  </View>

                  {/* Materials Status */}
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#1F2937', marginBottom: 12 }}>
                    Material Processing Status
                  </Text>
                  {materials.length === 0 ? (
                    <View style={{ backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#F0F2F5' }}>
                      <Text style={{ color: '#9CA3AF', fontSize: 13 }}>No materials yet</Text>
                    </View>
                  ) : (
                    materials.map((m) => (
                      <View key={m.id} style={{
                        backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, marginBottom: 8,
                        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                        borderWidth: 1, borderColor: '#F0F2F5',
                      }}>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: '#1F2937', flex: 1 }} numberOfLines={1}>
                          {m.title}
                        </Text>
                        <View style={{
                          paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6,
                          backgroundColor: m.processing_status === 'done' ? '#E8F7F5' : m.processing_status === 'processing' ? '#FFF0ED' : '#F0F2F5',
                        }}>
                          <Text style={{
                            fontSize: 11, fontWeight: '700', textTransform: 'uppercase',
                            color: m.processing_status === 'done' ? '#00665E' : m.processing_status === 'processing' ? '#FF4757' : '#9CA3AF',
                          }}>
                            {m.processing_status}
                          </Text>
                        </View>
                      </View>
                    ))
                  )}
                </>
              );
            })()}
          </View>
        )}

      </ScrollView>

      {/* ── Announcement Modal ─────────────────────────────────────── */}
      <Modal visible={annModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#1F2937', marginBottom: 20 }}>
              Post Announcement
            </Text>

            <Text style={{ fontSize: 11, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Title</Text>
            <TextInput
              value={annTitle}
              onChangeText={setAnnTitle}
              placeholder="e.g. Quiz tomorrow!"
              placeholderTextColor="#C4C9D4"
              style={{ backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, fontSize: 15, marginBottom: 16 }}
            />

            <Text style={{ fontSize: 11, fontWeight: '700', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>Message</Text>
            <TextInput
              value={annBody}
              onChangeText={setAnnBody}
              placeholder="Details…"
              placeholderTextColor="#C4C9D4"
              multiline
              numberOfLines={4}
              style={{ backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', padding: 14, fontSize: 15, marginBottom: 24, minHeight: 90, textAlignVertical: 'top' }}
            />

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => setAnnModal(false)}
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center' }}
              >
                <Text style={{ fontWeight: '700', color: '#6B7280' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handlePostAnnouncement}
                disabled={posting || !annTitle.trim()}
                style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: theme.colors.wrenly.primary, alignItems: 'center', opacity: (!annTitle.trim() || posting) ? 0.6 : 1 }}
              >
                {posting ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={{ fontWeight: '700', color: '#FFFFFF' }}>Post</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
