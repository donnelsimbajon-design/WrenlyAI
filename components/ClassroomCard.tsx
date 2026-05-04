import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '@/config/theme';
import type { Classroom } from '@/modules/classroom/classroom.service';

// ─── Subject color palette ────────────────────────────────────────────────────

function getSubjectColor(subject?: string): { strip: string; bg: string; text: string } {
  const s = (subject ?? '').toLowerCase();
  if (s.includes('math')) return { strip: '#6366F1', bg: '#EEF2FF', text: '#4F46E5' };
  if (s.includes('science') || s.includes('biology') || s.includes('chemistry') || s.includes('physics'))
    return { strip: '#10B981', bg: '#ECFDF5', text: '#059669' };
  if (s.includes('english') || s.includes('literature') || s.includes('reading'))
    return { strip: '#F43F5E', bg: '#FFF1F2', text: '#E11D48' };
  if (s.includes('history') || s.includes('social') || s.includes('araling'))
    return { strip: '#F59E0B', bg: '#FFFBEB', text: '#D97706' };
  if (s.includes('filipino') || s.includes('tagalog'))
    return { strip: '#8B5CF6', bg: '#F5F3FF', text: '#7C3AED' };
  return { strip: theme.colors.wrenly.primary, bg: '#F0FAF8', text: theme.colors.wrenly.primary };
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface ClassroomCardProps {
  classroom: Classroom;
  role: 'teacher' | 'student';
  onPress?: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ClassroomCard({ classroom, role, onPress }: ClassroomCardProps) {
  const colors = getSubjectColor(classroom.subject);
  const initial = classroom.name.charAt(0).toUpperCase();

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        marginBottom: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F0F2F5',
      }}
    >
      {/* Colored top strip */}
      <View style={{ backgroundColor: colors.strip, height: 6 }} />

      <View style={{ padding: 16 }}>
        {/* Top row: icon + name + chevron */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <View style={{
            width: 44, height: 44, borderRadius: 13,
            backgroundColor: colors.bg,
            alignItems: 'center', justifyContent: 'center',
            marginRight: 12,
          }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: colors.text }}>{initial}</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '800', color: '#1F2937' }} numberOfLines={1}>
              {classroom.name}
            </Text>
            {classroom.subject && (
              <Text style={{ fontSize: 12, color: colors.text, fontWeight: '600', marginTop: 2 }}>
                {classroom.subject}
              </Text>
            )}
            {role === 'student' && classroom.teacherName && (
              <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>
                {classroom.teacherName}
              </Text>
            )}
          </View>

          <Feather name="chevron-right" size={20} color="#C7D0DA" />
        </View>

        {/* Divider */}
        <View style={{ height: 1, backgroundColor: '#F3F4F6', marginBottom: 12 }} />

        {/* Bottom row: stats + code */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {/* Student count */}
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
            }}>
              <MaterialCommunityIcons name="account-group" size={13} color="#6B7280" />
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#6B7280', marginLeft: 4 }}>
                {classroom.studentCount}
              </Text>
            </View>

            {/* Material count */}
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
            }}>
              <Feather name="file-text" size={13} color="#6B7280" />
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#6B7280', marginLeft: 4 }}>
                {classroom.materialCount}
              </Text>
            </View>
          </View>

          {/* Join code — teacher only */}
          {role === 'teacher' && (
            <View style={{
              backgroundColor: colors.bg,
              borderWidth: 1, borderColor: colors.strip + '50',
              paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
            }}>
              <Text style={{ fontSize: 13, fontWeight: '900', color: colors.text, letterSpacing: 1.5 }}>
                {classroom.class_code}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
