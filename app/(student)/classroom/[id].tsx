import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/modules/security/useAuth';
import { useClassroom } from '@/modules/classroom/useClassroom';
import { AnnouncementCard } from '@/components/AnnouncementCard';
import { theme } from '@/config/theme';

type Tab = 'Lessons' | 'Chat' | 'Announcements';
const TABS: Tab[] = ['Lessons', 'Chat', 'Announcements'];

export default function StudentClassroomDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const {
    currentClassroom, announcements, materials, isLoading,
    fetchClassroom, fetchAnnouncements, fetchMaterials,
  } = useClassroom();

  const [activeTab, setActiveTab] = useState<Tab>('Lessons');

  useEffect(() => {
    if (!id) return;
    fetchClassroom(id);
    fetchAnnouncements(id);
    fetchMaterials(id);
  }, [id]);

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
            {cls?.teacherName && (
              <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                👤 {cls.teacherName}
              </Text>
            )}
          </View>
        </View>

        {/* Tab bar */}
        <View style={{ flexDirection: 'row' }}>
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
        </View>
      </View>

      {/* ── Tab content ────────────────────────────────────────────── */}
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 80 }}>

        {activeTab === 'Lessons' && (
          <>
            {materials.length === 0 ? (
              <View style={{ alignItems: 'center', paddingTop: 40 }}>
                <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#F0FAF8', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                  <Feather name="book-open" size={28} color={theme.colors.wrenly.primary} />
                </View>
                <Text style={{ fontSize: 15, fontWeight: '800', color: '#1F2937', marginBottom: 8 }}>
                  No lessons yet
                </Text>
                <Text style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center' }}>
                  Your teacher hasn't uploaded any materials yet.{'\n'}Check back soon!
                </Text>
              </View>
            ) : (
              materials.map((m) => (
                <TouchableOpacity
                  key={m.id}
                  style={{
                    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 10,
                    flexDirection: 'row', alignItems: 'center',
                    borderWidth: 1, borderColor: '#F0F2F5',
                    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1,
                  }}
                >
                  <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#F0FAF8', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                    <Feather name="book" size={20} color={theme.colors.wrenly.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#1F2937' }} numberOfLines={1}>{m.title}</Text>
                    <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{m.file_type?.toUpperCase()}</Text>
                  </View>
                  <Feather name="chevron-right" size={18} color="#C7D0DA" />
                </TouchableOpacity>
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

        {activeTab === 'Announcements' && (
          <>
            {announcements.length === 0 ? (
              <View style={{ alignItems: 'center', paddingTop: 40 }}>
                <Ionicons name="notifications-outline" size={48} color="#D1D5DB" />
                <Text style={{ color: '#9CA3AF', marginTop: 16, fontSize: 14 }}>
                  No announcements yet.
                </Text>
              </View>
            ) : (
              announcements.map(a => (
                <AnnouncementCard key={a.id} announcement={a} />
              ))
            )}
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
