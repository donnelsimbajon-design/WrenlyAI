import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather, Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '@/modules/security/useAuth';

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  const handleLogout = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={{ fontSize: 11, fontWeight: '800', color: '#8A9BA8', letterSpacing: 0.5, marginBottom: 8, marginLeft: 8, marginTop: 24 }}>
      {title}
    </Text>
  );

  const SettingItem = ({ icon, title, rightElement, isLast, onPress }: any) => (
    <TouchableOpacity 
      onPress={onPress}
      disabled={!onPress}
      style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderBottomWidth: isLast ? 0 : 1, borderBottomColor: '#F0F2F5' }}
    >
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#F4F6F9', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
        {icon}
      </View>
      <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: '#2C3E50' }}>{title}</Text>
      {rightElement || <Feather name="chevron-right" size={20} color="#A0AEBA" />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', zIndex: 10 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Feather name="arrow-left" size={20} color="#00665E" />
        </TouchableOpacity>
        <Text style={{ flex: 1, color: '#00665E', fontWeight: '800', fontSize: 16 }}>
          Settings
        </Text>
        <TouchableOpacity style={{ marginRight: 16 }}>
          <Ionicons name="information-circle" size={20} color="#566B80" />
        </TouchableOpacity>
        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#E0F0F0', alignItems: 'center', justifyContent: 'center' }}>
          <FontAwesome5 name="user-graduate" size={14} color="#00665E" />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
        
        {/* ACCOUNT */}
        <SectionHeader title="ACCOUNT" />
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#F0F2F5', }}>
          <SettingItem 
            icon={<Feather name="user" size={18} color="#566B80" />} 
            title="Profile Information" 
            onPress={() => {}}
          />
          <SettingItem 
            icon={<Feather name="key" size={18} color="#566B80" />} 
            title="Change Password" 
            onPress={() => {}}
          />
          <SettingItem 
            icon={<Feather name="bell" size={18} color="#566B80" />} 
            title="Notifications" 
            isLast
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#E2E8F0', true: '#00665E' }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </View>

        {/* PREFERENCES */}
        <SectionHeader title="PREFERENCES" />
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#F0F2F5', }}>
          <SettingItem 
            icon={<Feather name="globe" size={18} color="#566B80" />} 
            title="Language" 
            onPress={() => {}}
            rightElement={
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 13, color: '#8A9BA8', marginRight: 4, fontWeight: '600' }}>English</Text>
                <Feather name="chevron-right" size={16} color="#A0AEBA" />
              </View>
            }
          />
          <SettingItem 
            icon={<Feather name="moon" size={18} color="#566B80" />} 
            title="Dark Mode" 
            isLast
            rightElement={
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                trackColor={{ false: '#E2E8F0', true: '#00665E' }}
                thumbColor="#FFFFFF"
              />
            }
          />
        </View>

        {/* SUPPORT */}
        <SectionHeader title="SUPPORT" />
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#F0F2F5', }}>
          <SettingItem 
            icon={<Feather name="help-circle" size={18} color="#566B80" />} 
            title="Help Center" 
            onPress={() => {}}
          />
          <SettingItem 
            icon={<Feather name="shield" size={18} color="#566B80" />} 
            title="Privacy Policy" 
            onPress={() => {}}
          />
          <SettingItem 
            icon={<Feather name="info" size={18} color="#566B80" />} 
            title="About Wrenly AI" 
            isLast
            onPress={() => {}}
            rightElement={
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 13, color: '#8A9BA8', marginRight: 4, fontWeight: '600' }}>v1.0.0</Text>
                <Feather name="chevron-right" size={16} color="#A0AEBA" />
              </View>
            }
          />
        </View>

        {/* Log Out Button */}
        <TouchableOpacity 
          onPress={handleLogout}
          style={{ marginTop: 40, width: '100%', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#FF4757', backgroundColor: '#FFFFFF', alignItems: 'center', }}
        >
          <Text style={{ color: '#FF4757', fontWeight: '800', fontSize: 15 }}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
