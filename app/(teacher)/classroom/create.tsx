import { theme } from '@/config/theme';
import { useToast } from '@/hooks/useToast';
import { useClassroom } from '@/modules/classroom/useClassroom';
import { useAuth } from '@/modules/security/useAuth';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Clipboard,
    KeyboardAvoidingView, Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateClassroomScreen() {
  const { user } = useAuth();
  const { createClassroom, isCreating } = useClassroom();
  const toast = useToast();

  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [nameFocused, setNameFocused] = useState(false);
  const [subjectFocused, setSubjectFocused] = useState(false);
  const [nameError, setNameError] = useState('');
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [createdName, setCreatedName] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      setNameError('Classroom name is required.');
      return;
    }
    setNameError('');

    const { classroom, error } = await createClassroom(name.trim(), subject.trim(), user!.id);
    if (error) {
      toast.error(error.message ?? 'Could not create classroom. Try again.');
      return;
    }
    toast.success('Classroom created!');
    setCreatedCode(classroom!.class_code);
    setCreatedName(classroom!.name);
  };

  const handleCopy = () => {
    if (!createdCode) return;
    Clipboard.setString(createdCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDone = () => {
    router.replace('/(teacher)/dashboard');
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
          Create Classroom
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>

          {!createdCode ? (
            <>
              {/* Class Name */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{
                  fontSize: 11, fontWeight: '800', color: '#6B7280',
                  letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8,
                }}>
                  Class Name *
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  placeholder="e.g. Grade 10 Mathematics"
                  placeholderTextColor="#C4C9D4"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 14, borderWidth: 1.5,
                    borderColor: nameError ? theme.colors.wrenly.danger : nameFocused ? theme.colors.wrenly.primary : '#E5E7EB',
                    paddingHorizontal: 16, paddingVertical: 14,
                    fontSize: 15, color: '#1F2937', fontWeight: '500',
                  }}
                />
                {nameError ? (
                  <Text style={{ color: theme.colors.wrenly.danger, fontSize: 12, marginTop: 6 }}>{nameError}</Text>
                ) : null}
              </View>

              {/* Subject */}
              <View style={{ marginBottom: 32 }}>
                <Text style={{
                  fontSize: 11, fontWeight: '800', color: '#6B7280',
                  letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8,
                }}>
                  Subject (optional)
                </Text>
                <TextInput
                  value={subject}
                  onChangeText={setSubject}
                  onFocus={() => setSubjectFocused(true)}
                  onBlur={() => setSubjectFocused(false)}
                  placeholder="e.g. Mathematics, Science, English…"
                  placeholderTextColor="#C4C9D4"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 14, borderWidth: 1.5,
                    borderColor: subjectFocused ? theme.colors.wrenly.primary : '#E5E7EB',
                    paddingHorizontal: 16, paddingVertical: 14,
                    fontSize: 15, color: '#1F2937', fontWeight: '500',
                  }}
                />
              </View>

              {/* Create Button */}
              <TouchableOpacity
                onPress={handleCreate}
                disabled={isCreating}
                style={{
                  backgroundColor: theme.colors.wrenly.primary,
                  paddingVertical: 16, borderRadius: 14,
                  alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'row',
                  opacity: isCreating ? 0.7 : 1,
                  shadowColor: theme.colors.wrenly.primary,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.3, shadowRadius: 12, elevation: 4,
                }}
              >
                {isCreating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                ) : (
                  <Feather name="plus-circle" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                )}
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 16 }}>
                  {isCreating ? 'Creating…' : 'Create Classroom'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            /* ── Success: show generated code ─────────────────────── */
            <View style={{ alignItems: 'center', paddingTop: 16 }}>
              {/* Checkmark */}
              <View style={{
                width: 72, height: 72, borderRadius: 36,
                backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
              }}>
                <Feather name="check" size={32} color="#059669" />
              </View>

              <Text style={{ fontSize: 22, fontWeight: '900', color: '#1F2937', marginBottom: 6, textAlign: 'center' }}>
                Classroom Created!
              </Text>
              <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 32, textAlign: 'center' }}>
                Share this code with your students so they can join "{createdName}".
              </Text>

              {/* Code box */}
              <View style={{
                width: '100%', backgroundColor: '#F0FAF8',
                borderRadius: 20, padding: 28, alignItems: 'center',
                borderWidth: 2, borderColor: theme.colors.wrenly.primary + '30',
                marginBottom: 24,
              }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
                  Your Class Code
                </Text>
                <Text style={{
                  fontSize: 42, fontWeight: '900', color: theme.colors.wrenly.primary,
                  letterSpacing: 8, marginBottom: 20,
                }}>
                  {createdCode}
                </Text>

                <TouchableOpacity
                  onPress={handleCopy}
                  style={{
                    flexDirection: 'row', alignItems: 'center',
                    backgroundColor: copied ? '#059669' : theme.colors.wrenly.primary,
                    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12,
                  }}
                >
                  <Feather name={copied ? 'check' : 'copy'} size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 14 }}>
                    {copied ? 'Copied!' : 'Copy Code'}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={handleDone}
                style={{
                  width: '100%', borderRadius: 14, paddingVertical: 16,
                  alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <Text style={{ color: '#374151', fontWeight: '700', fontSize: 15 }}>
                  Done — Go to Dashboard
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
