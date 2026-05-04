import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, SafeAreaView as RNSafeArea,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/modules/security/useAuth';
import { useClassroom } from '@/modules/classroom/useClassroom';
import { ClassroomCard } from '@/components/ClassroomCard';
import { theme } from '@/config/theme';

export default function TeacherDashboard() {
  const { user, signOut } = useAuth();
  const { classrooms, isLoading, fetchMyClassrooms } = useClassroom();

  const teacherName = user?.full_name ?? 'Teacher';
  const initials = teacherName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const totalStudents = classrooms.reduce((sum, c) => sum + c.studentCount, 0);

  useEffect(() => {
    if (user?.id) fetchMyClassrooms(user.id, 'teacher');
  }, [user?.id]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }} edges={['top']}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ──────────────────────────────────────────────── */}
        <View style={{
          paddingHorizontal: 24, paddingTop: 20, paddingBottom: 20,
          backgroundColor: '#FFFFFF',
          borderBottomWidth: 1, borderBottomColor: '#F0F2F5',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 44, height: 44, borderRadius: 22,
                backgroundColor: '#E8F7F5',
                alignItems: 'center', justifyContent: 'center',
                marginRight: 12,
              }}>
                <Text style={{ fontSize: 15, fontWeight: '800', color: theme.colors.wrenly.primary }}>
                  {initials}
                </Text>
              </View>
              <View>
                <Text style={{ fontSize: 12, color: '#9CA3AF', fontWeight: '600' }}>
                  {greeting}
                </Text>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#1F2937' }} numberOfLines={1}>
                  {teacherName}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{
                  width: 40, height: 40, borderRadius: 20,
                  backgroundColor: '#F3F4F6',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Ionicons name="notifications-outline" size={20} color="#6B7280" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={signOut}
                style={{
                  width: 40, height: 40, borderRadius: 20,
                  backgroundColor: '#F3F4F6',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Feather name="log-out" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Stats row ────────────────────────────────────────────── */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 24, paddingTop: 20, gap: 12, marginBottom: 8 }}>
          <View style={{
            flex: 1, backgroundColor: theme.colors.wrenly.primary,
            borderRadius: 16, padding: 16,
          }}>
            <Text style={{ fontSize: 28, fontWeight: '900', color: '#FFFFFF' }}>
              {classrooms.length}
            </Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginTop: 2 }}>
              Classes
            </Text>
          </View>
          <View style={{
            flex: 1, backgroundColor: '#FFFFFF',
            borderRadius: 16, padding: 16,
            borderWidth: 1, borderColor: '#F0F2F5',
            }}>
            <Text style={{ fontSize: 28, fontWeight: '900', color: '#1F2937' }}>
              {totalStudents}
            </Text>
            <Text style={{ fontSize: 12, color: '#9CA3AF', fontWeight: '600', marginTop: 2 }}>
              Students
            </Text>
          </View>
        </View>

        {/* ── My Classrooms ─────────────────────────────────────────── */}
        <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#1F2937' }}>
              My Classrooms
            </Text>
            <TouchableOpacity onPress={() => router.push('/(teacher)/classroom/create')}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: theme.colors.wrenly.primary }}>
                + New
              </Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={{ alignItems: 'center', paddingTop: 40 }}>
              <ActivityIndicator color={theme.colors.wrenly.primary} size="large" />
            </View>
          ) : classrooms.length === 0 ? (
            // Empty state
            <View style={{
              backgroundColor: '#FFFFFF', borderRadius: 20, padding: 32,
              alignItems: 'center',
              borderWidth: 1, borderColor: '#F0F2F5', borderStyle: 'dashed',
            }}>
              <View style={{
                width: 64, height: 64, borderRadius: 32,
                backgroundColor: '#F0FAF8', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
              }}>
                <Feather name="book-open" size={28} color={theme.colors.wrenly.primary} />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#1F2937', marginBottom: 8 }}>
                No classrooms yet
              </Text>
              <Text style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', marginBottom: 20 }}>
                Create your first classroom to get started with your students.
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(teacher)/classroom/create')}
                style={{
                  backgroundColor: theme.colors.wrenly.primary,
                  paddingHorizontal: 24, paddingVertical: 12,
                  borderRadius: 12,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>
                  Create Classroom
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            classrooms.map((classroom) => (
              <ClassroomCard
                key={classroom.id}
                classroom={classroom}
                role="teacher"
                onPress={() => router.push(`/(teacher)/classroom/${classroom.id}`)}
              />
            ))
          )}
        </View>

        {/* ── Quick actions ─────────────────────────────────────────── */}
        {classrooms.length > 0 && (
          <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>
            <Text style={{ fontSize: 14, fontWeight: '800', color: '#1F2937', marginBottom: 12 }}>
              Quick Actions
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => router.push('/(teacher)/upload')}
                style={{
                  flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16,
                  alignItems: 'center', borderWidth: 1, borderColor: '#F0F2F5',
                  }}
              >
                <Feather name="upload-cloud" size={22} color={theme.colors.wrenly.primary} />
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#374151', marginTop: 8 }}>
                  Upload Material
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/(teacher)/ai-settings')}
                style={{
                  flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16,
                  alignItems: 'center', borderWidth: 1, borderColor: '#F0F2F5',
                  }}
              >
                <Feather name="settings" size={22} color={theme.colors.wrenly.primary} />
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#374151', marginTop: 8 }}>
                  AI Settings
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ── Floating Action Button ──────────────────────────────────── */}
      <TouchableOpacity
        onPress={() => router.push('/(teacher)/classroom/create')}
        style={{
          position: 'absolute', bottom: 32, right: 24,
          width: 58, height: 58, borderRadius: 29,
          backgroundColor: theme.colors.wrenly.primary,
          alignItems: 'center', justifyContent: 'center',
          zIndex: 10, elevation: 4,
          }}
      >
        <Feather name="plus" size={26} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
