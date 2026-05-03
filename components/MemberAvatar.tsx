import React from 'react';
import { View, Text } from 'react-native';

interface MemberAvatarProps {
  members: { id: string; full_name: string }[];
  max?: number;
  size?: number;
}

function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  { bg: '#E8F7F5', text: '#006D5B' },
  { bg: '#EEF2FF', text: '#4F46E5' },
  { bg: '#FFF1F2', text: '#E11D48' },
  { bg: '#FFFBEB', text: '#D97706' },
  { bg: '#F5F3FF', text: '#7C3AED' },
];

export function MemberAvatar({ members, max = 4, size = 34 }: MemberAvatarProps) {
  const visible = members.slice(0, max);
  const overflow = members.length - max;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {visible.map((member, i) => {
        const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
        return (
          <View
            key={member.id}
            style={{
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color.bg,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: '#FFFFFF',
              marginLeft: i === 0 ? 0 : -(size / 4),
              zIndex: visible.length - i,
            }}
          >
            <Text style={{ fontSize: size * 0.32, fontWeight: '800', color: color.text }}>
              {getInitials(member.full_name)}
            </Text>
          </View>
        );
      })}

      {overflow > 0 && (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: '#F3F4F6',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: '#FFFFFF',
            marginLeft: -(size / 4),
          }}
        >
          <Text style={{ fontSize: size * 0.28, fontWeight: '800', color: '#6B7280' }}>
            +{overflow}
          </Text>
        </View>
      )}
    </View>
  );
}
