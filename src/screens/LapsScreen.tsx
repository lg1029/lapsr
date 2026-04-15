import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useNavigation, StackActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { getLapsPassword } from '../api/laps';
import { getDeviceById } from '../api/devices';
import { getBitLockerKeys, BitLockerKey } from '../api/bitlocker';
import { useDeviceStore } from '../store/deviceStore';
import { Device, LapsCredential } from '../types/device';
import LapsPasswordCard from '../components/LapsPasswordCard';
import BitLockerKeyCard from '../components/BitLockerKeyCard';
import ErrorBanner from '../components/ErrorBanner';
import BrandMark from '../components/BrandMark';
import logger from '../utils/logger';
import { useIsTablet, MAX_CONTENT_WIDTH } from '../utils/responsive';

function trustTypeLabel(trustType?: string) {
  if (!trustType) return null;
  if (trustType === 'AzureAd') return 'Azure AD Joined';
  if (trustType === 'Workplace') return 'Azure AD Registered';
  if (trustType === 'ServerAd') return 'Hybrid Azure AD Joined';
  return trustType;
}

interface DetailRowProps {
  label: string;
  value: string;
  iconName: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap;
}

function DetailRow({ label, value, iconName }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIconWrap}>
        <Ionicons name={iconName} size={15} color="#0078D4" />
      </View>
      <View style={styles.detailText}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function LapsScreen() {
  const navigation = useNavigation();
  const isTablet = useIsTablet();
  const { selectedDevice, setSelectedDevice, clearDevice } = useDeviceStore();

  const [device, setDevice] = useState<Device | null>(selectedDevice);
  const [lapsCredential, setLapsCredential] = useState<LapsCredential | null>(null);
  const [bitLockerKeys, setBitLockerKeys] = useState<BitLockerKey[] | null>(null);
  const [bitLockerError, setBitLockerError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchAll(dev: Device) {
    setError(null);
    try {
      const [details, cred, blKeys] = await Promise.allSettled([
        getDeviceById(dev.id),
        getLapsPassword(dev.deviceId),
        getBitLockerKeys(dev.deviceId),
      ]);
      if (details.status === 'fulfilled') {
        const merged = { ...dev, ...details.value };
        setDevice(merged);
        setSelectedDevice(merged);
      }
      if (cred.status === 'fulfilled') {
        setLapsCredential(cred.value);
      } else {
        logger.error('LAPS fetch error:', cred.reason);
        setError(cred.reason?.message === 'No LAPS password configured for this device.'
          ? 'No LAPS password configured for this device.'
          : 'Failed to retrieve LAPS password. Please try again.');
      }
      if (blKeys.status === 'fulfilled') {
        setBitLockerKeys(blKeys.value);
      } else {
        logger.error('BitLocker fetch error:', blKeys.reason);
        setBitLockerError('Failed to retrieve BitLocker keys. Please try again.');
      }
    } catch (e: any) {
      logger.error('LapsScreen fetchAll error:', e);
      setError('Something went wrong. Please try again.');
    }
  }

  useEffect(() => {
    if (!selectedDevice) return;
    fetchAll(selectedDevice);
    return () => {
      // Clear credentials from memory when leaving the screen
      setLapsCredential(null);
      setBitLockerKeys(null);
      clearDevice();
    };
  }, []);

  const onRefresh = useCallback(async () => {
    if (!device) return;
    setRefreshing(true);
    setLapsCredential(null);
    setBitLockerKeys(null);
    setBitLockerError(null);
    await fetchAll(device);
    setRefreshing(false);
  }, [device]);

  const lastSeen = device?.approximateLastSignInDateTime
    ? new Date(device.approximateLastSignInDateTime).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
      })
    : null;

  const ownerName = device?.registeredOwners?.[0]?.displayName;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.dispatch(StackActions.pop())} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerBrand}>
          <BrandMark />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, isTablet && styles.contentTablet]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#0078D4"
          />
        }
      >
        {/* Device title */}
        <View style={styles.titleSection}>
          <View style={styles.deviceIcon}>
            <Ionicons name="laptop-outline" size={28} color="#0078D4" />
          </View>
          <Text style={styles.deviceName}>{device?.displayName}</Text>
          {ownerName && (
            <View style={styles.ownerRow}>
              <Ionicons name="person-outline" size={13} color="#6B7280" />
              <Text style={styles.ownerName}>{ownerName}</Text>
            </View>
          )}
        </View>

        {/* Detail card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Device Info</Text>

          {device?.operatingSystem && (
            <DetailRow
              iconName="desktop-outline"
              label="Operating System"
              value={`${device.operatingSystem}${device.operatingSystemVersion ? ` ${device.operatingSystemVersion}` : ''}`}
            />
          )}
          {trustTypeLabel(device?.trustType) && (
            <DetailRow
              iconName="cloud-outline"
              label="Join Type"
              value={trustTypeLabel(device?.trustType)!}
            />
          )}
          {device?.isCompliant !== undefined && (
            <DetailRow
              iconName={device.isCompliant ? 'checkmark-circle-outline' : 'close-circle-outline'}
              label="Compliance"
              value={device.isCompliant ? 'Compliant' : 'Not Compliant'}
            />
          )}
          {device?.isManaged !== undefined && (
            <DetailRow
              iconName="shield-checkmark-outline"
              label="Managed"
              value={device.isManaged ? 'Yes' : 'No'}
            />
          )}
          {(device?.manufacturer || device?.model) && (
            <DetailRow
              iconName="hardware-chip-outline"
              label="Hardware"
              value={[device.manufacturer, device.model].filter(Boolean).join(' ')}
            />
          )}
          {lastSeen && (
            <DetailRow
              iconName="time-outline"
              label="Last Sign-In"
              value={lastSeen}
            />
          )}
        </View>

        {error && <ErrorBanner message={error} />}

        {lapsCredential && <LapsPasswordCard credential={lapsCredential} />}

        {bitLockerKeys && bitLockerKeys.length > 0 && (
          <BitLockerKeyCard keys={bitLockerKeys} />
        )}
        {bitLockerKeys && bitLockerKeys.length === 0 && (
          <View style={styles.noKeys}>
            <Text style={styles.noKeysText}>No BitLocker keys found for this device.</Text>
          </View>
        )}
        {bitLockerError && (
          <View style={styles.noKeys}>
            <Text style={styles.noKeysText}>BitLocker: {bitLockerError}</Text>
          </View>
        )}

        {!lapsCredential && !error && !refreshing && (
          <View style={styles.lapsLoading}>
            <Text style={styles.lapsLoadingText}>Loading credentials…</Text>
          </View>
        )}
      </ScrollView>
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
  content: { backgroundColor: '#F5F7FA', paddingBottom: 48 },
  contentTablet: { maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center', width: '100%' },
  titleSection: {
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 20,
    paddingHorizontal: 24,
  },
  deviceIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#EBF5FB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  deviceName: { fontSize: 22, fontWeight: '800', color: '#111', textAlign: 'center' },
  ownerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 },
  ownerName: { fontSize: 13, color: '#6B7280' },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 14,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#F0F4F8',
  },
  detailIconWrap: {
    width: 28,
    alignItems: 'center',
    marginRight: 12,
  },
  detailText: { flex: 1 },
  detailLabel: { fontSize: 12, color: '#9CA3AF', marginBottom: 2 },
  detailValue: { fontSize: 14, fontWeight: '600', color: '#111' },
  lapsLoading: { alignItems: 'center', paddingTop: 24 },
  lapsLoadingText: { color: '#9CA3AF', fontSize: 14 },
  noKeys: { paddingHorizontal: 16, paddingTop: 12 },
  noKeysText: { color: '#9CA3AF', fontSize: 13 },
});
