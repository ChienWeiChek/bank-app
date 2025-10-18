import { useAuthStore } from '@/store/auth';
import { BiometricAuth } from '@/utils/biometricAuth';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const BiometricSetupScreen = () => {
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string>('Biometric');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setBiometricEnabled } = useAuthStore();

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const available = await BiometricAuth.isBiometricAvailable();
      setIsBiometricAvailable(available);

      if (available) {
        const types = await BiometricAuth.getAvailableBiometricTypes();
        const typeName = BiometricAuth.getBiometricTypeName(types);
        setBiometricType(typeName);
      }
    } catch (error) {
      console.error('Error checking biometric availability:', error);
    }
  };

  const handleEnableBiometric = async () => {
    if (!isBiometricAvailable) {
      Alert.alert(
        'Biometric Unavailable',
        'Biometric authentication is not available on this device. You can enable it later in settings.'
      );
      return;
    }

    setLoading(true);
    try {
      const result = await BiometricAuth.authenticate(
        `Enable ${biometricType} for faster login`
      );

      if (result.success) {
        // Save biometric preference
        await BiometricAuth.setBiometricPreference(true);
        setBiometricEnabled(true);
        
        // Navigate to tabs
        router.replace('/(tabs)');
      } else {
        Alert.alert(
          'Setup Failed',
          result.message || 'Failed to enable biometric authentication. Please try again.'
        );
      }
    } catch (error) {
      console.error('Error enabling biometric:', error);
      Alert.alert(
        'Error',
        'An error occurred while setting up biometric authentication.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    // Set biometric preference to false
    await BiometricAuth.setBiometricPreference(false);
    setBiometricEnabled(false);
    
    // Navigate to tabs
    router.replace('/(tabs)');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Secure Your Account</Text>
          <Text style={styles.subtitle}>
            Enable {biometricType} for faster and more secure access to your account
          </Text>
        </View>

        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>🔒</Text>
          </View>
        </View>

        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>⚡</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Fast Login</Text>
              <Text style={styles.featureDescription}>
                Access your account instantly with {biometricType}
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🛡️</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>Enhanced Security</Text>
              <Text style={styles.featureDescription}>
                Your biometric data stays on your device and is never shared
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🔑</Text>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>No Passwords</Text>
              <Text style={styles.featureDescription}>
                No need to remember complex passwords
              </Text>
            </View>
          </View>
        </View>

        {!isBiometricAvailable && (
          <View style={styles.warningContainer}>
            <Text style={styles.warningText}>
              Biometric authentication is not available on this device. You can enable it later in settings if you set it up on your device.
            </Text>
          </View>
        )}

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              (!isBiometricAvailable || loading) && styles.primaryButtonDisabled,
            ]}
            onPress={handleEnableBiometric}
            disabled={!isBiometricAvailable || loading}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? 'Setting Up...' : `Enable ${biometricType}`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleSkip}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>
              Skip for Now
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            You can always enable or disable biometric authentication in the app settings.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0100e7',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0100e7',
  },
  icon: {
    fontSize: 48,
  },
  features: {
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
    marginTop: 2,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  warningContainer: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    marginBottom: 24,
  },
  warningText: {
    color: '#856404',
    fontSize: 14,
    lineHeight: 20,
  },
  buttonsContainer: {
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#0100e7',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#0100e7',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonDisabled: {
    backgroundColor: '#b3b3b3',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  secondaryButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    color: '#999999',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default BiometricSetupScreen;
