import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { getUserDevices } from '../api/users';
import { useDeviceStore } from '../store/deviceStore';
import { Device } from '../types/device';
import DeviceListItem from '../components/DeviceListItem';
import ErrorBanner from '../components/ErrorBanner';
import BrandMark from '../components/BrandMark';
import { UsersStackParamList } from '../navigation/MainTabNavigator';

type Props = NativeStackScreenProps<UsersStackParamList, 'UserDevices'>;
type NavProp = NativeStackNavigationProp<UsersStackParamList, 'UserDevices'>;

export default function UserDevicesScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<Props['route']>();
  const { userId, userName, userPrincipalName } = route.params;

  const { setSelectedDevice, addRecentDevice } = useDeviceStore();

  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadDevices(isRefresh = false) {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError(null);
    getUserDevices(userId, { id: userId, displayName: userName, userPrincipalName })
      .then(setDevices)
      .catch(() => setError('Failed to load devices for this user.'))
      .finally(() => isRefresh ? setRefreshing(false) : setLoading(false));
  }

  useEffect(() => { loadDevices(); }, [userId]);

  const onRefresh = useCallback(() => loadDevices(true), [userId]);

  function handleSelectDevice(device: Device) {
    setSelectedDevice(device);
    addRecentDevice(device);
    navigation.navigate('Laps');
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          <Text style={styles.backText}>Users</Text>
        </TouchableOpacity>
        <View style={styles.headerBrand}>
          <BrandMark />
        </View>
      </View>

      <View style={styles.userInfo}>
        <View style={styles.userAvatar}>
          <Ionicons name="person" size={24} color="#0078D4" />
        </View>
        <View>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userUpn}>{userPrincipalName}</Text>
        </View>
      </View>

      <Text style={styles.sectionLabel}>Devices</Text>

      {error && <ErrorBanner message={error} />}

      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#0078D4" />
        </View>
      )}

      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DeviceListItem device={item} onPress={handleSelectDevice} />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0078D4" />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No devices registered to this user.</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0078D4' },
  header: {
    backgroundColor: '#0078D4',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: { flexDirection: 'row', alignItems: 'center' },
  backText: { fontSize: 17, color: '#FFFFFF', fontWeight: '600', marginLeft: 2 },
  headerBrand: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#F5F7FA',
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EBF5FB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  userName: { fontSize: 20, fontWeight: '800', color: '#111' },
  userUpn: { fontSize: 13, color: '#9CA3AF', marginTop: 2 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: '#F5F7FA',
  },
  loadingRow: { paddingVertical: 8, alignItems: 'center' },
  emptyState: { paddingTop: 48, alignItems: 'center' },
  emptyText: { color: '#AAA', fontSize: 15 },
});
