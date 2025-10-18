import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

export interface BiometricAuthResult {
  success: boolean;
  error?: string;
  message?: string;
}

export class BiometricAuth {
  /**
   * Check if biometric authentication is available on the device
   */
  static async isBiometricAvailable(): Promise<boolean> {
    try {
      // Check if LocalAuthentication is properly initialized
      if (!LocalAuthentication || typeof LocalAuthentication.hasHardwareAsync !== 'function') {
        console.warn('LocalAuthentication module not properly initialized');
        return false;
      }

      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      // Ensure we're returning proper boolean values
      return Boolean(hasHardware && isEnrolled);
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return false;
    }
  }

  /**
   * Get available biometric authentication types
   */
  static async getAvailableBiometricTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
    try {
      return await LocalAuthentication.supportedAuthenticationTypesAsync();
    } catch (error) {
      console.error('Error getting biometric types:', error);
      return [];
    }
  }

  /**
   * Authenticate using biometrics
   */
  static async authenticate(
    promptMessage: string = 'Authenticate to access your account'
  ): Promise<BiometricAuthResult> {
    try {
      const isAvailable = await this.isBiometricAvailable();
      
      if (!isAvailable) {
        return {
          success: false,
          error: 'BIOMETRIC_UNAVAILABLE',
          message: 'Biometric authentication is not available on this device'
        };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage,
        fallbackLabel: 'Use Passcode',
        disableDeviceFallback: false,
      });

      if (result.success) {
        return {
          success: true,
          message: 'Authentication successful'
        };
      } else {
        return {
          success: false,
          error: 'AUTHENTICATION_FAILED',
          message: result.error || 'Authentication failed'
        };
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return {
        success: false,
        error: 'AUTHENTICATION_ERROR',
        message: 'An error occurred during authentication'
      };
    }
  }

  /**
   * Store biometric preference securely
   */
  static async setBiometricPreference(enabled: boolean): Promise<void> {
    try {
      await SecureStore.setItemAsync('biometric_enabled', enabled.toString());
    } catch (error) {
      console.error('Error storing biometric preference:', error);
      throw new Error('Failed to save biometric preference');
    }
  }

  /**
   * Get biometric preference
   */
  static async getBiometricPreference(): Promise<boolean> {
    try {
      const value = await SecureStore.getItemAsync('biometric_enabled');
      return value === 'true';
    } catch (error) {
      console.error('Error retrieving biometric preference:', error);
      return false;
    }
  }

  /**
   * Check if biometric authentication should be used
   */
  static async shouldUseBiometric(): Promise<boolean> {
    try {
      const isAvailable = await this.isBiometricAvailable();
      const isEnabled = await this.getBiometricPreference();
      return isAvailable && isEnabled;
    } catch (error) {
      console.error('Error checking biometric usage:', error);
      return false;
    }
  }

  /**
   * Get biometric type name for display
   */
  static getBiometricTypeName(types: LocalAuthentication.AuthenticationType[]): string {
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'Face ID';
    } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Touch ID';
    } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'Iris Scanner';
    } else {
      return 'Biometric';
    }
  }
}
