import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { theme } from '@/config/theme';
import { useMaterials } from '@/modules/materials/useMaterials';

export default function MaterialDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { currentMaterial, isLoading, fetchMaterial } = useMaterials();

  useEffect(() => {
    if (id) {
      fetchMaterial(id);
    }
  }, [id]);

  if (isLoading || !currentMaterial) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFAFA' }}>
        <ActivityIndicator color={theme.colors.wrenly.primary} size="large" />
      </View>
    );
  }

  const mat = currentMaterial;

  const handleGenerateAI = () => {
    // For now, this is a placeholder. It would trigger AI extraction or generation
    console.log('Generate lesson triggered for', mat.id);
  };

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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }} edges={['top']}>
      <StatusBar style="dark" />

      {/* ── Header ─────────────────────────────────────────────────── */}
      <View style={{
        backgroundColor: '#FFFFFF', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16,
        borderBottomWidth: 1, borderBottomColor: '#F0F2F5', flexDirection: 'row', alignItems: 'center'
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}
        >
          <Feather name="arrow-left" size={18} color="#374151" />
        </TouchableOpacity>
        <Text style={{ fontSize: 17, fontWeight: '800', color: '#1F2937', flex: 1 }} numberOfLines={1}>
          Material Detail
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        {/* Top Info */}
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <View style={{ width: 72, height: 72, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            {getFileIcon(mat.file_type)}
          </View>
          <Text style={{ fontSize: 20, fontWeight: '800', color: '#2C3E50', textAlign: 'center', marginBottom: 8 }}>
            {mat.title}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 13, color: '#8A9BA8', marginRight: 8 }}>
              {new Date(mat.created_at).toLocaleDateString()}
            </Text>
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

        {/* Generate AI Button */}
        <TouchableOpacity
          onPress={handleGenerateAI}
          style={{
            backgroundColor: theme.colors.wrenly.primary,
            borderRadius: 16,
            padding: 20,
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            marginBottom: 24,
            shadowColor: theme.colors.wrenly.primary,
            }}
        >
          <Feather name="zap" size={24} color="#FFFFFF" style={{ marginRight: 12 }} />
          <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 18 }}>Generate Lesson with AI</Text>
        </TouchableOpacity>

        {/* Extracted Text Preview (Mock) */}
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#F0F2F5' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Feather name="file-text" size={16} color="#8A9BA8" style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#2C3E50' }}>Extracted Content Preview</Text>
          </View>
          <Text style={{ fontSize: 14, color: '#6A7A82', lineHeight: 22 }} numberOfLines={8}>
            {/* Real implementation would pull this from extracted text stored in the DB */}
            This is a preview of the extracted text from the document. The Wrenly AI extraction engine parses the file contents and prepares it for lesson generation. It identifies key concepts, terms, and sections. Once you tap "Generate Lesson with AI", this text will be processed into structured educational content including summaries, quizzes, and multilingual translations.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
