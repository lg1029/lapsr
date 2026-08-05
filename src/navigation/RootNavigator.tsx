import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, Modal, Text, TouchableOpacity, StyleSheet } from 'react-native';

import * as SecureStore from 'expo-secure-store';
import { getMsalInstance } from '../auth/msalInstance';
import { signOut } from '../auth/authHelpers';
import { SESSION_KEY, SESSION_TIMEOUT_MS } from '../hooks/useAppLock';
import { useAuthStore } from '../store/authStore';
import { isJailbroken } from '../utils/jailbreakDetection';

import LoginScreen from '../screens/LoginScreen';
import MainTabNavigator from './MainTabNavigator';

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const [initializing, setInitializing] = useState(true);
  const [jailbreakWarning, setJailbreakWarning] = useState(false);
  const { isAuthenticated, setAuthenticated } = useAuthStore();

  useEffect(() => {
    async function init() {
      try {
        // Check for jailbreak
        const jb = await isJailbroken();
        if (jb) {
          setJailbreakWarning(true);
        }

        // Restore existing MSAL session, but reject it if 8-hour timeout has elapsed
        const instance = await getMsalInstance();
        const accounts = await instance.getAccounts();
        if (accounts.length > 0) {
          const val = await SecureStore.getItemAsync(SESSION_KEY).catch(() => null);
          const sessionValid = val !== null && Date.now() - parseInt(val, 10) <= SESSION_TIMEOUT_MS;
          if (!sessionValid) {
            // Missing or expired timestamp — fail closed: clear MSAL session and require fresh login
            await signOut().catch(() => {});
            await SecureStore.deleteItemAsync(SESSION_KEY).catch(() => {});
          } else {
            setAuthenticated(accounts[0].username ?? accounts[0].identifier);
          }
        }
      } catch {
        // No existing session
      } finally {
        setInitializing(false);
      }
    }
    init();
  }, []);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0078D4" />
      </View>
    );
  }

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            <Stack.Screen name="Main" component={MainTabNavigator} />
          ) : (
            <Stack.Screen name="Login" component={LoginScreen} />
          )}
        </Stack.Navigator>
      </NavigationContainer>

      <Modal
        visible={jailbreakWarning}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Security Warning</Text>
            <Text style={styles.modalBody}>
              This device appears to be jailbroken. Using LAPSr on a compromised device may
              expose sensitive credentials to other apps or processes on this device.{'\n\n'}
              Proceed only if you understand and accept this risk.
            </Text>
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => setJailbreakWarning(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.modalBtnText}>I Understand, Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 360,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111',
    marginBottom: 12,
  },
  modalBody: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 24,
  },
  modalBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
