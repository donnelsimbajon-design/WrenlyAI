import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAISettings } from '@/modules/teacher/useAISettings';
import { useAuth } from '@/modules/security/useAuth';
import { router } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function AISettingsScreen() {
  const { user } = useAuth();
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
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#00665E" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F0F2F5', backgroundColor: '#FFFFFF' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
          <Feather name="arrow-left" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#2C3E50', fontWeight: '800', fontSize: 18 }} numberOfLines={1}>
            Wrenly AI Co-Pilot
          </Text>
        </View>
        <View style={{ backgroundColor: '#FFF0ED', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
          <Text style={{ fontSize: 10, fontWeight: '800', color: '#FF4757', textTransform: 'uppercase', letterSpacing: 0.5 }}>Settings</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        
        {/* Target Simplification Level */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#2C3E50', marginBottom: 4 }}>
            Target Simplification Level
          </Text>
          <Text style={{ fontSize: 13, color: '#6A7A82', marginBottom: 16 }}>
            Adjust how Wrenly simplifies uploaded materials for your students.
          </Text>

          <View style={{ flexDirection: 'row', backgroundColor: '#F0F2F5', borderRadius: 100, padding: 4, marginBottom: 12 }}>
            {[4, 7, 10].map((level) => (
              <TouchableOpacity
                key={level}
                onPress={() => updateSetting('target_grade_level', level)}
                style={{ flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 100, backgroundColor: settings.target_grade_level === level ? '#FFFFFF' : 'transparent', shadowColor: settings.target_grade_level === level ? '#000' : 'transparent', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: settings.target_grade_level === level ? 1 : 0 }}
              >
                <Text style={{ fontWeight: '700', fontSize: 14, color: settings.target_grade_level === level ? '#00665E' : '#8A9BA8' }}>
                  Grade {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={{ fontSize: 13, color: '#8A9BA8', fontStyle: 'italic', paddingHorizontal: 8 }}>
            • {getLevelDescription(settings.target_grade_level)}
          </Text>
        </View>

        {/* Quizzes */}
        <View style={{ backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#F0F2F5', marginBottom: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 }}>
          <View style={{ flex: 1, paddingRight: 16 }}>
            <Text style={{ color: '#2C3E50', fontWeight: '800', fontSize: 16, marginBottom: 4 }}>
              Auto-generate Quizzes
            </Text>
            <Text style={{ color: '#6A7A82', fontSize: 12 }}>
              Automatically create a 5-question quiz for every new lesson.
            </Text>
          </View>
          <Switch
            value={settings.auto_generate_quiz}
            onValueChange={(val) => updateSetting('auto_generate_quiz', val)}
            trackColor={{ false: '#E2E8F0', true: '#00665E' }}
            thumbColor={'#FFFFFF'}
          />
        </View>

        {/* Language Translation Support */}
        <View style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: '#2C3E50', marginBottom: 16 }}>
            Language Translation Support
          </Text>
          
          <View style={{ backgroundColor: '#FFFFFF', padding: 20, borderTopLeftRadius: 16, borderTopRightRadius: 16, borderWidth: 1, borderColor: '#F0F2F5', borderBottomWidth: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text style={{ color: '#2C3E50', fontWeight: '700', fontSize: 15 }}>Enable Tagalog Translation</Text>
            </View>
            <Switch
              value={settings.enable_tl}
              onValueChange={(val) => updateSetting('enable_tl', val)}
              trackColor={{ false: '#E2E8F0', true: '#00665E' }}
              thumbColor={'#FFFFFF'}
            />
          </View>
          
          <View style={{ backgroundColor: '#FFFFFF', padding: 20, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, borderWidth: 1, borderColor: '#F0F2F5', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 }}>
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text style={{ color: '#2C3E50', fontWeight: '700', fontSize: 15 }}>Enable Bisaya Dialect</Text>
            </View>
            <Switch
              value={settings.enable_ceb}
              onValueChange={(val) => updateSetting('enable_ceb', val)}
              trackColor={{ false: '#E2E8F0', true: '#00665E' }}
              thumbColor={'#FFFFFF'}
            />
          </View>
        </View>

        {/* AI Model Card */}
        <View style={{ backgroundColor: '#E8F7F5', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#00665E', marginBottom: 24, flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 48, height: 48, backgroundColor: '#00665E', borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
            <MaterialCommunityIcons name="robot-outline" size={24} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#00665E', fontWeight: '800', fontSize: 16, marginBottom: 4 }}>
              AI Learning Model v4.2
            </Text>
            <Text style={{ color: '#00665E', fontSize: 12, opacity: 0.8 }}>
              Optimized for regional education standards.
            </Text>
          </View>
        </View>

        {/* Timestamps */}
        <View style={{ marginBottom: 40, alignItems: 'center' }}>
          <Text style={{ color: '#8A9BA8', fontSize: 12 }}>
            {lastUpdated 
              ? `Last updated: ${new Date(lastUpdated).toLocaleString()}` 
              : 'Unsaved changes'}
          </Text>
          <Text style={{ color: '#8A9BA8', fontSize: 12, marginTop: 4 }}>
            Editor: {user?.full_name || 'Teacher'}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 }}>
          <TouchableOpacity 
            onPress={discardChanges}
            disabled={isSaving}
            style={{ flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginRight: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 }}
          >
            <Text style={{ color: '#566B80', fontWeight: '800', fontSize: 16 }}>Discard</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={saveSettings}
            disabled={isSaving}
            style={{ flex: 1, backgroundColor: '#00665E', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginLeft: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3, opacity: isSaving ? 0.7 : 1 }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 16 }}>
              {isSaving ? 'Saving...' : 'Save AI'}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
