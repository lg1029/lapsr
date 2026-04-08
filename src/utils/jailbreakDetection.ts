import { Platform, Linking } from 'react-native';

/**
 * Basic jailbreak detection for iOS using URL scheme checks.
 * Requires 'cydia' and 'sileo' in LSApplicationQueriesSchemes (Info.plist).
 * Not foolproof — a sophisticated jailbreak can spoof these checks —
 * but stops most opportunistic access on consumer-jailbroken devices.
 */
export async function isJailbroken(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;

  const schemesToCheck = ['cydia://', 'sileo://'];

  for (const scheme of schemesToCheck) {
    try {
      const canOpen = await Linking.canOpenURL(scheme);
      if (canOpen) return true;
    } catch {
      // Scheme check failed — not detectable, continue
    }
  }

  return false;
}
