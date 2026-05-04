import { theme } from '@/config/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface QRCodeScannerProps {
  onScanSuccess: (data: string) => void;
  onClose: () => void;
}

export function QRCodeScanner({ onScanSuccess, onClose }: QRCodeScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (!permission?.granted) {
        await requestPermission();
      }
    })();
  }, [permission, requestPermission]);

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (scanned || loading) return;
    
    setScanned(true);
    setLoading(true);

    // Extract classroom code from QR data
    // Assuming QR code contains format: "classroom:<code>" or just the code
    const classroomCode = data.includes(':') ? data.split(':')[1] : data;
    
    // Validate that it's a 6-character code
    if (classroomCode && /^[A-Z0-9]{6}$/.test(classroomCode.toUpperCase())) {
      onScanSuccess(classroomCode.toUpperCase());
    } else {
      // Invalid QR code format
      setScanned(false);
      setLoading(false);
      alert('Invalid QR code. Please scan a valid classroom QR code.');
    }
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.wrenly.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <MaterialIcons name="no-photography" size={64} color={theme.colors.wrenly.textSecondary} />
        <Text style={styles.permissionText}>Camera permission is required to scan QR codes</Text>
        <TouchableOpacity 
          style={styles.permissionButton}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        <View style={styles.overlay}>
          {/* Top bar */}
          <View style={styles.topBar}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
            >
              <MaterialIcons name="close" size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.instructionText}>Scan QR Code</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Scanner frame */}
          <View style={[styles.scannerFrame, { borderColor: theme.colors.wrenly.primary }]} />

          {/* Bottom hint */}
          <View style={styles.bottomContainer}>
            {scanned && (
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => setScanned(false)}
              >
                <Text style={styles.retryButtonText}>Tap to scan again</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.wrenly.background,
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 16,
    color: theme.colors.wrenly.text,
  },
  permissionButton: {
    marginTop: 20,
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: theme.colors.wrenly.primary,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  closeButton: {
    padding: 8,
  },
  instructionText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  bottomContainer: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: theme.colors.wrenly.primary,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
