import React, { useState } from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { LapsCredential } from '../types/device';

interface Props {
  credential: LapsCredential;
}

export default function LapsPasswordCard({ credential }: Props) {
  const [revealed, setRevealed] = useState(false);

  const password = atob(credential.passwordBase64);
  const displayPassword = revealed ? password : '••••••••••••';
  const backupDate = new Date(credential.backupDateTime).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });

  async function handleReveal() {
    if (revealed) {
      setRevealed(false);
      return;
    }
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to reveal LAPS password',
      fallbackLabel: 'Use Passcode',
    });
    if (result.success) {
      setRevealed(true);
    }
  }

  return (
    <View style={styles.card}>
      <Text style={styles.label}>LAPS Password</Text>

      <TouchableOpacity onPress={handleReveal} style={styles.passwordRow}>
        <Text style={styles.password}>{displayPassword}</Text>
        <Text style={styles.revealBtn}>{revealed ? 'Hide' : 'Reveal'}</Text>
      </TouchableOpacity>

      <Text style={styles.timestamp}>Backed up {backupDate}</Text>
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
  },
});
