import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getMsalInstance } from '../auth/msalInstance';
import { GRAPH_SCOPES } from '../auth/msalConfig';
import { useAuthStore } from '../store/authStore';
import ErrorBanner from '../components/ErrorBanner';
import LoadingOverlay from '../components/LoadingOverlay';
import Logo from '../components/Logo';
import logger from '../utils/logger';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [termsVisible, setTermsVisible] = useState(false);
  const { setAuthenticated } = useAuthStore();

  async function handleSignIn() {
    setLoading(true);
    setError(null);
    try {
      const instance = await getMsalInstance();
      const result = await instance.acquireToken({ scopes: GRAPH_SCOPES });
      setAuthenticated(result.account.username ?? result.account.identifier);
    } catch (e: any) {
      logger.error('MSAL auth error:', e?.errorCode);
      if (e?.message?.includes('cancel') || e?.message?.includes('Cancel')) {
        // User dismissed — not an error
      } else {
        setError('Sign in failed. Please try again.');
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

        <Text style={styles.termsNote}>
          By signing in you agree to our{' '}
          <Text style={styles.termsLink} onPress={() => setTermsVisible(true)}>
            Terms of Service
          </Text>
        </Text>
      </View>

      <Modal visible={termsVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Terms of Service</Text>
            <TouchableOpacity onPress={() => setTermsVisible(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={24} color="#111" />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            {[
              ['1. Acceptance of Terms', 'By downloading, installing, or using LAPSr ("the App"), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the App.'],
              ['2. Description of Service', 'LAPSr provides a secure interface for authorised IT administrators to retrieve LAPS credentials and BitLocker recovery keys from their organisation\'s Microsoft Entra ID tenant via the Microsoft Graph API.\n\nThe App does not operate any servers, does not store credentials, and does not transmit any data to the developer.'],
              ['3. User Responsibilities', 'You are solely responsible for:\n\n• Configuring your Entra ID app registration and permissions\n• Ensuring only authorised personnel have the Cloud Device Administrator role\n• Implementing appropriate Conditional Access, MFA, and PIM controls\n• Complying with all applicable laws and your organisation\'s security policies\n• Maintaining the physical security of the device running the App'],
              ['4. Account and Access Security — Customer Responsibility', 'The developer is not liable for breaches resulting from:\n\n• No MFA on accounts used with the App\n• Use of Global Administrator or overprivileged accounts instead of least-privilege roles\n• Absence of Conditional Access policies\n• Permanently assigned privileged roles (no PIM)\n• Failure to revoke access when personnel leave\n\nUse of overprivileged accounts is done entirely at the organisation\'s own risk. The developer expressly disclaims all liability for exposure resulting from insufficient account security controls.'],
              ['5. Device Security — Customer Responsibility', 'The developer is not liable for credential exposure arising from:\n\n• No device PIN, password, or biometric lock\n• Use on a shared or unmanaged device\n• Device loss or theft\n• Shoulder surfing or screen observation\n• Screen recording or sharing while credentials are visible\n• Malicious apps on the same device\n\nThe App includes biometric re-auth, background lock, session timeout, and a privacy overlay. These reduce risk but cannot guarantee protection against all physical access scenarios.'],
              ['6. Scope of Developer\'s Responsibility', 'The developer\'s responsibility is limited to the App itself. Outside the developer\'s control and liability:\n\n• Microsoft\'s infrastructure, Graph API, or MSAL library\n• Your Entra ID tenant configuration, permissions, and Conditional Access policies\n• Microsoft service outages or security incidents\n• iOS vulnerabilities or zero-day exploits\n• Actions by users with access to a signed-in device\n\nIndustry-standard security measures are implemented within the App. Their presence does not constitute a warranty of security.'],
              ['7. No Data Collection', 'The developer does not collect, receive, store, or have access to any data entered into or retrieved by the App, including credentials, device names, or tenant information. All data remains between your device and Microsoft\'s infrastructure.'],
              ['8. Disclaimer of Warranties', 'THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. The developer makes no warranty regarding the App\'s security, accuracy, or fitness for a particular purpose.'],
              ['9. Limitation of Liability', 'TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE DEVELOPER SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES ARISING FROM YOUR USE OF THE APP. Total liability shall not exceed the amount you paid for the App.'],
              ['10. Indemnification', 'You agree to indemnify the developer against claims arising from your use of the App, use of overprivileged accounts, failure to enforce MFA or Conditional Access, misconfiguration of your Entra ID environment, or your violation of these Terms.'],
              ['11. Third-Party Services', 'The App relies on Microsoft Graph API and MSAL. Your use of those services is governed by Microsoft\'s own Terms of Service. The developer is not responsible for the availability or security of Microsoft\'s services.'],
              ['12. Changes to Terms', 'The developer may update these Terms at any time. Continued use of the App after changes are posted constitutes acceptance of the revised Terms.'],
            ].map(([title, body]) => (
              <View key={title} style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>{title}</Text>
                <Text style={styles.modalBody}>{body}</Text>
              </View>
            ))}
            <Text style={styles.modalFooter}>Questions? Contact us through the App Store listing.</Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
    marginBottom: 16,
  },
  termsNote: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  termsLink: {
    color: '#0078D4',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  modalContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8EDF2',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111' },
  modalContent: { padding: 20, paddingBottom: 48 },
  modalSection: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  modalSectionTitle: { fontSize: 14, fontWeight: '700', color: '#111', marginBottom: 8 },
  modalBody: { fontSize: 14, color: '#374151', lineHeight: 22 },
  modalFooter: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 8 },
});
