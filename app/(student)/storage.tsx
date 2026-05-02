import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Feather, Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function StorageManagerScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', zIndex: 10 }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <Feather name="arrow-left" size={20} color="#00665E" />
        </TouchableOpacity>
        <Text style={{ flex: 1, color: '#00665E', fontWeight: '800', fontSize: 16 }}>
          Offline Storage
        </Text>
        <TouchableOpacity style={{ marginRight: 16 }}>
          <Ionicons name="information-circle" size={20} color="#566B80" />
        </TouchableOpacity>
        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#E0F0F0', alignItems: 'center', justifyContent: 'center' }}>
          <FontAwesome5 name="user-graduate" size={14} color="#00665E" />
        </View>
      </View>

      {/* Offline Banner */}
      <View style={{ backgroundColor: '#FFF4CE', paddingHorizontal: 24, paddingVertical: 12, flexDirection: 'row', alignItems: 'center' }}>
        <Feather name="wifi-off" size={16} color="#B38600" style={{ marginRight: 8 }} />
        <Ionicons name="warning" size={16} color="#B38600" style={{ marginRight: 8 }} />
        <Text style={{ color: '#8A6D3B', fontWeight: '700', fontSize: 13 }}>
          No Internet Connection. You are offline.
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        
        {/* Device Storage Card */}
        <View style={{ backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#F0F2F5', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 }}>
          <Text style={{ color: '#8A9BA8', fontWeight: '700', fontSize: 10, letterSpacing: 0.5, marginBottom: 8 }}>DEVICE STORAGE</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 }}>
            <Text style={{ color: '#00665E', fontSize: 32, fontWeight: '800', marginRight: 6 }}>1.2</Text>
            <Text style={{ color: '#6A7A82', fontSize: 14, fontWeight: '600' }}>GB used</Text>
          </View>
          <View style={{ width: '100%', backgroundColor: '#F0F2F5', height: 6, borderRadius: 3, overflow: 'hidden' }}>
            <View style={{ height: '100%', backgroundColor: '#00665E', borderRadius: 3, width: '45%' }} />
          </View>
        </View>

        {/* Lessons Available Card */}
        <View style={{ backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#F0F2F5', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 }}>
          <Text style={{ color: '#8A9BA8', fontWeight: '700', fontSize: 10, letterSpacing: 0.5, marginBottom: 8 }}>LESSONS AVAILABLE</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text style={{ color: '#00665E', fontSize: 32, fontWeight: '800', marginRight: 6 }}>14</Text>
            <Text style={{ color: '#6A7A82', fontSize: 14, fontWeight: '600' }}>Modules</Text>
          </View>
        </View>

        {/* Pending Sync Card */}
        <View style={{ backgroundColor: '#FFFFFF', padding: 20, borderRadius: 12, borderWidth: 1, borderColor: '#F0F2F5', marginBottom: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 }}>
          <Text style={{ color: '#8A9BA8', fontWeight: '700', fontSize: 10, letterSpacing: 0.5, marginBottom: 8 }}>PENDING SYNC</Text>
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text style={{ color: '#2C3E50', fontSize: 32, fontWeight: '800', marginRight: 6 }}>3</Text>
            <Text style={{ color: '#6A7A82', fontSize: 14, fontWeight: '600' }}>items</Text>
          </View>
        </View>

        {/* Ready to Learn */}
        <View style={{ marginBottom: 32 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#2C3E50' }}>Ready to Learn</Text>
            <TouchableOpacity>
              <Text style={{ color: '#00665E', fontWeight: '700', fontSize: 12, letterSpacing: 0.5 }}>MANAGE ALL</Text>
            </TouchableOpacity>
          </View>

          {[
            { title: "Math: Fractions & Decimals", subtitle: "420 MB • Downloaded 2 days ago" },
            { title: "Science: The Water Cycle", subtitle: "156 MB • Downloaded 1 week ago" },
            { title: "Literature: Introduction to Poetry", subtitle: "88 MB • Downloaded today" },
          ].map((item, idx) => (
            <View key={idx} style={{ backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F0F2F5', marginBottom: 12, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F7F5', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                <Feather name="check" size={20} color="#00665E" />
              </View>
              <View style={{ flex: 1, paddingRight: 16 }}>
                <Text style={{ color: '#2C3E50', fontWeight: '700', fontSize: 14, marginBottom: 4 }} numberOfLines={1}>{item.title}</Text>
                <Text style={{ color: '#8A9BA8', fontSize: 12 }}>{item.subtitle}</Text>
              </View>
              <TouchableOpacity style={{ padding: 8 }}>
                <Feather name="trash-2" size={18} color="#A0AEBA" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Waiting to Sync */}
        <View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#2C3E50' }}>Waiting to Sync</Text>
            <View style={{ backgroundColor: '#E8F0FE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}>
              <Text style={{ color: '#4285F4', fontWeight: '800', fontSize: 10, letterSpacing: 0.5 }}>3 PENDING</Text>
            </View>
          </View>

          {[
            { title: "Quiz: Fractions Level 1", subtitle: "Completed 14:20 PM" },
            { title: "Essay: The Water Cycle Impact", subtitle: "Draft Saved 15:45 PM" },
            { title: "Module Progress: Poetry", subtitle: "Updated 16:10 PM" },
          ].map((item, idx) => (
            <View key={idx} style={{ backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#F0F2F5', marginBottom: 12, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0F2F5', alignItems: 'center', justifyContent: 'center', marginRight: 16 }}>
                <Ionicons name="cloud" size={20} color="#566B80" />
              </View>
              <View style={{ flex: 1, paddingRight: 16 }}>
                <Text style={{ color: '#2C3E50', fontWeight: '700', fontSize: 14, marginBottom: 4 }}>{item.title}</Text>
                <Text style={{ color: '#8A9BA8', fontSize: 12 }}>{item.subtitle}</Text>
              </View>
              <Text style={{ color: '#A0AEBA', fontWeight: '800', fontSize: 11, letterSpacing: 0.5 }}>WAITING</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
