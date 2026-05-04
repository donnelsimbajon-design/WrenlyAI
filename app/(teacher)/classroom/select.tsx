import { theme } from '@/config/theme';
import { useToast } from '@/hooks/useToast';
import { useClassroom } from '@/modules/classroom/useClassroom';
import { useAuth } from '@/modules/security/useAuth';
import { supabase } from '@/services/supabase';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SelectClassroomScreen() {
  const { user } = useAuth();
  const toast = useToast();
  const { materialId } = useLocalSearchParams<{ materialId?: string }>();
  const { fetchMyClassrooms, classrooms, isLoading } = useClassroom();
  const [assigningId, setAssigningId] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    fetchMyClassrooms(user.id, 'teacher');
  }, [user?.id]);

  const handleSelectClassroom = async (classroomId: string) => {
    try {
      setAssigningId(classroomId);
      
      // If a material was passed, assign it to this classroom
      if (materialId) {
        const { error } = await supabase
          .from('materials')
          .update({ classroom_id: classroomId })
          .eq('id', materialId);
        
        if (error) throw error;
        toast.success('Material assigned to classroom!');
      }
      
      // Navigate to the classroom detail page
      router.push(`/(teacher)/classroom/${classroomId}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign material');
      setAssigningId(null);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1, borderBottomColor: '#F0F2F5',
      }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}
        >
          <Feather name="arrow-left" size={18} color="#374151" />
        </TouchableOpacity>
        <Text style={{ fontSize: 17, fontWeight: '800', color: '#1F2937' }}>
          Select Classroom
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
        {isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: 400 }}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={{ marginTop: 12, color: '#8A9BA8', fontSize: 14 }}>
              Loading classrooms...
            </Text>
          </View>
        ) : classrooms && classrooms.length > 0 ? (
          <>
            <Text style={{ fontSize: 11, fontWeight: '800', color: '#6B7280', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 16 }}>
              Your Classrooms
            </Text>
            {classrooms.map((classroom) => (
              <TouchableOpacity
                key={classroom.id}
                onPress={() => handleSelectClassroom(classroom.id)}
                disabled={assigningId !== null}
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: assigningId === classroom.id ? theme.colors.primary : '#F0F2F5',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  opacity: assigningId === classroom.id ? 0.7 : 1,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#1F2937', marginBottom: 4 }}>
                    {classroom.name}
                  </Text>
                  <Text style={{ fontSize: 13, color: '#8A9BA8' }}>
                    {classroom.subject && `Subject: ${classroom.subject}`}
                  </Text>
                </View>
                {assigningId === classroom.id ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                  <Feather name="chevron-right" size={20} color="#D1D5DB" />
                )}
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
            <Feather name="inbox" size={48} color="#D1D5DB" style={{ marginBottom: 12 }} />
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#6B7280', marginBottom: 8 }}>
              No Classrooms Yet
            </Text>
            <Text style={{ fontSize: 14, color: '#9CA3AF', textAlign: 'center', marginBottom: 24 }}>
              Create a classroom to assign materials
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(teacher)/classroom/create')}
              style={{
                backgroundColor: theme.colors.primary,
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 14 }}>
                Create Classroom
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
