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

import { getAllUsers, searchUsers, User } from '../api/users';
import ErrorBanner from '../components/ErrorBanner';
import BrandMark from '../components/BrandMark';
import { UsersStackParamList } from '../navigation/MainTabNavigator';
import logger from '../utils/logger';
import { useIsTablet, MAX_CONTENT_WIDTH } from '../utils/responsive';

type NavProp = NativeStackNavigationProp<UsersStackParamList, 'UsersList'>;

export default function UsersScreen() {
  const navigation = useNavigation<NavProp>();
  const isTablet = useIsTablet();
  const [query, setQuery] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [allLoading, setAllLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function loadAllUsers(isRefresh = false) {
    isRefresh ? setRefreshing(true) : setAllLoading(true);
    setError(null);
    getAllUsers()
      .then(setAllUsers)
      .catch((e) => {
        logger.error('getAllUsers error:', e);
        setError('Failed to load users. Please try again.');
      })
      .finally(() => isRefresh ? setRefreshing(false) : setAllLoading(false));
  }

  useEffect(() => { loadAllUsers(); }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearchLoading(true);
      setError(null);
      try {
        const results = await searchUsers(query.trim());
        setSearchResults(results);
      } catch (e) {
        logger.error('searchUsers error:', e);
        setError('Search failed. Please check your connection and try again.');
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const isSearching = query.trim().length >= 2;
  const listData = isSearching ? searchResults : allUsers;
  const showLoading = isSearching ? searchLoading : allLoading;

  function handleSelectUser(user: User) {
    navigation.navigate('UserDevices', { userId: user.id, userName: user.displayName, userPrincipalName: user.userPrincipalName });
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <BrandMark />
      </View>

      <View style={styles.contentArea}>
        <View style={[styles.inner, isTablet && styles.innerTablet]}>
          <View style={styles.searchContainer}>
            <View style={styles.searchInputRow}>
              <Ionicons name="search" size={17} color="#9CA3AF" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search users..."
                placeholderTextColor="#9CA3AF"
                value={query}
                onChangeText={setQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
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
              <TouchableOpacity style={styles.row} onPress={() => handleSelectUser(item)} activeOpacity={0.7}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={18} color="#0078D4" />
                </View>
                <View style={styles.info}>
                  <Text style={styles.name} numberOfLines={1}>{item.displayName}</Text>
                  <Text style={styles.upn} numberOfLines={1}>{item.userPrincipalName}</Text>
                  {item.jobTitle ? (
                    <Text style={styles.sub} numberOfLines={1}>{item.jobTitle}{item.department ? ` · ${item.department}` : ''}</Text>
                  ) : null}
                </View>
                <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
              </TouchableOpacity>
            )}
            refreshControl={
              !isSearching ? (
                <RefreshControl refreshing={refreshing} onRefresh={() => loadAllUsers(true)} tintColor="#0078D4" />
              ) : undefined
            }
            ListEmptyComponent={
              !showLoading ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>
                    {isSearching ? 'No users found.' : 'No users in this tenant.'}
                  </Text>
                </View>
              ) : null
            }
            keyboardShouldPersistTaps="handled"
          />
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
  contentArea: { flex: 1, backgroundColor: '#F5F7FA' },
  inner: { flex: 1 },
  innerTablet: { maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', width: '100%' },
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
  searchInput: { flex: 1, fontSize: 15, color: '#111' },
  loadingRow: { paddingVertical: 8, alignItems: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 64,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8EDF2',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EBF5FB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: '#111' },
  upn: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  sub: { fontSize: 12, color: '#9CA3AF', marginTop: 1 },
  emptyState: { paddingTop: 48, alignItems: 'center' },
  emptyText: { color: '#AAA', fontSize: 15 },
});
