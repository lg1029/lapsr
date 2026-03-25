import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';

import { signOut } from '../auth/authHelpers';
import { useAuthStore } from '../store/authStore';
import { useDeviceStore } from '../store/deviceStore';

export default function SettingsScreen() {
  const { username, clearAuth } = useAuthStore();
  const { clearDevice } = useDeviceStore();

  const displayName = username?.split('@')[0] ?? '';
  const initials = displayName.slice(0, 2).toUpperCase();

  async function handleSignOut() {
    await signOut();
    clearAuth();
    clearDevice();
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.accountCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.accountInfo}>
            <Text style={styles.accountName}>{displayName}</Text>
            <Text style={styles.accountEmail}>{username}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Account</Text>
          <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.85}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0078D4' },
  header: {
    backgroundColor: '#0078D4',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  title: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#E8EDF2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0078D4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  accountInfo: { flex: 1 },
  accountName: { fontSize: 17, fontWeight: '700', color: '#111' },
  accountEmail: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  section: {},
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  signOutBtn: {
    backgroundColor: '#FDECEA',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  signOutText: { color: '#B71C1C', fontSize: 16, fontWeight: '700' },
});
