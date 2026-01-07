import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ErrorType } from '../types';

interface ErrorViewProps {
  error: string;
  errorType: ErrorType | null;
  onRetry: () => void;
  onOpenSettings?: () => void;
}

export function ErrorView({
  error,
  errorType,
  onRetry,
  onOpenSettings,
}: ErrorViewProps) {
  const getErrorConfig = () => {
    switch (errorType) {
      case ErrorType.PERMISSION_DENIED:
        return {
          icon: '🔐',
          title: 'Permission Required',
          color: '#F59E0B',
          bgColor: '#FEF3C7',
        };
      case ErrorType.LOCATION_DISABLED:
        return {
          icon: '📍',
          title: 'Location Disabled',
          color: '#EF4444',
          bgColor: '#FEE2E2',
        };
      case ErrorType.LOCATION_UNAVAILABLE:
        return {
          icon: '🛰️',
          title: 'Location Unavailable',
          color: '#8B5CF6',
          bgColor: '#EDE9FE',
        };
      case ErrorType.NETWORK_ERROR:
        return {
          icon: '📡',
          title: 'Connection Error',
          color: '#06B6D4',
          bgColor: '#CFFAFE',
        };
      default:
        return {
          icon: '⚠️',
          title: 'Something Went Wrong',
          color: '#64748B',
          bgColor: '#F1F5F9',
        };
    }
  };

  const config = getErrorConfig();
  const showSettingsButton =
    errorType === ErrorType.PERMISSION_DENIED ||
    errorType === ErrorType.LOCATION_DISABLED;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
          <Text style={styles.icon}>{config.icon}</Text>
        </View>
        
        <Text style={styles.title}>{config.title}</Text>
        <Text style={styles.message}>{error}</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={onRetry}
            activeOpacity={0.8}>
            <Text style={styles.primaryButtonIcon}>↻</Text>
            <Text style={styles.primaryButtonText}>Try Again</Text>
          </TouchableOpacity>
          
          {showSettingsButton && onOpenSettings && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onOpenSettings}
              activeOpacity={0.8}>
              <Text style={styles.secondaryButtonIcon}>⚙️</Text>
              <Text style={styles.secondaryButtonText}>Open Settings</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 32,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 12,
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 44,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 16,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    marginRight: 8,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 16,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  secondaryButtonText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '600',
  },
});
