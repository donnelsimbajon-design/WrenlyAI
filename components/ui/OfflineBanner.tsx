import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetworkStatus } from '@/utils/network';

export function OfflineBanner() {
  const { isOnline } = useNetworkStatus();
  const insets = useSafeAreaInsets();
  
  if (isOnline) return null;

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 10) }]}>
      <Text style={styles.text}>No Internet Connection. You are offline.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F5A623',
    paddingBottom: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  text: {
    color: '#1A1A2E',
    fontFamily: 'Inter',
    fontWeight: '600',
    fontSize: 14,
  },
});
