import { QRCodeScanner } from '@/components/QRCodeScanner';
import { theme } from '@/config/theme';
import { useToast } from '@/hooks/useToast';
import { useClassroom } from '@/modules/classroom/useClassroom';
import { useAuth } from '@/modules/security/useAuth';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator, Animated,
  KeyboardAvoidingView,
  Modal,
  Platform, ScrollView,
  Text, TextInput, TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CODE_LENGTH = 6;

export default function JoinClassroomScreen() {
  const { user } = useAuth();
  const { joinClassroom, isJoining } = useClassroom();
  const toast = useToast();

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
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

  const handleScanSuccess = (scannedCode: string) => {
    const codeArray = scannedCode.split('');
    setCode(codeArray);
    setShowScanner(false);
    setError('');
  };

  const handleJoin = async () => {
    if (!isComplete) return;
    setError('');

    if (!user) {
      const msg = 'You must be logged in to join a class.';
      setError(msg);
      toast.warning(msg);
      return;
    }

    const { classroom, error: joinError } = await joinClassroom(fullCode, user.id);

    if (joinError || !classroom) {
      const msg = joinError?.message ?? 'Class not found. Check the code and try again.';
      setError(msg);
      toast.error(msg);
      return;
    }

    toast.success('Successfully joined class!');
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

              {/* Scanner button */}
              <TouchableOpacity
                onPress={() => setShowScanner(true)}
                style={{
                  width: '100%', paddingVertical: 12, borderRadius: 14,
                  backgroundColor: '#F3F4F6',
                  alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'row',
                  marginBottom: 12,
                }}
              >
                <Feather name="camera" size={16} color={theme.colors.wrenly.primary} style={{ marginRight: 8 }} />
                <Text style={{ color: theme.colors.wrenly.primary, fontWeight: '700', fontSize: 15 }}>
                  Scan QR Code
                </Text>
              </TouchableOpacity>

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
                You're in!
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

      {/* QR Code Scanner Modal */}
      <Modal
        visible={showScanner}
        animationType="slide"
        onRequestClose={() => setShowScanner(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
          <QRCodeScanner
            onScanSuccess={handleScanSuccess}
            onClose={() => setShowScanner(false)}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
