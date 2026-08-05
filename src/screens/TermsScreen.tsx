import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return <Text style={styles.body}>{children}</Text>;
}

export default function TermsScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.lastUpdated}>Last updated: 2025</Text>

        <Section title="1. Acceptance of Terms">
          <Body>
            By downloading, installing, or using LAPSr ("the App"), you agree to be bound by
            these Terms of Service. If you do not agree to these terms, do not use the App.
            These terms apply to all users of the App, including individuals and organisations.
          </Body>
        </Section>

        <Section title="2. Description of Service">
          <Body>
            LAPSr is a mobile application that provides a secure interface for authorised IT
            administrators to retrieve Local Administrator Password Solution (LAPS) credentials
            and BitLocker recovery keys from their organisation's Microsoft Entra ID (Azure AD)
            tenant via the Microsoft Graph API.{'\n\n'}
            The App does not operate any servers, does not store credentials, and does not
            transmit any data to the developer. All authentication is handled by Microsoft's
            own MSAL library, and all credential data flows directly between Microsoft's
            infrastructure and the user's device.
          </Body>
        </Section>

        <Section title="3. User Responsibilities">
          <Body>
            You are solely responsible for:{'\n\n'}
            • Configuring your organisation's Microsoft Entra ID app registration, including
            assigning the correct API permissions and roles.{'\n\n'}
            • Ensuring that only authorised personnel are granted the Cloud Device Administrator
            role or equivalent permissions required to retrieve LAPS passwords.{'\n\n'}
            • Implementing appropriate Conditional Access policies, Multi-Factor Authentication,
            and Privileged Identity Management controls within your organisation's tenant.{'\n\n'}
            • Complying with all applicable laws, regulations, and your organisation's internal
            security policies when accessing device credentials through the App.{'\n\n'}
            • Maintaining the physical security of the device on which the App is installed.
          </Body>
        </Section>

        <Section title="4. Account and Access Security — Customer Responsibility">
          <Body>
            The App is designed to be used with the Cloud Device Administrator role or
            equivalent least-privilege permissions. The developer is not liable for any
            credential exposure, unauthorised access, or data breach resulting from the
            following, which are solely the user's and organisation's responsibility:{'\n\n'}
            • Multi-Factor Authentication (MFA): All accounts used to access the App must
            be protected by MFA. Using accounts without MFA is done entirely at the
            organisation's own risk.{'\n\n'}
            • Conditional Access Policies: Organisations should enforce device compliance,
            sign-in risk controls, and location restrictions before allowing access to the
            App's underlying API permissions. The developer is not liable for incidents
            arising from the absence of Conditional Access controls.{'\n\n'}
            • Principle of Least Privilege: Use of Global Administrator or other
            overprivileged accounts to access LAPS credentials or BitLocker keys is done
            entirely at the user's and organisation's own risk. The developer expressly
            disclaims all liability for exposure or breaches resulting from overprivileged
            account use.{'\n\n'}
            • Privileged Identity Management (PIM): Organisations should use time-bound,
            just-in-time role activation rather than permanent role assignments. The developer
            is not responsible for incidents arising from permanently assigned privileged roles.{'\n\n'}
            • Access Revocation: Organisations are responsible for promptly revoking access
            when personnel leave or change roles. The developer is not liable for access by
            former employees resulting from failure to revoke permissions.
          </Body>
        </Section>

        <Section title="5. Device Security — Customer Responsibility">
          <Body>
            Users are solely responsible for the security of the device on which the App is
            installed. The developer is not liable for credential exposure arising from:{'\n\n'}
            • Use of the App on a device without a PIN, password, or biometric lock enabled{'\n'}
            • Use on a shared, unmanaged, or personally owned device not secured to
            organisational standards{'\n'}
            • Loss or theft of the device{'\n'}
            • Physical access by unauthorised persons, including shoulder surfing or screen
            observation{'\n'}
            • Screen recording, screen sharing, or screen casting while credentials are visible{'\n'}
            • Malicious or compromised applications installed on the same device{'\n\n'}
            The App includes security measures including biometric re-authentication before
            credential display, a five-minute background lock, an eight-hour session timeout,
            and a privacy overlay preventing credentials from appearing in the iOS app switcher.
            These measures reduce risk but cannot guarantee protection against all physical
            access scenarios.
          </Body>
        </Section>

        <Section title="6. Scope of Developer's Responsibility">
          <Body>
            The developer's responsibility is limited strictly to the App itself. The following
            are entirely outside the developer's control and liability:{'\n\n'}
            • The security, availability, or integrity of Microsoft's infrastructure, Graph
            API, or MSAL authentication library{'\n'}
            • The configuration of your Microsoft Entra ID tenant, including app registrations,
            API permissions, role assignments, and Conditional Access policies{'\n'}
            • Microsoft service outages, Microsoft security incidents, or vulnerabilities in
            Microsoft's own software{'\n'}
            • iOS operating system vulnerabilities or zero-day exploits{'\n'}
            • The security posture of the organisation's broader IT environment{'\n'}
            • Actions taken by authorised or unauthorised users who have obtained access to
            a signed-in device{'\n\n'}
            The developer implements industry-standard security measures within the App and
            maintains documentation of those measures. The presence of these measures does
            not constitute a warranty of security and does not extend the developer's liability
            beyond the scope defined in these Terms.
          </Body>
        </Section>

        <Section title="7. No Data Collection">
          <Body>
            The developer of LAPSr does not collect, receive, store, or have access to any
            data entered into or retrieved by the App, including but not limited to: usernames,
            passwords, device names, BitLocker recovery keys, LAPS credentials, or Microsoft
            tenant information.{'\n\n'}
            All data accessed through the App remains between your device and Microsoft's
            infrastructure at all times.
          </Body>
        </Section>

        <Section title="8. Disclaimer of Warranties">
          <Body>
            THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
            EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF
            MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.{'\n\n'}
            The developer does not warrant that the App will be uninterrupted, error-free,
            secure, or free of viruses or other harmful components. The developer makes no
            warranty regarding the accuracy, reliability, or completeness of any information
            retrieved through the App.
          </Body>
        </Section>

        <Section title="9. Limitation of Liability">
          <Body>
            TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE DEVELOPER SHALL NOT BE
            LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
            INCLUDING BUT NOT LIMITED TO LOSS OF DATA, LOSS OF REVENUE, UNAUTHORISED ACCESS
            TO CREDENTIALS, OR SECURITY BREACHES ARISING FROM OR RELATED TO YOUR USE OF
            THE APP.{'\n\n'}
            THE DEVELOPER'S TOTAL LIABILITY TO YOU FOR ANY CLAIMS ARISING FROM THESE TERMS
            OR YOUR USE OF THE APP SHALL NOT EXCEED THE AMOUNT YOU PAID FOR THE APP IN THE
            TWELVE MONTHS PRECEDING THE CLAIM.
          </Body>
        </Section>

        <Section title="10. Indemnification">
          <Body>
            You agree to indemnify, defend, and hold harmless the developer and its affiliates
            from and against any claims, liabilities, damages, losses, and expenses, including
            reasonable legal fees, arising out of or in any way connected with:{'\n\n'}
            • Your access to or use of the App{'\n'}
            • Your misconfiguration of Microsoft Entra ID, Conditional Access policies, or
            role assignments{'\n'}
            • Your use of overprivileged accounts to access credentials through the App{'\n'}
            • Your failure to enforce MFA, Conditional Access, or access revocation{'\n'}
            • Your violation of these Terms{'\n'}
            • Any breach of security within your organisation's Microsoft tenant
          </Body>
        </Section>

        <Section title="11. Third-Party Services">
          <Body>
            The App relies on Microsoft's Graph API and MSAL authentication library. Your
            use of those services is governed by Microsoft's own Terms of Service and Privacy
            Policy. The developer is not responsible for the availability, accuracy, or
            security of Microsoft's services.
          </Body>
        </Section>

        <Section title="12. Changes to Terms">
          <Body>
            The developer reserves the right to modify these Terms at any time. Updated terms
            will be made available within the App. Continued use of the App after changes
            are posted constitutes your acceptance of the revised Terms.
          </Body>
        </Section>

        <Section title="13. Governing Law">
          <Body>
            These Terms shall be governed by and construed in accordance with the laws of
            the jurisdiction in which the developer is located, without regard to its conflict
            of law provisions.
          </Body>
        </Section>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Questions? Contact us through the App Store listing.
          </Text>
        </View>
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
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  backText: { fontSize: 17, color: '#FFFFFF', fontWeight: '600', marginLeft: 2 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  content: {
    backgroundColor: '#F5F7FA',
    padding: 20,
    paddingBottom: 48,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111',
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
  },
  footer: {
    paddingTop: 8,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
