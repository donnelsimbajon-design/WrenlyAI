import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAISettings } from '@/modules/teacher/useAISettings';
import { useAuthStore } from '@/store/authStore';
import { router } from 'expo-router';

export default function AISettingsScreen() {
  const { user } = useAuthStore();
  const { 
    settings, 
    updateSetting, 
    isLoading, 
    isSaving, 
    lastUpdated, 
    saveSettings, 
    discardChanges 
  } = useAISettings();

  const getLevelDescription = (level: number) => {
    if (level === 4) return 'Uses very simple words, short sentences, and everyday concrete examples.';
    if (level === 7) return 'Uses moderate language with relatable examples and brief explanations.';
    return 'Introduces formal technical terms with clear, concise definitions.';
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-wrenly-background justify-center items-center">
        <ActivityIndicator size="large" color="#00C896" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-wrenly-background" edges={['top']}>
      <StatusBar style="light" />

      {/* Header */}
      <View className="px-6 py-4 flex-row items-center border-b border-wrenly-border bg-wrenly-surface">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Text className="text-wrenly-text text-xl font-bold">←</Text>
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-wrenly-text font-bold font-poppins text-lg" numberOfLines={1}>
            Wrenly AI Co-Pilot Settings
          </Text>
        </View>
        <View className="bg-wrenly-danger/20 px-2 py-1 rounded">
          <Text className="text-[10px] font-bold text-wrenly-danger uppercase tracking-wider">Admin Dashboard</Text>
        </View>
      </View>

      <ScrollView contentContainerClassName="p-6 pb-32">
        
        {/* Target Simplification Level */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-wrenly-text font-poppins mb-1">
            Target Simplification Level
          </Text>
          <Text className="text-sm text-wrenly-textSecondary mb-4">
            Adjust how Wrenly simplifies uploaded materials for your students.
          </Text>

          <View className="flex-row bg-wrenly-surface rounded-full p-1 border border-wrenly-border mb-3 shadow-sm">
            {[4, 7, 10].map((level) => (
              <TouchableOpacity
                key={level}
                onPress={() => updateSetting('target_grade_level', level)}
                className={`flex-1 py-3 items-center rounded-full ${settings.target_grade_level === level ? 'bg-wrenly-primary shadow-sm' : 'bg-transparent'}`}
              >
                <Text className={`font-bold text-sm ${settings.target_grade_level === level ? 'text-wrenly-text' : 'text-wrenly-textSecondary'}`}>
                  Grade {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text className="text-sm text-wrenly-textSecondary italic ml-2">
            • {getLevelDescription(settings.target_grade_level)}
          </Text>
        </View>

        {/* Quizzes */}
        <View className="bg-wrenly-surface p-4 rounded-2xl border border-wrenly-border mb-6 flex-row items-center justify-between shadow-sm">
          <View className="flex-1 pr-4">
            <Text className="text-wrenly-text font-semibold text-base mb-1 font-poppins">
              Auto-generate Quizzes
            </Text>
            <Text className="text-wrenly-textSecondary text-xs">
              Automatically create a 5-question quiz for every new lesson.
            </Text>
          </View>
          <Switch
            value={settings.auto_generate_quiz}
            onValueChange={(val) => updateSetting('auto_generate_quiz', val)}
            trackColor={{ false: '#333344', true: '#00C896' }}
            thumbColor={'#FFFFFF'}
          />
        </View>

        {/* Language Translation Support */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-wrenly-text font-poppins mb-4">
            Language Translation Support
          </Text>
          
          <View className="bg-wrenly-surface p-4 rounded-t-2xl border border-wrenly-border border-b-0 flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-wrenly-text font-semibold text-sm mb-1 font-poppins">Enable Tagalog Translation</Text>
            </View>
            <Switch
              value={settings.enable_tl}
              onValueChange={(val) => updateSetting('enable_tl', val)}
              trackColor={{ false: '#333344', true: '#00C896' }}
              thumbColor={'#FFFFFF'}
            />
          </View>
          
          <View className="bg-wrenly-surface p-4 rounded-b-2xl border border-wrenly-border flex-row items-center justify-between shadow-sm">
            <View className="flex-1 pr-4">
              <Text className="text-wrenly-text font-semibold text-sm mb-1 font-poppins">Enable Bisaya Dialect</Text>
            </View>
            <Switch
              value={settings.enable_ceb}
              onValueChange={(val) => updateSetting('enable_ceb', val)}
              trackColor={{ false: '#333344', true: '#00C896' }}
              thumbColor={'#FFFFFF'}
            />
          </View>
        </View>

        {/* AI Model Card */}
        <View className="bg-wrenly-primary/10 p-5 rounded-2xl border border-wrenly-primary mb-6 flex-row items-center shadow-sm">
          <View className="w-12 h-12 bg-wrenly-primary rounded-full items-center justify-center mr-4">
            <Text className="text-wrenly-background font-bold text-xl">🤖</Text>
          </View>
          <View className="flex-1">
            <Text className="text-wrenly-primary font-bold text-base mb-1 font-poppins">
              AI Learning Model v4.2
            </Text>
            <Text className="text-wrenly-primary text-xs opacity-90">
              Optimized for regional education standards.
            </Text>
          </View>
        </View>

        {/* Timestamps */}
        <View className="mb-10 items-center">
          <Text className="text-wrenly-textSecondary text-xs">
            {lastUpdated 
              ? `Last updated: ${new Date(lastUpdated).toLocaleString()}` 
              : 'Unsaved changes'}
          </Text>
          <Text className="text-wrenly-textSecondary text-xs mt-1">
            Editor: {user?.full_name || 'Teacher'}
          </Text>
        </View>

        {/* Action Buttons */}
        <View className="flex-row justify-between mb-8">
          <TouchableOpacity 
            onPress={discardChanges}
            disabled={isSaving}
            className="flex-1 bg-wrenly-surface border border-wrenly-border py-4 rounded-xl items-center mr-2 shadow-sm"
          >
            <Text className="text-wrenly-text font-bold text-base">Discard</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={saveSettings}
            disabled={isSaving}
            className={`flex-1 bg-wrenly-primary py-4 rounded-xl items-center ml-2 shadow-sm ${isSaving ? 'opacity-70' : ''}`}
          >
            <Text className="text-wrenly-text font-bold text-base">
              {isSaving ? 'Saving...' : 'Save AI'}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
