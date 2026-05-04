import React from 'react';
import { View, Text } from 'react-native';

interface UploadProgressProps {
  progress: number;
  status: string | null;
}

export const UploadProgress: React.FC<UploadProgressProps> = ({ progress, status }) => {
  return (
    <View style={{ backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#F0F2F5', marginBottom: 32, }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
        <Text style={{ color: '#2C3E50', fontWeight: '700', fontSize: 14, flex: 1, marginRight: 16 }}>
          {status || 'Processing...'}
        </Text>
        <Text style={{ color: '#00665E', fontWeight: '800', fontSize: 14 }}>{progress}%</Text>
      </View>
      <View style={{ width: '100%', backgroundColor: '#F0F2F5', height: 10, borderRadius: 5, overflow: 'hidden' }}>
        <View 
          style={{ height: '100%', backgroundColor: '#00665E', borderRadius: 5, width: `${progress}%` }} 
        />
      </View>
    </View>
  );
};
