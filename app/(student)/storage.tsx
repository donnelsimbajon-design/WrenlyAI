import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { DownloadManager } from '@/modules/offline/download.manager';
import { OfflineService } from '@/modules/offline/offline.service';
import { SyncEngine } from '@/modules/sync/sync.engine';
import { useNetworkStatus } from '@/utils/network';
import { OfflineBanner } from '@/components/ui/OfflineBanner';

export default function StorageManagerScreen() {
  const { isOnline } = useNetworkStatus();
  const [stats, setStats] = useState({
    totalBytes: 0,
    lessonsAvailable: 0,
    pendingSync: 0,
    downloadedLessons: [] as any[]
  });
  const [unsyncedList, setUnsyncedList] = useState<any[]>([]);

  const loadData = async () => {
    const s = await DownloadManager.getStorageStats();
    setStats(s);
    try {
      const unsynced = await OfflineService.getUnsyncedQuizAttempts();
      setUnsyncedList(unsynced);
    } catch(e) { }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    Alert.alert('Delete Lesson', 'Are you sure you want to remove this lesson from your device?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await OfflineService.deleteLesson(id);
        loadData();
      }}
    ]);
  };

  const handleManualSync = async () => {
    if (!isOnline) {
      Alert.alert('Offline', 'You must be connected to the internet to sync.');
      return;
    }
    await SyncEngine.sync();
    loadData();
    Alert.alert('Sync Complete', 'Your offline progress has been synced to the cloud.');
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const maxStorage = 10 * 1024 * 1024 * 1024; // 10 GB limit mock
  const storagePercentage = Math.min((stats.totalBytes / maxStorage) * 100, 100);

  return (
    <SafeAreaView className="flex-1 bg-wrenly-background" edges={['top']}>
      <StatusBar style="light" />
      <OfflineBanner />

      <ScrollView contentContainerClassName="p-6 pb-24">
        <Text className="text-3xl font-bold text-wrenly-text tracking-tight font-poppins mb-6 mt-4">
          Storage Manager
        </Text>

        {/* Storage Stats */}
        <View className="bg-wrenly-surface p-6 rounded-2xl border border-wrenly-border mb-8 shadow-sm">
          <View className="flex-row justify-between items-end mb-3">
            <Text className="text-wrenly-text font-semibold text-base font-poppins">Device Storage</Text>
            <Text className="text-wrenly-textSecondary text-xs">{formatBytes(stats.totalBytes)} / 10 GB used</Text>
          </View>
          <View className="w-full bg-wrenly-background h-3 rounded-full overflow-hidden mb-6">
            <View 
              className="h-full bg-wrenly-primary rounded-full" 
              style={{ width: `${storagePercentage}%` }} 
            />
          </View>

          <View className="flex-row justify-between px-2">
            <View className="items-center">
              <Text className="text-wrenly-text text-2xl font-bold font-poppins">{stats.lessonsAvailable}</Text>
              <Text className="text-wrenly-textSecondary text-xs">Lessons Available</Text>
            </View>
            <View className="w-px bg-wrenly-border" />
            <View className="items-center">
              <Text className="text-wrenly-text text-2xl font-bold font-poppins">{stats.pendingSync}</Text>
              <Text className="text-wrenly-textSecondary text-xs">Pending Sync</Text>
            </View>
          </View>
        </View>

        {/* Sync Controls */}
        {stats.pendingSync > 0 && (
          <TouchableOpacity 
            onPress={handleManualSync}
            className={`w-full p-4 rounded-xl mb-8 items-center ${isOnline ? 'bg-wrenly-primary shadow-sm' : 'bg-wrenly-surface border border-wrenly-border opacity-50'}`}
          >
            <Text className={`font-bold text-base ${isOnline ? 'text-wrenly-text' : 'text-wrenly-textSecondary'}`}>
              {isOnline ? 'Sync Now' : 'Sync Paused (Offline)'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Ready to Learn (Downloads) */}
        <View className="mb-8">
          <Text className="text-xl font-bold text-wrenly-text mb-4 font-poppins">Ready to Learn</Text>
          {stats.downloadedLessons.length === 0 ? (
            <View className="bg-wrenly-surface p-6 rounded-2xl border border-wrenly-border items-center">
              <Text className="text-wrenly-textSecondary italic text-sm">No lessons downloaded.</Text>
            </View>
          ) : (
            stats.downloadedLessons.map(lesson => (
              <View key={lesson.id} className="bg-wrenly-surface p-4 rounded-2xl border border-wrenly-border mb-3 flex-row items-center shadow-sm">
                <View className="flex-1 pr-4">
                  <Text className="text-wrenly-text font-semibold text-base mb-1" numberOfLines={1}>{lesson.title || 'Untitled Lesson'}</Text>
                  <Text className="text-wrenly-textSecondary text-xs">
                    {formatBytes(lesson.file_size)} • {new Date(lesson.downloaded_at).toLocaleDateString()}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(lesson.id)} className="bg-wrenly-danger/20 p-2 px-3 rounded-lg">
                  <Text className="text-wrenly-danger font-bold text-xs uppercase">Delete</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Waiting to Sync */}
        <View>
          <Text className="text-xl font-bold text-wrenly-text mb-4 font-poppins">Waiting to Sync</Text>
          {unsyncedList.length === 0 ? (
            <View className="bg-wrenly-surface p-6 rounded-2xl border border-wrenly-border items-center">
              <Text className="text-wrenly-textSecondary italic text-sm">Everything is synced!</Text>
            </View>
          ) : (
            unsyncedList.map(item => (
              <View key={item.id} className="bg-wrenly-surface p-4 rounded-2xl border border-wrenly-border mb-3 flex-row items-center justify-between shadow-sm">
                <View>
                  <Text className="text-wrenly-text font-semibold text-sm mb-1">Quiz Attempt ({item.score}%)</Text>
                  <Text className="text-wrenly-textSecondary text-xs">{new Date(item.completed_at).toLocaleString()}</Text>
                </View>
                <View className="bg-wrenly-warning/20 px-2 py-1 rounded">
                  <Text className="text-wrenly-warning font-bold text-[10px] uppercase tracking-wider">WAITING</Text>
                </View>
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
