import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useMaterialUpload } from '@/modules/materials/useMaterialUpload';
import { OfflineBanner } from '@/components/ui/OfflineBanner';

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
      case 'pdf': return '📄';
      case 'pptx': return '📊';
      case 'mp4': return '🎬';
      case 'docx': return '📝';
      default: return '📁';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-wrenly-background" edges={['top']}>
      <StatusBar style="light" />
      <OfflineBanner />

      <ScrollView contentContainerClassName="p-6 pb-20">
        
        {/* Header Section */}
        <View className="mb-8 mt-4">
          <Text className="text-3xl font-bold text-wrenly-text tracking-tight font-poppins mb-2">
            Upload Lesson Materials
          </Text>
          <Text className="text-sm text-wrenly-textSecondary">
            Wrenly AI will automatically analyze and structure your content.
          </Text>
        </View>

        {/* Upload Zone */}
        <TouchableOpacity
          onPress={handleUpload}
          disabled={isUploading}
          className={`w-full border-2 border-dashed border-wrenly-border rounded-2xl p-8 items-center justify-center bg-wrenly-surface mb-8 ${isUploading ? 'opacity-50' : ''}`}
        >
          <View className="w-16 h-16 rounded-full bg-wrenly-background items-center justify-center mb-4">
            <Text className="text-wrenly-accent text-3xl">☁️</Text>
          </View>
          <Text className="text-wrenly-text font-bold text-lg mb-1 font-poppins">Tap to select files</Text>
          <Text className="text-wrenly-textSecondary text-sm mb-5 text-center">
            Supported: PDF, PPT, MP4, DOCX (max 150MB)
          </Text>
          <View className="bg-wrenly-accent px-6 py-2.5 rounded-xl shadow-sm">
            <Text className="text-wrenly-text font-bold">Browse Files</Text>
          </View>
        </TouchableOpacity>

        {/* AI Processing Progress */}
        {isUploading && (
          <View className="bg-wrenly-surface p-5 rounded-2xl border border-wrenly-border mb-8 shadow-sm">
            <View className="flex-row justify-between items-end mb-3">
              <Text className="text-wrenly-text font-semibold text-sm flex-1 mr-4">
                {processingStatus || 'Processing...'}
              </Text>
              <Text className="text-wrenly-accent font-bold text-sm">{uploadProgress}%</Text>
            </View>
            <View className="w-full bg-wrenly-background h-2.5 rounded-full overflow-hidden">
              <View 
                className="h-full bg-wrenly-accent rounded-full" 
                style={{ width: `${uploadProgress}%` }} 
              />
            </View>
          </View>
        )}

        {/* Recent Materials */}
        <View>
          <Text className="text-xl font-bold text-wrenly-text mb-4 font-poppins">Recent Materials</Text>
          {recentMaterials.length === 0 ? (
            <View className="bg-wrenly-surface p-6 rounded-2xl border border-wrenly-border items-center">
              <Text className="text-wrenly-textSecondary text-center">
                No materials uploaded yet.
              </Text>
            </View>
          ) : (
            recentMaterials.map((mat) => (
              <View key={mat.id} className="bg-wrenly-surface p-4 rounded-2xl border border-wrenly-border mb-3 flex-row items-center shadow-sm">
                <View className="w-12 h-12 rounded-xl bg-wrenly-background items-center justify-center mr-4">
                  <Text className="text-2xl">{getFileIcon(mat.file_type)}</Text>
                </View>
                <View className="flex-1 pr-2">
                  <Text className="text-wrenly-text font-semibold text-base mb-1" numberOfLines={1}>
                    {mat.title}
                  </Text>
                  <Text className="text-wrenly-textSecondary text-xs">
                    {new Date(mat.created_at).toLocaleDateString()} • {mat.classrooms?.name || 'Unassigned'}
                  </Text>
                </View>
                <View>
                  {mat.processing_status === 'done' ? (
                    <Text className="text-wrenly-primary font-bold text-[10px] uppercase tracking-wider bg-wrenly-primary/10 px-2 py-1 rounded">READY</Text>
                  ) : mat.processing_status === 'processing' ? (
                    <Text className="text-wrenly-warning font-bold text-[10px] uppercase tracking-wider bg-wrenly-warning/10 px-2 py-1 rounded">PROCESSING</Text>
                  ) : (
                    <Text className="text-wrenly-danger font-bold text-[10px] uppercase tracking-wider bg-wrenly-danger/10 px-2 py-1 rounded">{mat.processing_status}</Text>
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
