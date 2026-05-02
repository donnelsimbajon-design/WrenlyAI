import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Mock data for presentation
const MOCK_LESSONS = [
  { id: '1', title: 'Fractions & Decimals', subject: 'Advanced Mathematics', progress: 100, isCompleted: true, duration: '45 mins', thumbnail: 'F' },
  { id: '2', title: 'The Water Cycle', subject: 'Biology 101', progress: 65, isCompleted: false, duration: '30 mins', thumbnail: 'W' },
  { id: '3', title: 'Introduction to Poetry', subject: 'Literature', progress: 15, isCompleted: false, duration: '60 mins', thumbnail: 'P' },
  { id: '4', title: 'Mitosis vs Meiosis', subject: 'Biology 101', progress: 0, isCompleted: false, duration: '40 mins', thumbnail: 'M' },
  { id: '5', title: 'Algebraic Expressions', subject: 'Advanced Mathematics', progress: 100, isCompleted: true, duration: '50 mins', thumbnail: 'A' },
];

export default function LessonsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'In Progress' | 'Completed'>('All');

  const filteredLessons = useMemo(() => {
    return MOCK_LESSONS.filter(lesson => {
      const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            lesson.subject.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTab = 
        activeTab === 'All' ? true :
        activeTab === 'Completed' ? lesson.isCompleted :
        !lesson.isCompleted;

      return matchesSearch && matchesTab;
    });
  }, [searchQuery, activeTab]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingVertical: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F2F5', zIndex: 10 }}>
        <Text style={{ color: '#00665E', fontWeight: '800', fontSize: 24, marginBottom: 16 }}>
          My Lessons
        </Text>
        
        {/* Search Bar */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F6F9', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 }}>
          <Feather name="search" size={18} color="#A0AEBA" style={{ marginRight: 12 }} />
          <TextInput 
            placeholder="Search lessons or subjects..."
            placeholderTextColor="#A0AEBA"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1, fontSize: 15, color: '#2C3E50', fontWeight: '600' }}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Feather name="x-circle" size={18} color="#A0AEBA" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={{ backgroundColor: '#FFFFFF', paddingHorizontal: 24, paddingBottom: 16, paddingTop: 16 }}>
        <View style={{ flexDirection: 'row', backgroundColor: '#F0F2F5', borderRadius: 100, padding: 4 }}>
          {['All', 'In Progress', 'Completed'].map((tab) => (
            <TouchableOpacity 
              key={tab}
              onPress={() => setActiveTab(tab as any)}
              style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 100, backgroundColor: activeTab === tab ? '#00665E' : 'transparent', shadowColor: activeTab === tab ? '#000' : 'transparent', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: activeTab === tab ? 2 : 0 }}
            >
              <Text style={{ fontWeight: '700', fontSize: 13, color: activeTab === tab ? '#FFFFFF' : '#8A9BA8' }}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        {filteredLessons.length === 0 ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 40 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#E8F7F5', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Feather name="book-open" size={24} color="#00665E" />
            </View>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#2C3E50', marginBottom: 8 }}>No lessons found</Text>
            <Text style={{ fontSize: 14, color: '#8A9BA8', textAlign: 'center' }}>
              Try adjusting your search or filters to find what you're looking for.
            </Text>
          </View>
        ) : (
          filteredLessons.map(lesson => (
            <TouchableOpacity 
              key={lesson.id}
              onPress={() => router.push(`/lesson/${lesson.id}`)}
              style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F0F2F5', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1, flexDirection: 'row', alignItems: 'center' }}
            >
              {/* Thumbnail */}
              <View style={{ width: 56, height: 56, borderRadius: 12, backgroundColor: lesson.isCompleted ? '#E8F7F5' : '#FFF7E6', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                <Text style={{ fontSize: 24, fontWeight: '800', color: lesson.isCompleted ? '#00665E' : '#F5A623' }}>{lesson.thumbnail}</Text>
              </View>

              {/* Info */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: '#8A9BA8', letterSpacing: 0.5, marginBottom: 4, textTransform: 'uppercase' }}>{lesson.subject}</Text>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#2C3E50', marginBottom: 8 }} numberOfLines={1}>{lesson.title}</Text>
                
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flex: 1, height: 4, backgroundColor: '#F0F2F5', borderRadius: 2, overflow: 'hidden', marginRight: 12 }}>
                    <View style={{ width: `${lesson.progress}%`, height: '100%', backgroundColor: lesson.isCompleted ? '#00665E' : '#F5A623', borderRadius: 2 }} />
                  </View>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: lesson.isCompleted ? '#00665E' : '#F5A623' }}>{lesson.progress}%</Text>
                </View>
              </View>
              
              <View style={{ paddingLeft: 12 }}>
                {lesson.isCompleted ? (
                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#E8F7F5', alignItems: 'center', justifyContent: 'center' }}>
                    <Feather name="check" size={14} color="#00665E" />
                  </View>
                ) : (
                  <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' }}>
                    <Feather name="play" size={14} color="#566B80" style={{ marginLeft: 2 }} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
