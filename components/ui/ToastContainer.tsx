import { useToastStore } from '@/hooks/useToast';
import { Feather } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TOAST_HEIGHT = 60;
const TOAST_MARGIN = 16;

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <View style={styles.container}>
      {toasts.map((toast, index) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          index={index}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </View>
  );
}

interface ToastItemProps {
  toast: any;
  index: number;
  onClose: () => void;
}

function ToastItem({ toast, index, onClose }: ToastItemProps) {
  const slideAnim = React.useRef(new Animated.Value(300)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      damping: 8,
    }).start();
  }, []);

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success': return '#10B981';
      case 'error': return '#EF4444';
      case 'warning': return '#F59E0B';
      case 'info': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return 'check-circle';
      case 'error': return 'alert-circle';
      case 'warning': return 'alert-triangle';
      case 'info': return 'info';
      default: return 'bell';
    }
  };

  return (
    <Animated.View
      style={[
        styles.toastWrapper,
        {
          transform: [{ translateX: slideAnim }],
          top: TOAST_MARGIN + index * (TOAST_HEIGHT + TOAST_MARGIN),
        },
      ]}
    >
      <View
        style={[
          styles.toast,
          { backgroundColor: getBackgroundColor() },
        ]}
      >
        <Feather name={getIcon() as any} size={20} color="#FFFFFF" style={styles.icon} />
        <Text style={styles.message} numberOfLines={2}>
          {toast.message}
        </Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Feather name="x" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: TOAST_MARGIN,
    right: TOAST_MARGIN,
    zIndex: 9999,
    pointerEvents: 'box-none',
  },
  toastWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  closeButton: {
    marginLeft: 12,
    padding: 4,
  },
});
