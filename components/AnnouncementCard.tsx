import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '@/config/theme';
import type { Announcement } from '@/modules/classroom/classroom.service';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

interface AnnouncementCardProps {
  announcement: Announcement;
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  return (
    <View style={{
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: '#E8F4F1',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 1,
    }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
        <View style={{
          width: 32, height: 32, borderRadius: 10,
          backgroundColor: '#E8F7F5',
          alignItems: 'center', justifyContent: 'center',
          marginRight: 10,
        }}>
          <MaterialCommunityIcons name="bullhorn" size={16} color={theme.colors.wrenly.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 10, fontWeight: '800', color: theme.colors.wrenly.primary, letterSpacing: 0.5, textTransform: 'uppercase' }}>
            Announcement
          </Text>
          <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>
            {announcement.teacherName ?? 'Teacher'} · {timeAgo(announcement.created_at)}
          </Text>
        </View>
      </View>

      {/* Title */}
      <Text style={{ fontSize: 14, fontWeight: '700', color: '#1F2937', marginBottom: 6 }}>
        {announcement.title}
      </Text>

      {/* Body */}
      <Text style={{ fontSize: 13, color: '#6B7280', lineHeight: 20 }} numberOfLines={3}>
        {announcement.body}
      </Text>
    </View>
  );
}
