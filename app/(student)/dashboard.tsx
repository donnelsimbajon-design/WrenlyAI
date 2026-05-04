import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/modules/security/useAuth';
import { useClassroom } from '@/modules/classroom/useClassroom';
import { ClassroomCard } from '@/components/ClassroomCard';
import { theme } from '@/config/theme';

export default function StudentDashboard() {
  const { user, signOut } = useAuth();
  const { classrooms, isLoading, fetchMyClassrooms } = useClassroom();

  const studentName = user?.full_name ?? 'Student';
  const initials = studentName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    if (user?.id) fetchMyClassrooms(user.id, 'student');
  }, [user?.id]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }} edges={['top']}>
      <StatusBar style="dark" />

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {/* ── Header ─────────────────────────────────────────────────── */}
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
                  {studentName}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: '#F3F4F6',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Ionicons name="notifications-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ paddingHorizontal: 24, paddingTop: 24 }}>

          {/* ── Join a Class CTA ───────────────────────────────────────── */}
          <TouchableOpacity
            onPress={() => router.push('/(student)/join')}
            style={{
              backgroundColor: theme.colors.wrenly.primary,
              borderRadius: 18, padding: 20,
              flexDirection: 'row', alignItems: 'center',
              marginBottom: 28,
              shadowColor: theme.colors.wrenly.primary,
              }}
          >
            <View style={{
              width: 48, height: 48, borderRadius: 14,
              backgroundColor: 'rgba(255,255,255,0.2)',
              alignItems: 'center', justifyContent: 'center',
              marginRight: 16,
            }}>
              <Feather name="plus" size={24} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#FFFFFF' }}>
                Join a Class
              </Text>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
                Enter a class code from your teacher
              </Text>
            </View>
            <Feather name="arrow-right" size={20} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>

          {/* ── My Classes ─────────────────────────────────────────────── */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#1F2937' }}>
              My Classes
            </Text>
            <Text style={{ fontSize: 12, color: '#9CA3AF', fontWeight: '600' }}>
              {classrooms.length} enrolled
            </Text>
          </View>

          {isLoading ? (
            <View style={{ alignItems: 'center', paddingTop: 40 }}>
              <ActivityIndicator color={theme.colors.wrenly.primary} size="large" />
            </View>
          ) : classrooms.length === 0 ? (
            <View style={{
              backgroundColor: '#FFFFFF', borderRadius: 20, padding: 32,
              alignItems: 'center',
              borderWidth: 1, borderColor: '#F0F2F5',
            }}>
              <View style={{
                width: 64, height: 64, borderRadius: 32,
                backgroundColor: '#F0FAF8', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
              }}>
                <Feather name="book" size={28} color={theme.colors.wrenly.primary} />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '800', color: '#1F2937', marginBottom: 8 }}>
                No classes yet
              </Text>
              <Text style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center' }}>
                Ask your teacher for a class code and tap "Join a Class" above.
              </Text>
            </View>
          ) : (
            classrooms.map((classroom) => (
              <ClassroomCard
                key={classroom.id}
                classroom={classroom}
                role="student"
                onPress={() => router.push(`/(student)/classroom/${classroom.id}`)}
              />
            ))
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
