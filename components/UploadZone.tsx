import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface UploadZoneProps {
  onPress: () => void;
  disabled?: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onPress, disabled }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{ 
        width: '100%', 
        borderWidth: 2, 
        borderStyle: 'dashed', 
        borderColor: '#E2E8F0', 
        borderRadius: 16, 
        padding: 32, 
        alignItems: 'center', 
        justifyContent: 'center', 
        backgroundColor: '#FFFFFF', 
        marginBottom: 32, 
        opacity: disabled ? 0.5 : 1 
      }}
    >
      <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#E8F7F5', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <Feather name="upload-cloud" size={32} color="#00665E" />
      </View>
      <Text style={{ fontSize: 18, fontWeight: '800', color: '#2C3E50', marginBottom: 4 }}>Tap to select files</Text>
      <Text style={{ fontSize: 13, color: '#8A9BA8', textAlign: 'center', marginBottom: 20 }}>
        Supported: PDF, PPT, MP4, DOCX (max 150MB)
      </Text>
      <View style={{ backgroundColor: '#00665E', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 }}>
        <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>Browse Files</Text>
      </View>
    </TouchableOpacity>
  );
};
