import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LessonRepository } from '@/modules/lessons/lesson.repository';
import { useAuth } from '@/modules/security/useAuth';

const getSubjectStyles = (subject: string) => {
  if (!subject) return { bg: '#F4F6F9', color: '#566B80', icon: 'file-text' as any };
  if (subject.includes('Math')) return { bg: '#E8F2FF', color: '#0066FF', icon: 'hash' as any };
  if (subject.includes('Biology') || subject.includes('Science')) return { bg: '#E8F7F5', color: '#00A67E', icon: 'activity' as any };
  if (subject.includes('Literature') || subject.includes('English')) return { bg: '#FFF0F5', color: '#E01A59', icon: 'book' as any };
  return { bg: '#F4F6F9', color: '#566B80', icon: 'file-text' as any };
};

const LessonCard = React.memo(({ lesson }: { lesson: any }) => {
  const styles = getSubjectStyles(lesson.subject);
  
  return (
    <TouchableOpacity 
      onPress={() => router.push(`/lesson/${lesson.id}`)}
      style={{ backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F0F2F5', flexDirection: 'row', alignItems: 'center' }}
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
  const { user } = useAuth();
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'In Progress' | 'Completed'>('All');
  const [activeSubject, setActiveSubject] = useState('All Subjects');

  useEffect(() => {
    async function fetchLessons() {
      // Return early if the user hasn't logged in yet
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        // Uses the real student ID to find their enrolled classes and lessons
        const data = await LessonRepository.getLessonsForStudent(user.id);
        
        // Map the data to flatten the subject and add mock progress 
        // (since we don't have a progress table yet)
        const formattedLessons = data.map((item: any) => ({
          ...item,
          subject: item.classrooms?.subject || 'Unknown Subject',
          progress: 0, // Default to 0 until we have a progress tracking table
          isCompleted: false,
        }));
        
        setLessons(formattedLessons);
      } catch (error) {
        console.error('Error fetching lessons:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchLessons();
  }, [user]);

  const subjects = useMemo(() => {
    return ['All Subjects', ...Array.from(new Set(lessons.map(l => l.subject)))];
  }, [lessons]);

  const filteredLessons = useMemo(() => {
    return lessons.filter(lesson => {
      const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            lesson.subject.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTab = 
        activeTab === 'All' ? true :
        activeTab === 'Completed' ? lesson.isCompleted :
        !lesson.isCompleted;

      const matchesSubject = activeSubject === 'All Subjects' ? true : lesson.subject === activeSubject;

      return matchesSearch && matchesTab && matchesSubject;
    });
  }, [lessons, searchQuery, activeTab, activeSubject]);

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
        {lessons.length === 0 
          ? "You don't have any lessons yet. Enroll in a class to see them here!" 
          : "Try adjusting your search or filters to find what you're looking for."}
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
            {subjects.map((subject) => (
              <TouchableOpacity
                key={subject}
                onPress={() => setActiveSubject(subject as string)}
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
                  {subject as string}
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
              style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 100, backgroundColor: activeTab === tab ? '#FFFFFF' : 'transparent', shadowColor: activeTab === tab ? '#000' : 'transparent', elevation: activeTab === tab ? 2 : 0 }}
            >
              <Text style={{ fontWeight: '700', fontSize: 13, color: activeTab === tab ? '#00665E' : '#566B80' }}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#00665E" />
        </View>
      ) : (
        <FlatList
          data={filteredLessons}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <LessonCard lesson={item} />}
          contentContainerStyle={{ padding: 24, paddingTop: 0, paddingBottom: 100 }}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
