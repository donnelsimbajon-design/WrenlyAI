import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLessonView, LanguageMode } from '@/modules/lessons/useLessonView';
import { OfflineBanner } from '@/components/ui/OfflineBanner';

// Helper to bold key terms enclosed in **
const renderBoldText = (text: string) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <Text key={index} className="font-bold text-wrenly-primary">{part.slice(2, -2)}</Text>;
    }
    return <Text key={index}>{part}</Text>;
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
      <SafeAreaView className="flex-1 bg-wrenly-background justify-center items-center">
        <ActivityIndicator size="large" color="#00C896" />
      </SafeAreaView>
    );
  }

  if (error || !lesson) {
    return (
      <SafeAreaView className="flex-1 bg-wrenly-background justify-center items-center px-6">
        <Text className="text-wrenly-danger font-bold text-xl mb-4 text-center">
          {error || 'Lesson not found'}
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="bg-wrenly-surface px-6 py-3 rounded-xl border border-wrenly-border">
          <Text className="text-wrenly-text">Go Back</Text>
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
    <SafeAreaView className="flex-1 bg-wrenly-background" edges={['top']}>
      <StatusBar style="light" />
      <OfflineBanner />

      {/* Header */}
      <View className="px-6 py-4 flex-row items-center border-b border-wrenly-border bg-wrenly-surface">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Text className="text-wrenly-text text-xl font-bold">←</Text>
        </TouchableOpacity>
        <View className="flex-1 pr-2">
          <Text className="text-wrenly-text font-bold font-poppins text-lg" numberOfLines={1}>
            {lesson.title || 'Untitled Lesson'}
          </Text>
        </View>
        <View className={`px-2 py-1 rounded ${isOnline ? 'bg-wrenly-primary/20' : 'bg-wrenly-warning/20'}`}>
          <Text className={`text-[10px] font-bold uppercase ${isOnline ? 'text-wrenly-primary' : 'text-wrenly-warning'}`}>
            {isOnline ? 'Cloud Mode' : 'Offline Mode'}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerClassName="p-6 pb-40">
        {/* Language Toggle Pill */}
        <View className="bg-wrenly-surface rounded-full flex-row p-1 mb-6 border border-wrenly-border">
          {(['en', 'tl', 'ceb'] as LanguageMode[]).map((lang) => (
            <TouchableOpacity
              key={lang}
              onPress={() => toggleLanguage(lang)}
              className={`flex-1 py-2 items-center rounded-full ${language === lang ? 'bg-wrenly-primary shadow-sm' : 'bg-transparent'}`}
            >
              <Text className={`text-sm font-bold ${language === lang ? 'text-wrenly-text' : 'text-wrenly-textSecondary'}`}>
                {lang === 'en' ? 'English' : lang === 'tl' ? 'Tagalog' : 'Bisaya'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Lesson Thumbnail/Image */}
        <View className="w-full h-48 bg-wrenly-surface rounded-2xl border border-wrenly-border items-center justify-center mb-6 overflow-hidden">
          {lesson.materials?.storage_path ? (
            <Text className="text-wrenly-textSecondary">Image attached</Text>
          ) : (
            <Text className="text-5xl">📖</Text>
          )}
        </View>

        {/* AI-Simplified Lesson Content */}
        <View className="bg-wrenly-surface p-6 rounded-2xl border border-wrenly-border">
          <Text className="text-wrenly-text text-base leading-relaxed font-inter">
            {content ? renderBoldText(content) : <Text className="text-wrenly-textSecondary italic">Content not generated for this language yet.</Text>}
          </Text>
        </View>
      </ScrollView>

      {/* Audio Player Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-wrenly-surface border-t border-wrenly-border p-6 shadow-lg">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={togglePlay}
            disabled={!content}
            className={`w-14 h-14 rounded-full bg-wrenly-primary items-center justify-center mr-4 ${!content ? 'opacity-50' : ''}`}
          >
            <Text className="text-wrenly-text font-bold text-xl ml-1">{isPlaying ? '⏸' : '▶'}</Text>
          </TouchableOpacity>
          
          <View className="flex-1">
            <Text className="text-wrenly-text font-semibold text-sm mb-2 font-poppins">
              Listen in {language === 'en' ? 'English' : language === 'tl' ? 'Tagalog' : 'Bisaya'}
            </Text>
            {/* Seek Bar */}
            <View className="h-2 bg-wrenly-background rounded-full overflow-hidden w-full">
              <View 
                className="h-full bg-wrenly-primary rounded-full transition-all duration-300"
                style={{ width: `${playbackPosition}%` }}
              />
            </View>
          </View>
        </View>
      </View>
      
    </SafeAreaView>
  );
}
