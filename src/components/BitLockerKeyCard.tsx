import React, { useState } from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';
import { BitLockerKey } from '../api/bitlocker';

interface Props {
  keys: BitLockerKey[];
}

function volumeTypeLabel(type: string) {
  if (type === 'operatingSystemVolume') return 'OS Drive';
  if (type === 'fixedDataVolume') return 'Fixed Data Drive';
  if (type === 'removableDataVolume') return 'Removable Drive';
  if (type === 'unknownFutureValue') return 'Unknown';
  return type;
}

function KeyEntry({ bk }: { bk: BitLockerKey }) {
  const [revealed, setRevealed] = useState(false);

  const displayKey = revealed
    ? (bk.key ?? '—')
    : '••••••-••••••-••••••-••••••-••••••-••••••-••••••-••••••';
  const createdDate = new Date(bk.createdDateTime).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  async function handleReveal() {
    if (revealed) {
      setRevealed(false);
      return;
    }
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to reveal BitLocker recovery key',
      fallbackLabel: 'Use Passcode',
    });
    if (result.success) {
      setRevealed(true);
    }
  }

  return (
    <View style={styles.entry}>
      <View style={styles.entryHeader}>
        <View style={styles.volumeBadge}>
          <Ionicons name="lock-closed-outline" size={12} color="#0078D4" />
          <Text style={styles.volumeText}>{volumeTypeLabel(bk.volumeType)}</Text>
        </View>
        <Text style={styles.entryDate}>Backed up {createdDate}</Text>
      </View>

      <Text style={styles.keyIdLabel}>Key ID</Text>
      <Text style={styles.keyId}>{bk.id}</Text>

      <Text style={styles.keyIdLabel}>Recovery Key</Text>
      <TouchableOpacity onPress={handleReveal} style={styles.keyRow} activeOpacity={0.7}>
        <Text style={styles.keyText} numberOfLines={revealed ? undefined : 1}>{displayKey}</Text>
        <Text style={styles.revealBtn}>{revealed ? 'Hide' : 'Reveal'}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function BitLockerKeyCard({ keys }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>BitLocker Recovery Keys</Text>
      {keys.map((k, i) => (
        <View key={k.id}>
          {i > 0 && <View style={styles.divider} />}
          <KeyEntry bk={k} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  entry: {},
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  volumeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF5FB',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  volumeText: { fontSize: 12, fontWeight: '600', color: '#0078D4' },
  entryDate: { fontSize: 12, color: '#9CA3AF' },
  keyIdLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 10,
    marginBottom: 3,
  },
  keyId: {
    fontSize: 13,
    fontFamily: 'Courier',
    color: '#444',
    marginBottom: 4,
  },
  keyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  keyText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Courier',
    fontWeight: '600',
    color: '#111',
    letterSpacing: 0.5,
  },
  revealBtn: {
    fontSize: 14,
    color: '#0078D4',
    fontWeight: '600',
    marginLeft: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E8EDF2',
    marginVertical: 16,
  },
});
