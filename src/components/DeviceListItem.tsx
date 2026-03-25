import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Device } from '../types/device';

interface Props {
  device: Device;
  onPress: (device: Device) => void;
}

export default function DeviceListItem({ device, onPress }: Props) {
  const lastSeen = device.approximateLastSignInDateTime
    ? new Date(device.approximateLastSignInDateTime).toLocaleDateString()
    : null;

  const ownerName = device.registeredOwners?.[0]?.displayName ?? null;

  return (
    <TouchableOpacity style={styles.row} onPress={() => onPress(device)} activeOpacity={0.7}>
      <View style={styles.icon}>
        <Ionicons name="laptop-outline" size={20} color="#0078D4" />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{device.displayName}</Text>
        <Text style={styles.sub} numberOfLines={1}>
          {device.operatingSystem ?? 'Unknown OS'}{lastSeen ? ` · ${lastSeen}` : ''}
        </Text>
        {ownerName && (
          <View style={styles.ownerRow}>
            <Ionicons name="person-outline" size={11} color="#6B7280" style={styles.ownerIcon} />
            <Text style={styles.owner} numberOfLines={1}>{ownerName}</Text>
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
  icon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#EBF5FB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', color: '#111' },
  sub: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  ownerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  ownerIcon: { marginRight: 3 },
  owner: { fontSize: 12, color: '#6B7280' },
});
