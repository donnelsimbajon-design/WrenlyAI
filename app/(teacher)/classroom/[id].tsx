import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Modal, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/modules/security/useAuth';
import { useClassroom } from '@/modules/classroom/useClassroom';
import { AnnouncementCard } from '@/components/AnnouncementCard';
import { MemberAvatar } from '@/components/MemberAvatar';
import { theme } from '@/config/theme';

type Tab = 'Materials' | 'Chat' | 'Members' | 'Analytics';
const TABS: Tab[] = ['Materials', 'Chat', 'Members', 'Analytics'];

export default function TeacherClassroomDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const {
    currentClassroom, members, announcements, materials,
    isLoading,
    fetchClassroom, fetchMembers, fetchAnnouncements, fetchMaterials, postAnnouncement,
  } = useClassroom();

  const [activeTab, setActiveTab] = useState<Tab>('Materials');
  const [annModal, setAnnModal] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annBody, setAnnBody] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchClassroom(id);
    fetchMembers(id);
    fetchAnnouncements(id);
    fetchMaterials(id);
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
                <View key={m.id} style={{
                  backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 10,
                  flexDirection: 'row', alignItems: 'center',
                  borderWidth: 1, borderColor: '#F0F2F5',
                  shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1,
                }}>
                  <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: '#F0FAF8', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                    <Feather name="file" size={18} color={theme.colors.wrenly.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#1F2937' }} numberOfLines={1}>{m.title}</Text>
                    <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{m.file_type?.toUpperCase()} · {m.processing_status}</Text>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {activeTab === 'Chat' && (
          <View style={{ alignItems: 'center', paddingTop: 40 }}>
            <Ionicons name="chatbubble-ellipses-outline" size={48} color="#D1D5DB" />
            <Text style={{ color: '#9CA3AF', marginTop: 16, fontSize: 14 }}>Chat module coming soon.</Text>
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
          <View style={{ alignItems: 'center', paddingTop: 40 }}>
            <Feather name="bar-chart-2" size={48} color="#D1D5DB" />
            <Text style={{ color: '#9CA3AF', marginTop: 16, fontSize: 14 }}>Analytics module coming soon.</Text>
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
