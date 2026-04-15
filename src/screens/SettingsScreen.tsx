import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { signOut } from '../auth/authHelpers';
import { useAuthStore } from '../store/authStore';
import { useDeviceStore } from '../store/deviceStore';
import BrandMark from '../components/BrandMark';
import { SettingsStackParamList } from '../navigation/MainTabNavigator';
import { useIsTablet, MAX_CONTENT_WIDTH } from '../utils/responsive';

type NavProp = NativeStackNavigationProp<SettingsStackParamList, 'SettingsList'>;

export default function SettingsScreen() {
  const navigation = useNavigation<NavProp>();
  const isTablet = useIsTablet();
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
        <BrandMark />
      </View>

      <View style={[styles.body, isTablet && styles.bodyTablet]}>
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

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Legal</Text>
          <TouchableOpacity style={styles.legalRow} onPress={() => navigation.navigate('Terms')} activeOpacity={0.7}>
            <Ionicons name="document-text-outline" size={18} color="#0078D4" style={styles.legalIcon} />
            <Text style={styles.legalText}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
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
    alignItems: 'center',
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  bodyTablet: {
    maxWidth: MAX_CONTENT_WIDTH,
    alignSelf: 'center',
    width: '100%',
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
  legalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E8EDF2',
  },
  legalIcon: { marginRight: 12 },
  legalText: { flex: 1, fontSize: 16, fontWeight: '600', color: '#111' },
});
