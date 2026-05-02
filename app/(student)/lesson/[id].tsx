import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLessonView, LanguageMode } from '@/modules/lessons/useLessonView';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Helper to bold key terms enclosed in **
const renderBoldText = (text: string) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <Text key={index} style={{ fontWeight: '800', color: '#00665E' }}>{part.slice(2, -2)}</Text>;
    }
    return <Text key={index} style={{ color: '#2C3E50', lineHeight: 24 }}>{part}</Text>;
  });
};

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  // Handle undefined id, though it shouldn't happen via route
  const lessonId = Array.isArray(id) ? id[0] : id;
  const { 
    lesson, 
    isLoading, 
    error, 
    isOnline, 
    language, 
    toggleLanguage, 
    isPlaying, 
    togglePlay,
    playbackPosition 
  } = useLessonView(lessonId || '');

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00665E" />
      </SafeAreaView>
    );
  }

  if (error || !lesson) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
        <Text style={{ color: '#FF4757', fontWeight: '800', fontSize: 18, marginBottom: 16, textAlign: 'center' }}>
          {error || 'Lesson not found'}
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={{ backgroundColor: '#FFFFFF', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' }}>
          <Text style={{ color: '#2C3E50', fontWeight: '700' }}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const getContent = () => {
    switch(language) {
      case 'tl': return lesson.content_tl;
      case 'ceb': return lesson.content_ceb;
      case 'en': default: return lesson.content_en;
    }
  };

  const content = getContent();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }} edges={['top']}>
      <StatusBar style="dark" />
      <OfflineBanner />

      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F0F2F5', backgroundColor: '#FFFFFF' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <Feather name="arrow-left" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <View style={{ flex: 1, paddingRight: 8 }}>
          <Text style={{ color: '#2C3E50', fontWeight: '800', fontSize: 18 }} numberOfLines={1}>
            {lesson.title || 'Untitled Lesson'}
          </Text>
        </View>
        <View style={{ backgroundColor: isOnline ? '#E8F7F5' : '#FFF7E6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
          <Text style={{ fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, color: isOnline ? '#00665E' : '#F5A623' }}>
            {isOnline ? 'Cloud Mode' : 'Offline Mode'}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 160 }}>
        {/* Language Toggle Pill */}
        <View style={{ backgroundColor: '#F0F2F5', borderRadius: 100, flexDirection: 'row', padding: 4, marginBottom: 24 }}>
          {(['en', 'tl', 'ceb'] as LanguageMode[]).map((lang) => (
            <TouchableOpacity
              key={lang}
              onPress={() => toggleLanguage(lang)}
              style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 100, backgroundColor: language === lang ? '#FFFFFF' : 'transparent', shadowColor: language === lang ? '#000' : 'transparent', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: language === lang ? 1 : 0 }}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: language === lang ? '#00665E' : '#8A9BA8' }}>
                {lang === 'en' ? 'English' : lang === 'tl' ? 'Tagalog' : 'Bisaya'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Lesson Thumbnail/Image */}
        <View style={{ width: '100%', height: 192, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#F0F2F5', alignItems: 'center', justifyContent: 'center', marginBottom: 24, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 }}>
          {lesson.materials?.storage_path ? (
            <Text style={{ color: '#8A9BA8' }}>Image attached</Text>
          ) : (
            <Ionicons name="book" size={64} color="#E2E8F0" />
          )}
        </View>

        {/* AI-Simplified Lesson Content */}
        <View style={{ backgroundColor: '#FFFFFF', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#F0F2F5', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 }}>
          <Text style={{ fontSize: 16, lineHeight: 28 }}>
            {content ? renderBoldText(content) : <Text style={{ color: '#8A9BA8', fontStyle: 'italic' }}>Content not generated for this language yet.</Text>}
          </Text>
        </View>
      </ScrollView>

      {/* Audio Player Bar */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#F0F2F5', padding: 24, paddingBottom: 40, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity 
            onPress={togglePlay}
            disabled={!content}
            style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#00665E', alignItems: 'center', justifyContent: 'center', marginRight: 16, opacity: !content ? 0.5 : 1 }}
          >
            <Ionicons name={isPlaying ? "pause" : "play"} size={24} color="#FFFFFF" style={{ marginLeft: isPlaying ? 0 : 4 }} />
          </TouchableOpacity>
          
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#2C3E50', fontWeight: '800', fontSize: 14, marginBottom: 8 }}>
              Listen in {language === 'en' ? 'English' : language === 'tl' ? 'Tagalog' : 'Bisaya'}
            </Text>
            {/* Seek Bar */}
            <View style={{ height: 6, backgroundColor: '#F0F2F5', borderRadius: 3, overflow: 'hidden', width: '100%' }}>
              <View 
                style={{ height: '100%', backgroundColor: '#00665E', borderRadius: 3, width: `${playbackPosition}%` }}
              />
            </View>
          </View>
        </View>
      </View>
      
    </SafeAreaView>
  );
}
