import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/modules/security/useAuth';
import { UserRole } from '@/types/auth.types';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { theme } from '@/config/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { signUp, isLoading } = useAuth();

  const role = ((params.initialRole as string) || 'student') as UserRole;
  const isStudent = role === 'student';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [lrn, setLrn] = useState('');         // student only
  const [teacherId, setTeacherId] = useState(''); // teacher only
  const [school, setSchool] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    lrn?: string;
    teacherId?: string;
    school?: string;
    gradeLevel?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const validate = () => {
    let valid = true;
    const newErrors: typeof errors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
      valid = false;
    }

    if (isStudent) {
      if (!lrn.trim()) {
        newErrors.lrn = 'LRN is required';
        valid = false;
      } else if (lrn.trim().length !== 12 || !/^\d+$/.test(lrn.trim())) {
        newErrors.lrn = 'LRN must be exactly 12 digits';
        valid = false;
      }
      if (!school.trim()) {
        newErrors.school = 'School is required';
        valid = false;
      }
      if (!gradeLevel.trim()) {
        newErrors.gradeLevel = 'Grade/Year is required';
        valid = false;
      }
    } else {
      if (!email.trim()) {
        newErrors.email = 'Email is required';
        valid = false;
      } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
        newErrors.email = 'Please enter a valid email address';
        valid = false;
      }
      if (!teacherId.trim()) {
        newErrors.teacherId = 'Teacher ID is required';
        valid = false;
      }
      if (!school.trim()) {
        newErrors.school = 'School is required';
        valid = false;
      }
    }

    if (!password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      valid = false;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setErrors({});

    // For students, email is derived from LRN
    const finalEmail = isStudent
      ? `${lrn.trim()}@student.wrenly.ai`
      : email.trim().toLowerCase();

    const { error } = await signUp({
      email: finalEmail,
      password,
      fullName,
      role,
      school,
      gradeLevel: isStudent ? parseInt(gradeLevel) : undefined,
    });

    if (error) {
      setErrors({ general: error.message || 'Registration failed. Please try again.' });
    }
    // On success → auth store sets isAuthenticated = true → layout navigates to /welcome
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 20, paddingVertical: 16, alignItems: 'center' }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={{ alignItems: 'center', width: '100%', marginBottom: 8 }}>
            <Image
              source={require('@/assets/images/logo-with-text.png')}
              style={{ width: 200, height: 72 }}
              resizeMode="contain"
            />

            {/* Role badge */}
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: isStudent ? '#F0FAF8' : '#EEF2FF',
              paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginTop: 8
            }}>
              <MaterialCommunityIcons
                name={isStudent ? 'school' : 'briefcase-variant'}
                size={16}
                color={isStudent ? theme.colors.wrenly.primary : '#6366F1'}
              />
              <Text style={{
                fontSize: 13, fontWeight: 'bold', marginLeft: 6,
                color: isStudent ? theme.colors.wrenly.primary : '#6366F1'
              }}>
                {isStudent ? 'Student Registration' : 'Teacher Registration'}
              </Text>
            </View>
          </View>

          {/* Form Card */}
          <View style={{
            width: '100%', maxWidth: 440,
            backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20,
            borderWidth: 1, borderColor: '#EFEFEF',
            marginBottom: 16
          }}>

            {errors.general && (
              <View style={{ backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 12, padding: 12, marginBottom: 16 }}>
                <Text style={{ color: '#EF4444', fontWeight: '600', textAlign: 'center', fontSize: 13 }}>{errors.general}</Text>
              </View>
            )}

            {/* Full Name */}
            <Input
              label="FULL NAME"
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={(t) => { setFullName(t); if (errors.fullName) setErrors({ ...errors, fullName: undefined }); }}
              error={errors.fullName}
              leftIcon={<MaterialCommunityIcons name="account-outline" size={22} color={theme.colors.wrenly.textSecondary} />}
            />

            {/* STUDENT: LRN field */}
            {isStudent && (
              <Input
                label="LEARNER REFERENCE NUMBER (LRN)"
                placeholder="Enter your 12-digit LRN"
                keyboardType="number-pad"
                maxLength={12}
                value={lrn}
                onChangeText={(t) => { setLrn(t.replace(/[^0-9]/g, '')); if (errors.lrn) setErrors({ ...errors, lrn: undefined }); }}
                error={errors.lrn}
                leftIcon={<MaterialCommunityIcons name="badge-account-horizontal-outline" size={22} color={theme.colors.wrenly.textSecondary} />}
              />
            )}

            {/* TEACHER: Email + Teacher ID fields */}
            {!isStudent && (
              <>
                <Input
                  label="EMAIL ADDRESS"
                  placeholder="teacher@school.edu"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={(t) => { setEmail(t); if (errors.email) setErrors({ ...errors, email: undefined }); }}
                  error={errors.email}
                  leftIcon={<MaterialCommunityIcons name="email-outline" size={22} color={theme.colors.wrenly.textSecondary} />}
                />
                <Input
                  label="TEACHER ID"
                  placeholder="Enter your official Teacher ID"
                  value={teacherId}
                  onChangeText={(t) => { setTeacherId(t); if (errors.teacherId) setErrors({ ...errors, teacherId: undefined }); }}
                  error={errors.teacherId}
                  leftIcon={<MaterialCommunityIcons name="card-account-details-outline" size={22} color={theme.colors.wrenly.textSecondary} />}
                />
              </>
            )}

            {/* School — both roles */}
            <Input
              label="SCHOOL"
              placeholder="School name"
              value={school}
              onChangeText={(t) => { setSchool(t); if (errors.school) setErrors({ ...errors, school: undefined }); }}
              error={errors.school}
              leftIcon={<MaterialCommunityIcons name="office-building" size={22} color={theme.colors.wrenly.textSecondary} />}
            />

            {/* Grade/Year — student only */}
            {isStudent && (
              <Input
                label="YEAR / GRADE LEVEL"
                placeholder="e.g. 7, 8, 9, 10, 11, 12"
                keyboardType="number-pad"
                maxLength={2}
                value={gradeLevel}
                onChangeText={(t) => { setGradeLevel(t.replace(/[^0-9]/g, '')); if (errors.gradeLevel) setErrors({ ...errors, gradeLevel: undefined }); }}
                error={errors.gradeLevel}
                leftIcon={<MaterialCommunityIcons name="stairs" size={22} color={theme.colors.wrenly.textSecondary} />}
              />
            )}

            <Input
              label="PASSWORD"
              placeholder="••••••••"
              isPassword
              value={password}
              onChangeText={(t) => { setPassword(t); if (errors.password) setErrors({ ...errors, password: undefined }); }}
              error={errors.password}
              leftIcon={<MaterialCommunityIcons name="lock-outline" size={22} color={theme.colors.wrenly.textSecondary} />}
            />

            <Input
              label="CONFIRM PASSWORD"
              placeholder="••••••••"
              isPassword
              value={confirmPassword}
              onChangeText={(t) => { setConfirmPassword(t); if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined }); }}
              error={errors.confirmPassword}
              leftIcon={<MaterialCommunityIcons name="lock-check-outline" size={22} color={theme.colors.wrenly.textSecondary} />}
            />

            <Button
              label="Create Account"
              size="md"
              onPress={handleRegister}
              loading={isLoading}
              style={{ borderRadius: 12, marginTop: 8, paddingVertical: 14 }}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
              <Text style={{ color: '#9CA3AF', fontSize: 14 }}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
                <Text style={{ color: theme.colors.wrenly.primary, fontSize: 14, fontWeight: 'bold' }}>Login</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
