import React, { useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
  ActivityIndicator, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '@/modules/security/useAuth';
import { useClassroom } from '@/modules/classroom/useClassroom';
import { theme } from '@/config/theme';

const CODE_LENGTH = 6;

export default function JoinClassroomScreen() {
  const { user } = useAuth();
  const { joinClassroom, isJoining } = useClassroom();

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<string | null>(null); // classroom name on success
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  const fullCode = code.join('');
  const isComplete = fullCode.length === CODE_LENGTH;

  const handleChange = (text: string, index: number) => {
    const char = text.slice(-1).toUpperCase();
    const newCode = [...code];
    newCode[index] = char;
    setCode(newCode);
    setError('');

    if (char && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newCode = [...code];
      newCode[index - 1] = '';
      setCode(newCode);
    }
  };

  const handleJoin = async () => {
    if (!isComplete) return;
    setError('');

    if (!user) {
      setError('You must be logged in to join a class.');
      return;
    }

    const { classroom, error: joinError } = await joinClassroom(fullCode, user.id);

    if (joinError || !classroom) {
      setError(joinError?.message ?? 'Class not found. Check the code and try again.');
      return;
    }

    setSuccess(classroom.name);
    Animated.parallel([
      Animated.spring(successScale, { toValue: 1, useNativeDriver: Platform.OS !== 'web', damping: 12 }),
      Animated.timing(successOpacity, { toValue: 1, duration: 300, useNativeDriver: Platform.OS !== 'web' }),
    ]).start();

    setTimeout(() => {
      router.replace('/(student)/dashboard');
    }, 2500);
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
        <Text style={{ fontSize: 17, fontWeight: '800', color: '#1F2937' }}>Join a Class</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 32, alignItems: 'center' }}>

          {!success ? (
            <>
              {/* Icon */}
              <View style={{
                width: 80, height: 80, borderRadius: 40,
                backgroundColor: '#F0FAF8', alignItems: 'center', justifyContent: 'center',
                marginTop: 16, marginBottom: 24,
              }}>
                <Feather name="hash" size={36} color={theme.colors.wrenly.primary} />
              </View>

              {/* Heading */}
              <Text style={{ fontSize: 24, fontWeight: '900', color: '#1F2937', textAlign: 'center', marginBottom: 8 }}>
                Enter your class code
              </Text>
              <Text style={{ fontSize: 14, color: '#9CA3AF', textAlign: 'center', marginBottom: 36 }}>
                Ask your teacher for the 6-character code
              </Text>

              {/* OTP boxes */}
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                {code.map((char, i) => (
                  <TextInput
                    key={i}
                    ref={el => { inputRefs.current[i] = el; }}
                    value={char}
                    onChangeText={(t) => handleChange(t, i)}
                    onKeyPress={(e) => handleKeyPress(e, i)}
                    maxLength={2} // allow 1 char + backspace detection
                    autoCapitalize="characters"
                    style={{
                      width: 46, height: 58,
                      borderRadius: 14,
                      borderWidth: 2,
                      borderColor: char ? theme.colors.wrenly.primary : error ? theme.colors.wrenly.danger : '#E5E7EB',
                      backgroundColor: char ? '#F0FAF8' : '#FFFFFF',
                      textAlign: 'center',
                      fontSize: 22, fontWeight: '900',
                      color: theme.colors.wrenly.primary,
                    }}
                    textContentType="oneTimeCode"
                  />
                ))}
              </View>

              {/* Error */}
              {error ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Feather name="x-circle" size={14} color={theme.colors.wrenly.danger} style={{ marginRight: 6 }} />
                  <Text style={{ color: theme.colors.wrenly.danger, fontSize: 13, fontWeight: '600' }}>{error}</Text>
                </View>
              ) : <View style={{ height: 26 }} />}

              {/* Join button */}
              <TouchableOpacity
                onPress={handleJoin}
                disabled={!isComplete || isJoining}
                style={{
                  width: '100%', paddingVertical: 16, borderRadius: 14,
                  backgroundColor: theme.colors.wrenly.primary,
                  alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'row',
                  opacity: (!isComplete || isJoining) ? 0.5 : 1,
                  shadowColor: theme.colors.wrenly.primary,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.3, shadowRadius: 12, elevation: 4,
                  marginTop: 8,
                }}
              >
                {isJoining ? (
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                ) : (
                  <Feather name="log-in" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                )}
                <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 16 }}>
                  {isJoining ? 'Joining…' : 'Join Class'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            /* ── Success ──────────────────────────────────────────────── */
            <Animated.View style={{
              opacity: successOpacity,
              transform: [{ scale: successScale }],
              alignItems: 'center', paddingTop: 40,
            }}>
              <View style={{
                width: 90, height: 90, borderRadius: 45,
                backgroundColor: '#ECFDF5', alignItems: 'center', justifyContent: 'center',
                marginBottom: 24,
              }}>
                <Feather name="check" size={40} color="#059669" />
              </View>
              <Text style={{ fontSize: 26, fontWeight: '900', color: '#1F2937', textAlign: 'center', marginBottom: 12 }}>
                You're in! 🎉
              </Text>
              <Text style={{ fontSize: 15, color: '#6B7280', textAlign: 'center' }}>
                Successfully joined{'\n'}
                <Text style={{ fontWeight: '800', color: theme.colors.wrenly.primary }}>
                  {success}
                </Text>
              </Text>
              <Text style={{ fontSize: 12, color: '#C4C9D4', marginTop: 24 }}>
                Redirecting to your dashboard…
              </Text>
            </Animated.View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
