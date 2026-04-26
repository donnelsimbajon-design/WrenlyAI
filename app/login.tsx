import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { Button } from '@/components/ui/Button';
import { loginWithEmail, type LoginCredentials } from '@/modules/security/AuthService';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  lrn: string;
  password: string;
  parentalConsent: boolean;
}

interface FormErrors {
  lrn?: string;
  password?: string;
  parentalConsent?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!form.lrn.trim()) {
    errors.lrn = 'Student LRN (Email) is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.lrn.trim())) {
    errors.lrn = 'Enter a valid email address.';
  }

  if (!form.password) {
    errors.password = 'Password is required.';
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }

  if (!form.parentalConsent) {
    errors.parentalConsent = 'Parental consent is required to continue.';
  }

  return errors;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface LabeledInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences';
  accessibilityLabel?: string;
  testID?: string;
}

function LabeledInput({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  accessibilityLabel,
  testID,
}: LabeledInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View className="mb-4">
      <Text className="text-sm font-semibold text-slate-600 mb-1.5">
        {label}
      </Text>
      <TextInput
        testID={testID}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        accessible
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityHint={error ?? undefined}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`
          h-12 px-4 rounded-xl text-base text-slate-900
          border bg-white
          ${focused ? 'border-sky-500' : error ? 'border-red-400' : 'border-slate-200'}
        `}
      />
      {error ? (
        <Text className="text-xs text-red-500 mt-1" accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

/**
 * Login Screen — Student & Teacher entry point for Wrenly AI.
 * Handles email/password auth via AuthService (never calls Supabase directly).
 */
export default function LoginScreen() {
  const [form, setForm] = useState<FormState>({
    lrn: '',
    password: '',
    parentalConsent: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const updateField = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      // Clear the error for this field on edit
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    []
  );

  const handleStudentLogin = useCallback(async () => {
    const validationErrors = validateForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    const credentials: LoginCredentials = {
      email: form.lrn,
      password: form.password,
      role: 'student',
    };

    const { error } = await loginWithEmail(credentials);
    setLoading(false);

    if (error) {
      Alert.alert('Login Failed', error.message, [{ text: 'OK' }]);
      return;
    }

    // Navigate to the main app on success
    router.replace('/(tabs)');
  }, [form]);

  const handleTeacherLogin = useCallback(() => {
    router.push('/teacher-login');
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-wrenly-bg">
      <StatusBar style="dark" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow px-6 pt-12 pb-8"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >

          {/* ── Brand Header ── */}
          <View className="items-center mb-10">
            {/* Logo mark */}
            <View
              className="w-16 h-16 rounded-2xl bg-wrenly-primary items-center justify-center mb-4 shadow-md"
              accessibilityRole="image"
              accessibilityLabel="Wrenly AI logo"
            >
              <Text className="text-white text-3xl font-bold">W</Text>
            </View>

            <Text className="text-3xl font-bold text-wrenly-primary tracking-tight">
              Wrenly AI
            </Text>
            <Text className="text-sm text-wrenly-muted mt-1 text-center">
              Offline-first learning for every Filipino student
            </Text>
          </View>

          {/* ── Card ── */}
          <View className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">

            <Text className="text-xl font-bold text-slate-800 mb-1">
              Student Sign In
            </Text>
            <Text className="text-sm text-wrenly-muted mb-6">
              Enter your LRN-linked email and password to continue.
            </Text>

            {/* LRN / Email */}
            <LabeledInput
              label="Student LRN (Email)"
              value={form.lrn}
              onChangeText={(text) => updateField('lrn', text)}
              placeholder="student@deped.edu.ph"
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.lrn}
              accessibilityLabel="Student LRN email"
              testID="input-lrn"
            />

            {/* Password */}
            <LabeledInput
              label="Password"
              value={form.password}
              onChangeText={(text) => updateField('password', text)}
              placeholder="••••••••"
              secureTextEntry
              error={errors.password}
              accessibilityLabel="Password"
              testID="input-password"
            />

            {/* ── Parental Consent Checkbox ── */}
            <Pressable
              testID="checkbox-consent"
              accessible
              accessibilityRole="checkbox"
              accessibilityState={{ checked: form.parentalConsent }}
              accessibilityLabel="I confirm parental or guardian consent to use this application"
              onPress={() => updateField('parentalConsent', !form.parentalConsent)}
              className="flex-row items-start mt-1 mb-5"
            >
              {/* Custom checkbox */}
              <View
                className={`
                  w-5 h-5 rounded border-2 items-center justify-center mr-3 mt-0.5 flex-shrink-0
                  ${form.parentalConsent
                    ? 'bg-wrenly-primary border-wrenly-primary'
                    : errors.parentalConsent
                    ? 'border-red-400 bg-white'
                    : 'border-slate-300 bg-white'}
                `}
              >
                {form.parentalConsent && (
                  <Text className="text-white text-xs font-bold leading-none">✓</Text>
                )}
              </View>
              <View className="flex-1">
                <Text className="text-sm text-slate-600 leading-5">
                  I confirm that a{' '}
                  <Text className="font-semibold text-slate-800">
                    parent or guardian
                  </Text>{' '}
                  has given consent for me to use Wrenly AI.
                </Text>
                {errors.parentalConsent ? (
                  <Text
                    className="text-xs text-red-500 mt-1"
                    accessibilityRole="alert"
                  >
                    {errors.parentalConsent}
                  </Text>
                ) : null}
              </View>
            </Pressable>

            {/* ── Primary Login Button ── */}
            <Button
              label="Sign In"
              variant="primary"
              size="lg"
              loading={loading}
              onPress={handleStudentLogin}
              testID="btn-student-login"
            />
          </View>

          {/* ── Divider ── */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-slate-200" />
            <Text className="text-xs text-wrenly-muted px-3">OR</Text>
            <View className="flex-1 h-px bg-slate-200" />
          </View>

          {/* ── Teacher Login Link ── */}
          <TouchableOpacity
            testID="btn-teacher-login"
            accessible
            accessibilityRole="link"
            accessibilityLabel="Teacher login"
            onPress={handleTeacherLogin}
            className="items-center py-2"
            activeOpacity={0.7}
          >
            <Text className="text-sm text-wrenly-muted">
              Are you an educator?{' '}
              <Text className="text-wrenly-secondary font-semibold">
                Teacher Login →
              </Text>
            </Text>
          </TouchableOpacity>

          {/* ── Footer ── */}
          <Text className="text-center text-xs text-wrenly-muted mt-8">
            Wrenly AI · DepEd Aligned · Offline First
          </Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
