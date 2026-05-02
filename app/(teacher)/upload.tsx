import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useMaterialUpload } from '@/modules/materials/useMaterialUpload';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { FontAwesome5, Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function TeacherUploadScreen() {
  const { isUploading, uploadProgress, processingStatus, recentMaterials, pickAndUpload } = useMaterialUpload();

  const handleUpload = async () => {
    const result = await pickAndUpload();
    if (result.error) {
      Alert.alert('Upload Failed', result.error);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FontAwesome5 name="file-pdf" size={24} color="#FF4757" />;
      case 'pptx': return <FontAwesome5 name="file-powerpoint" size={24} color="#F5A623" />;
      case 'mp4': return <FontAwesome5 name="file-video" size={24} color="#6C63FF" />;
      case 'docx': return <FontAwesome5 name="file-word" size={24} color="#00C896" />;
      default: return <FontAwesome5 name="file-alt" size={24} color="#8A9BA8" />;
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
        <TouchableOpacity
          onPress={handleUpload}
          disabled={isUploading}
          style={{ width: '100%', borderWidth: 2, borderStyle: 'dashed', borderColor: '#E2E8F0', borderRadius: 16, padding: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', marginBottom: 32, opacity: isUploading ? 0.5 : 1 }}
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

        {/* AI Processing Progress */}
        {isUploading && (
          <View style={{ backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#F0F2F5', marginBottom: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
              <Text style={{ color: '#2C3E50', fontWeight: '700', fontSize: 14, flex: 1, marginRight: 16 }}>
                {processingStatus || 'Processing...'}
              </Text>
              <Text style={{ color: '#00665E', fontWeight: '800', fontSize: 14 }}>{uploadProgress}%</Text>
            </View>
            <View style={{ width: '100%', backgroundColor: '#F0F2F5', height: 10, borderRadius: 5, overflow: 'hidden' }}>
              <View 
                style={{ height: '100%', backgroundColor: '#00665E', borderRadius: 5, width: `${uploadProgress}%` }} 
              />
            </View>
          </View>
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
              <View key={mat.id} style={{ backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F0F2F5', marginBottom: 12, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 }}>
                <View style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#FAFAFA', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                  {getFileIcon(mat.file_type)}
                </View>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={{ color: '#2C3E50', fontWeight: '700', fontSize: 15, marginBottom: 4 }} numberOfLines={1}>
                    {mat.title}
                  </Text>
                  <Text style={{ color: '#8A9BA8', fontSize: 12 }}>
                    {new Date(mat.created_at).toLocaleDateString()} • {mat.classrooms?.name || 'Unassigned'}
                  </Text>
                </View>
                <View>
                  {mat.processing_status === 'done' ? (
                    <View style={{ backgroundColor: '#E8F7F5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
                      <Text style={{ color: '#00665E', fontWeight: '800', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>READY</Text>
                    </View>
                  ) : mat.processing_status === 'processing' ? (
                    <View style={{ backgroundColor: '#FFF0ED', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
                      <Text style={{ color: '#FF4757', fontWeight: '800', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>PROCESSING</Text>
                    </View>
                  ) : (
                    <View style={{ backgroundColor: '#F0F2F5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
                      <Text style={{ color: '#8A9BA8', fontWeight: '800', fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>{mat.processing_status}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
