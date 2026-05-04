import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useMaterialUpload } from '@/modules/materials/useMaterialUpload';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { FontAwesome5 } from '@expo/vector-icons';
import { UploadZone } from '@/components/UploadZone';
import { UploadProgress } from '@/components/UploadProgress';
import { MaterialCard } from '@/components/MaterialCard';

export default function TeacherUploadScreen() {
  const { isUploading, uploadProgress, processingStatus, recentMaterials, pickAndUpload } = useMaterialUpload();

  const handleUpload = async () => {
    const result = await pickAndUpload();
    if (result.error) {
      Alert.alert('Upload Failed', result.error);
    }
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }} edges={['top']}>
      <StatusBar style="dark" />
      <OfflineBanner />

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        
        {/* Header Section */}
        <View style={{ marginBottom: 32, marginTop: 16 }}>
          <Text style={{ fontSize: 32, fontWeight: '800', color: '#2C3E50', letterSpacing: -0.5, marginBottom: 8 }}>
            Upload Lesson Materials
          </Text>
          <Text style={{ fontSize: 13, color: '#6A7A82' }}>
            Wrenly AI will automatically analyze and structure your content.
          </Text>
        </View>

        {/* Upload Zone */}
        <UploadZone onPress={handleUpload} disabled={isUploading} />

        {/* AI Processing Progress */}
        {isUploading && (
          <UploadProgress progress={uploadProgress} status={processingStatus} />
        )}

        {/* Recent Materials */}
        <View>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#2C3E50', marginBottom: 16 }}>Recent Materials</Text>
          {recentMaterials.length === 0 ? (
            <View style={{ backgroundColor: '#FFFFFF', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#F0F2F5', alignItems: 'center' }}>
              <Text style={{ color: '#8A9BA8', textAlign: 'center', fontSize: 13 }}>
                No materials uploaded yet.
              </Text>
            </View>
          ) : (
            recentMaterials.map((mat) => (
              <MaterialCard key={mat.id} material={mat} />
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
