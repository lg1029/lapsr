import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { getMsalInstance } from '../auth/msalInstance';
import { GRAPH_SCOPES } from '../auth/msalConfig';
import { useAuthStore } from '../store/authStore';
import ErrorBanner from '../components/ErrorBanner';
import LoadingOverlay from '../components/LoadingOverlay';
import Logo from '../components/Logo';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setAuthenticated } = useAuthStore();

  async function handleSignIn() {
    setLoading(true);
    setError(null);
    try {
      const instance = await getMsalInstance();
      const result = await instance.acquireToken({ scopes: GRAPH_SCOPES });
      setAuthenticated(result.account.username ?? result.account.identifier);
    } catch (e: any) {
      console.log('MSAL error:', JSON.stringify(e), e?.message, e?.errorCode);
      if (e?.message?.includes('cancel') || e?.message?.includes('Cancel')) {
        // User dismissed — not an error
      } else {
        setError(e?.message ?? 'Sign in failed.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {loading && <LoadingOverlay />}

      <View style={styles.heroArea}>
        <Logo width={110} height={136} />
        <Text style={styles.appName}>LAPSr</Text>
        <Text style={styles.tagline}>LAPS passwords, right in your pocket.</Text>
      </View>

      <View style={styles.card}>
        {error && <ErrorBanner message={error} />}

        <TouchableOpacity style={styles.signInBtn} onPress={handleSignIn} activeOpacity={0.85}>
          <Text style={styles.signInText}>Sign in with Microsoft</Text>
        </TouchableOpacity>

        <Text style={styles.footnote}>
          Sign in with your work account. You must have the Cloud Device Administrator role
          in the target tenant to retrieve LAPS passwords.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0078D4',
  },
  heroArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  appName: {
    fontSize: 56,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1.5,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 10,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#F5F7FA',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  signInBtn: {
    backgroundColor: '#0078D4',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#0078D4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  signInText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  footnote: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
});
