import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/modules/security/useAuth';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { theme } from '@/config/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, isLoading } = useAuth();

  const [identifier, setIdentifier] = useState(''); // LRN (student) or email (teacher)
  const [password, setPassword] = useState('');
  const [hasConsent, setHasConsent] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string; consent?: string; general?: string }>({});

  // If it looks like a 12-digit number, treat as student LRN
  const isLRN = /^\d{1,12}$/.test(identifier.trim());

  const validate = () => {
    let valid = true;
    const newErrors: typeof errors = {};

    if (!identifier.trim()) {
      newErrors.identifier = 'LRN or email is required';
      valid = false;
    } else if (/^\d+$/.test(identifier.trim()) && identifier.trim().length !== 12) {
      newErrors.identifier = 'Student LRN must be exactly 12 digits';
      valid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      valid = false;
    }

    if (isLRN && identifier.length === 12 && !hasConsent) {
      newErrors.consent = 'You must agree to the privacy policy';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setErrors({});

    // Auto-detect: 12-digit number = student LRN, otherwise = teacher email
    const isStudent = /^\d{12}$/.test(identifier.trim());
    const email = isStudent
      ? `${identifier.trim()}@student.wrenly.ai`
      : identifier.trim().toLowerCase();

    const { error } = await signIn({ email, password });

    if (error) {
      setErrors({ general: 'Invalid credentials. Please check your LRN/email and password.' });
    }
    // On success → auth store sets isAuthenticated = true → layout redirects to /welcome
  };

  const showConsentBox = /^\d{12}$/.test(identifier.trim());

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 20,
            paddingVertical: 16,
            alignItems: 'center',
            justifyContent: 'center',
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={{ alignItems: 'center', marginBottom: -16, zIndex: 10, width: '100%' }}>
            <Image
              source={require('@/assets/images/logo-with-text.png')}
              style={{ width: 300, height: 120 }}
              resizeMode="contain"
            />
          </View>

          {/* Card */}
          <View style={{
            width: '100%',
            maxWidth: 440,
            backgroundColor: '#FFFFFF',
            borderRadius: 24,
            padding: 20,
            borderWidth: 1,
            borderColor: '#EFEFEF',
            marginBottom: 16,
          }}>

            {/* General Error */}
            {errors.general && (
              <View style={{ backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 12, padding: 12, marginBottom: 16 }}>
                <Text style={{ color: '#EF4444', fontWeight: '600', textAlign: 'center', fontSize: 13 }}>{errors.general}</Text>
              </View>
            )}

            <Input
              label="LRN OR EMAIL"
              placeholder="12-digit LRN or teacher@school.edu"
              keyboardType="default"
              autoCapitalize="none"
              value={identifier}
              onChangeText={(text) => {
                setIdentifier(text);
                if (errors.identifier) setErrors({ ...errors, identifier: undefined });
              }}
              error={errors.identifier}
              leftIcon={<MaterialCommunityIcons name="account-outline" size={22} color={theme.colors.wrenly.textSecondary} />}
            />

            <Input
              label="PASSWORD"
              placeholder="••••••••"
              isPassword
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({ ...errors, password: undefined });
              }}
              error={errors.password}
              leftIcon={<MaterialCommunityIcons name="lock-outline" size={22} color={theme.colors.wrenly.textSecondary} />}
            />

            {/* Consent — only shown when LRN is fully entered */}
            {showConsentBox && (
              <>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => {
                    setHasConsent(!hasConsent);
                    if (errors.consent) setErrors({ ...errors, consent: undefined });
                  }}
                  style={{ backgroundColor: '#F8F9FA', padding: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}
                >
                  <View style={{
                    width: 20, height: 20, borderRadius: 4, borderWidth: 1, marginTop: 2,
                    alignItems: 'center', justifyContent: 'center', marginRight: 10,
                    backgroundColor: hasConsent ? theme.colors.wrenly.primary : '#FFFFFF',
                    borderColor: hasConsent ? theme.colors.wrenly.primary : '#D1D5DB',
                  }}>
                    {hasConsent && <Feather name="check" size={13} color="white" />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#6B7280', fontSize: 12, lineHeight: 20 }}>
                      I confirm I have my parent/guardian's consent to access Wrenly AI. I agree to the{' '}
                      <Text style={{ color: theme.colors.wrenly.primary, fontWeight: 'bold' }}>Privacy Policy</Text>
                      {' '}and learning guidelines.
                    </Text>
                  </View>
                </TouchableOpacity>
                {errors.consent && (
                  <Text style={{ color: '#EF4444', fontSize: 12, marginBottom: 12, marginLeft: 4 }}>{errors.consent}</Text>
                )}
              </>
            )}

            {/* Login Button */}
            <Button
              label="Login"
              size="md"
              onPress={handleLogin}
              loading={isLoading}
              rightIcon={<Feather name="arrow-right" size={20} color="white" />}
              style={{ borderRadius: 12, paddingVertical: 14 }}
            />

            {/* Register Link — goes to splash (role selector) first */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
              <Text style={{ color: '#9CA3AF', fontSize: 14 }}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/splash')}>
                <Text style={{ color: theme.colors.wrenly.primary, fontSize: 14, fontWeight: 'bold' }}>Register</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
