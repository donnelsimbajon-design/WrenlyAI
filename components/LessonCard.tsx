import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '@/config/theme';

interface LessonCardProps {
  title: string;
  isCompleted?: boolean;
  languages?: ('EN' | 'TL' | 'CEB')[];
  onPress?: () => void;
}

export const LessonCard: React.FC<LessonCardProps> = ({ 
  title, 
  isCompleted = false, 
  languages = ['EN', 'TL', 'CEB'],
  onPress 
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: '#FFFFFF', 
        borderRadius: 14, 
        padding: 14, 
        marginBottom: 10,
        flexDirection: 'row', 
        alignItems: 'center',
        borderWidth: 1, 
        borderColor: '#F0F2F5',
        }}
    >
      <View style={{ 
        width: 44, 
        height: 44, 
        borderRadius: 12, 
        backgroundColor: isCompleted ? '#E8F7F5' : '#F0FAF8', 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginRight: 14 
      }}>
        {isCompleted ? (
          <Feather name="check-circle" size={20} color={theme.colors.wrenly.primary} />
        ) : (
          <Feather name="book" size={20} color={theme.colors.wrenly.primary} />
        )}
      </View>
      
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#1F2937' }} numberOfLines={1}>
          {title}
        </Text>
        {languages.length > 0 && (
          <View style={{ flexDirection: 'row', marginTop: 4 }}>
            {languages.map(lang => (
              <View key={lang} style={{ 
                backgroundColor: '#F3F4F6', 
                paddingHorizontal: 6, 
                paddingVertical: 2, 
                borderRadius: 4, 
                marginRight: 4 
              }}>
                <Text style={{ fontSize: 10, color: '#6B7280', fontWeight: '600' }}>{lang}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      
      <Feather name="chevron-right" size={18} color="#C7D0DA" />
    </TouchableOpacity>
  );
};
