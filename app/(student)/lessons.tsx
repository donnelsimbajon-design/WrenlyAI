import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

// Mock data for presentation
const MOCK_LESSONS = [
  { id: '1', title: 'Fractions & Decimals', subject: 'Advanced Mathematics', progress: 100, isCompleted: true, duration: '45 mins' },
  { id: '2', title: 'The Water Cycle', subject: 'Biology 101', progress: 65, isCompleted: false, duration: '30 mins' },
  { id: '3', title: 'Introduction to Poetry', subject: 'Literature', progress: 15, isCompleted: false, duration: '60 mins' },
  { id: '4', title: 'Mitosis vs Meiosis', subject: 'Biology 101', progress: 0, isCompleted: false, duration: '40 mins' },
  { id: '5', title: 'Algebraic Expressions', subject: 'Advanced Mathematics', progress: 100, isCompleted: true, duration: '50 mins' },
];

const SUBJECTS = ['All Subjects', ...Array.from(new Set(MOCK_LESSONS.map(l => l.subject)))];

const getSubjectStyles = (subject: string) => {
  if (subject.includes('Math')) return { bg: '#E8F2FF', color: '#0066FF', icon: 'hash' as any };
  if (subject.includes('Biology')) return { bg: '#E8F7F5', color: '#00A67E', icon: 'activity' as any };
  if (subject.includes('Literature')) return { bg: '#FFF0F5', color: '#E01A59', icon: 'book' as any };
  return { bg: '#F4F6F9', color: '#566B80', icon: 'file-text' as any };
};

const LessonCard = React.memo(({ lesson }: { lesson: any }) => {
  const styles = getSubjectStyles(lesson.subject);
  
  return (
    <TouchableOpacity 
      onPress={() => router.push(`/lesson/${lesson.id}`)}
      style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F0F2F5', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2, flexDirection: 'row', alignItems: 'center' }}
    >
      {/* Thumbnail */}
      <View style={{ width: 56, height: 56, borderRadius: 14, backgroundColor: styles.bg, alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
        <Feather name={styles.icon} size={24} color={styles.color} />
      </View>

      {/* Info */}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 11, fontWeight: '800', color: styles.color, letterSpacing: 0.5, marginBottom: 4, textTransform: 'uppercase' }}>{lesson.subject}</Text>
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#2C3E50', marginBottom: 8 }} numberOfLines={1}>{lesson.title}</Text>
        
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1, height: 4, backgroundColor: '#F0F2F5', borderRadius: 2, overflow: 'hidden', marginRight: 12 }}>
            <View style={{ width: `${lesson.progress}%`, height: '100%', backgroundColor: lesson.isCompleted ? '#00A67E' : '#F5A623', borderRadius: 2 }} />
          </View>
          <Text style={{ fontSize: 11, fontWeight: '800', color: lesson.isCompleted ? '#00A67E' : '#F5A623' }}>{lesson.progress}%</Text>
        </View>
      </View>
      
      <View style={{ paddingLeft: 12 }}>
        {lesson.isCompleted ? (
          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#E8F7F5', alignItems: 'center', justifyContent: 'center' }}>
            <Feather name="check" size={16} color="#00A67E" />
          </View>
        ) : (
          <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#FAFAFA', borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center', justifyContent: 'center' }}>
            <Feather name="play" size={16} color="#566B80" style={{ marginLeft: 2 }} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

export default function LessonsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'In Progress' | 'Completed'>('All');
  const [activeSubject, setActiveSubject] = useState('All Subjects');

  const filteredLessons = useMemo(() => {
    return MOCK_LESSONS.filter(lesson => {
      const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            lesson.subject.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTab = 
        activeTab === 'All' ? true :
        activeTab === 'Completed' ? lesson.isCompleted :
        !lesson.isCompleted;

      const matchesSubject = activeSubject === 'All Subjects' ? true : lesson.subject === activeSubject;

      return matchesSearch && matchesTab && matchesSubject;
    });
  }, [searchQuery, activeTab, activeSubject]);

  const clearFilters = () => {
    setSearchQuery('');
    setActiveTab('All');
    setActiveSubject('All Subjects');
  };

  const renderEmptyState = () => (
    <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 40 }}>
      <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#E8F7F5', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
        <Feather name="book-open" size={24} color="#00A67E" />
      </View>
      <Text style={{ fontSize: 18, fontWeight: '800', color: '#2C3E50', marginBottom: 8 }}>No lessons found</Text>
      <Text style={{ fontSize: 14, color: '#8A9BA8', textAlign: 'center', marginBottom: 24 }}>
        Try adjusting your search or filters to find what you're looking for.
      </Text>
      {(searchQuery !== '' || activeTab !== 'All' || activeSubject !== 'All Subjects') && (
        <TouchableOpacity 
          onPress={clearFilters}
          style={{ backgroundColor: '#00A67E', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 100 }}
        >
          <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15 }}>Clear Filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header Area */}
      <View style={{ backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0F2F5', zIndex: 10, paddingBottom: 16 }}>
        <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 16 }}>
          <Text style={{ color: '#00665E', fontWeight: '800', fontSize: 24, marginBottom: 16 }}>
            My Lessons
          </Text>
          
          {/* Search Bar */}
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F6F9', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 }}>
            <Feather name="search" size={18} color="#A0AEBA" style={{ marginRight: 12 }} />
            <TextInput 
              placeholder="Search lessons..."
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

        {/* Subject Pills */}
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingRight: 40 }}>
            {SUBJECTS.map((subject) => (
              <TouchableOpacity
                key={subject}
                onPress={() => setActiveSubject(subject)}
                style={{ 
                  paddingHorizontal: 16, 
                  paddingVertical: 8, 
                  borderRadius: 100, 
                  marginRight: 8,
                  backgroundColor: activeSubject === subject ? '#00665E' : '#FFFFFF',
                  borderWidth: 1,
                  borderColor: activeSubject === subject ? '#00665E' : '#E2E8F0'
                }}
              >
                <Text style={{ 
                  fontWeight: '700', 
                  fontSize: 13, 
                  color: activeSubject === subject ? '#FFFFFF' : '#566B80' 
                }}>
                  {subject}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={{ backgroundColor: '#FAFAFA', paddingHorizontal: 24, paddingBottom: 16, paddingTop: 16 }}>
        <View style={{ flexDirection: 'row', backgroundColor: '#E2E8F0', borderRadius: 100, padding: 4 }}>
          {['All', 'In Progress', 'Completed'].map((tab) => (
            <TouchableOpacity 
              key={tab}
              onPress={() => setActiveTab(tab as any)}
              style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 100, backgroundColor: activeTab === tab ? '#FFFFFF' : 'transparent', shadowColor: activeTab === tab ? '#000' : 'transparent', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: activeTab === tab ? 2 : 0 }}
            >
              <Text style={{ fontWeight: '700', fontSize: 13, color: activeTab === tab ? '#00665E' : '#566B80' }}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredLessons}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <LessonCard lesson={item} />}
        contentContainerStyle={{ padding: 24, paddingTop: 0, paddingBottom: 100 }}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
