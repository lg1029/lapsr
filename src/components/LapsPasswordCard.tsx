import React, { useState } from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { LapsCredential } from '../types/device';

interface Props {
  credential: LapsCredential;
}

export default function LapsPasswordCard({ credential }: Props) {
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const password = atob(credential.passwordBase64);
  const displayPassword = revealed ? password : '••••••••••••';
  const backupDate = new Date(credential.backupDateTime).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });

  async function handleCopy() {
    await Clipboard.setStringAsync(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <View style={styles.card}>
      <Text style={styles.label}>LAPS Password</Text>

      <TouchableOpacity onPress={() => setRevealed((r) => !r)} style={styles.passwordRow}>
        <Text style={styles.password}>{displayPassword}</Text>
        <Text style={styles.revealBtn}>{revealed ? 'Hide' : 'Reveal'}</Text>
      </TouchableOpacity>

      <Text style={styles.timestamp}>Backed up {backupDate}</Text>

      <TouchableOpacity style={styles.copyBtn} onPress={handleCopy} activeOpacity={0.8}>
        <Text style={styles.copyText}>{copied ? '✓ Copied!' : 'Copy Password'}</Text>
      </TouchableOpacity>
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
    marginBottom: 12,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  password: {
    fontSize: 26,
    fontFamily: 'Courier',
    fontWeight: '700',
    color: '#111',
    letterSpacing: 1.5,
    flex: 1,
  },
  revealBtn: {
    fontSize: 14,
    color: '#0078D4',
    fontWeight: '600',
    marginLeft: 12,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginBottom: 20,
  },
  copyBtn: {
    backgroundColor: '#0078D4',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  copyText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
