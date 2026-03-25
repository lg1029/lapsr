import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { searchDeviceByName, searchDevicesByUser, getAllDevices } from '../api/devices';
import { useDeviceStore } from '../store/deviceStore';
import { Device } from '../types/device';
import DeviceListItem from '../components/DeviceListItem';
import ErrorBanner from '../components/ErrorBanner';
import { DevicesStackParamList } from '../navigation/MainTabNavigator';

type NavProp = NativeStackNavigationProp<DevicesStackParamList, 'DevicesList'>;

export default function DevicesScreen() {
  const navigation = useNavigation<NavProp>();
  const {
    searchQuery,
    searchResults,
    allDevices,
    isLoading,
    error,
    setSearchQuery,
    setSearchResults,
    setAllDevices,
    setSelectedDevice,
    addRecentDevice,
    setLoading,
    setError,
  } = useDeviceStore();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [allDevicesLoading, setAllDevicesLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  function loadAllDevices(isRefresh = false) {
    isRefresh ? setRefreshing(true) : setAllDevicesLoading(true);
    getAllDevices()
      .then(setAllDevices)
      .catch(() => setError('Failed to load devices.'))
      .finally(() => isRefresh ? setRefreshing(false) : setAllDevicesLoading(false));
  }

  // Load all devices on mount
  useEffect(() => { loadAllDevices(); }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const query = searchQuery.trim();
        const [byName, byUser] = await Promise.allSettled([
          searchDeviceByName(query),
          searchDevicesByUser(query),
        ]);

        const nameResults = byName.status === 'fulfilled' ? byName.value : [];
        const userResults = byUser.status === 'fulfilled' ? byUser.value : [];

        // Merge, preferring byName entries (they include expanded owners)
        const seen = new Set<string>(nameResults.map((d) => d.id));
        const merged = [
          ...nameResults,
          ...userResults.filter((d) => !seen.has(d.id)),
        ];
        setSearchResults(merged);
      } catch {
        setError('Search failed. Check your connection and try again.');
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  function handleSelectDevice(device: Device) {
    setSelectedDevice(device);
    addRecentDevice(device);
    navigation.navigate('Laps');
  }

  const isSearching = searchQuery.trim().length >= 2;
  const listData = isSearching ? searchResults : allDevices;
  const showLoading = isSearching ? isLoading : allDevicesLoading;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Devices</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputRow}>
          <Ionicons name="search" size={17} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by device or user..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={17} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {error && <ErrorBanner message={error} />}

      {showLoading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#0078D4" />
        </View>
      )}

      <FlatList
        data={listData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <DeviceListItem device={item} onPress={handleSelectDevice} />
        )}
        refreshControl={
          !isSearching ? (
            <RefreshControl refreshing={refreshing} onRefresh={() => loadAllDevices(true)} tintColor="#0078D4" />
          ) : undefined
        }
        ListEmptyComponent={
          !showLoading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {isSearching ? 'No devices found.' : 'No devices in this tenant.'}
              </Text>
            </View>
          ) : null
        }
        keyboardShouldPersistTaps="handled"
      />
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E8EDF2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111',
  },
  loadingRow: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  emptyState: {
    paddingTop: 48,
    alignItems: 'center',
  },
  emptyText: {
    color: '#AAA',
    fontSize: 15,
  },
});
