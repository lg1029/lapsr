import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { useDeviceStore } from '../store/deviceStore';
import { useAuthStore } from '../store/authStore';
import { Device } from '../types/device';
import BrandMark from '../components/BrandMark';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { recentDevices, setSelectedDevice, addRecentDevice } = useDeviceStore();
  const { username } = useAuthStore();

  const displayName = username?.split('@')[0] ?? 'there';

  function handleSelectDevice(device: Device) {
    setSelectedDevice(device);
    addRecentDevice(device);
    navigation.navigate('Devices', { screen: 'Laps' });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BrandMark />
        <Text style={styles.greeting}>Hello, {displayName}</Text>
        <Text style={styles.subtitle}>Look up a LAPS password</Text>
      </View>

      <View style={styles.body}>
        <TouchableOpacity
          style={styles.searchCta}
          onPress={() => navigation.navigate('Devices')}
          activeOpacity={0.85}
        >
          <Ionicons name="search" size={20} color="#FFFFFF" style={{ marginRight: 10 }} />
          <Text style={styles.searchCtaText}>Search Devices</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Recent Lookups</Text>

        {recentDevices.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={40} color="#D1D5DB" />
            <Text style={styles.emptyText}>No recent lookups yet.</Text>
            <Text style={styles.emptySubtext}>Devices you look up will appear here.</Text>
          </View>
        ) : (
          <FlatList
            data={recentDevices}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.recentCard} onPress={() => handleSelectDevice(item)} activeOpacity={0.7}>
                <View style={styles.recentIconWrap}>
                  <Ionicons name="laptop-outline" size={20} color="#0078D4" />
                </View>
                <View style={styles.recentInfo}>
                  <Text style={styles.recentName}>{item.displayName}</Text>
                  <Text style={styles.recentOs}>{item.operatingSystem ?? 'Unknown OS'}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
              </TouchableOpacity>
            )}
            scrollEnabled={false}
          />
        )}
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
    paddingBottom: 28,
    alignItems: 'center',
  },
  greeting: { fontSize: 26, fontWeight: '800', color: '#FFFFFF', marginTop: 12 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  searchCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0062B0',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 28,
    shadowColor: '#0078D4',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  searchCtaText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 32,
    gap: 8,
  },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#9CA3AF', marginTop: 4 },
  emptySubtext: { fontSize: 13, color: '#C4C9D4' },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E8EDF2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  recentIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EBF5FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recentInfo: { flex: 1 },
  recentName: { fontSize: 15, fontWeight: '700', color: '#111' },
  recentOs: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
});
