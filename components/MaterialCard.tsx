import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome5, Feather } from '@expo/vector-icons';
import { Material } from '@/types/materials.types';

interface MaterialCardProps {
  material: Material;
  onPress?: () => void;
  onDelete?: () => void;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({ material, onPress, onDelete }) => {
  const getFileIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'pdf': return <FontAwesome5 name="file-pdf" size={24} color="#FF4757" />;
      case 'pptx':
      case 'ppt': return <FontAwesome5 name="file-powerpoint" size={24} color="#F5A623" />;
      case 'mp4': return <FontAwesome5 name="file-video" size={24} color="#6C63FF" />;
      case 'docx':
      case 'doc': return <FontAwesome5 name="file-word" size={24} color="#00C896" />;
      default: return <FontAwesome5 name="file-alt" size={24} color="#8A9BA8" />;
    }
  };

  const handleMenuPress = () => {
    Alert.alert(
      'Material Options',
      'What would you like to do?',
      [
        { text: 'View Details', onPress: onPress },
        { text: 'Delete', onPress: onDelete, style: 'destructive' },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F0F2F5',
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        }}
    >
      <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#FAFAFA', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
        {getFileIcon(material.file_type)}
      </View>
      <View style={{ flex: 1, paddingRight: 8 }}>
        <Text style={{ color: '#2C3E50', fontWeight: '700', fontSize: 15, marginBottom: 4 }} numberOfLines={1}>
          {material.title}
        </Text>
        <Text style={{ color: '#8A9BA8', fontSize: 12 }}>
          {new Date(material.created_at).toLocaleDateString()}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {material.processing_status === 'done' ? (
          <View style={{ backgroundColor: '#E8F7F5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginRight: 8 }}>
            <Text style={{ color: '#00665E', fontWeight: '800', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>READY</Text>
          </View>
        ) : material.processing_status === 'processing' ? (
          <View style={{ backgroundColor: '#FFF0ED', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginRight: 8 }}>
            <Text style={{ color: '#FF4757', fontWeight: '800', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>PROCESSING</Text>
          </View>
        ) : (
          <View style={{ backgroundColor: '#F0F2F5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginRight: 8 }}>
            <Text style={{ color: '#8A9BA8', fontWeight: '800', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>{material.processing_status}</Text>
          </View>
        )}
        <TouchableOpacity onPress={handleMenuPress} style={{ padding: 4 }}>
          <Feather name="more-vertical" size={20} color="#8A9BA8" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};
