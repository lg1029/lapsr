import React, { useEffect, useState } from 'react';
import { AppState, View, StyleSheet } from 'react-native';
import Logo from './Logo';

/**
 * Renders a blue overlay when the app is inactive (e.g. app switcher screenshot).
 * Prevents sensitive credentials from appearing in the iOS app switcher.
 */
export default function PrivacyOverlay() {
  const [obscure, setObscure] = useState(false);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      setObscure(state === 'inactive');
    });
    return () => sub.remove();
  }, []);

  if (!obscure) return null;

  return (
    <View style={styles.overlay}>
      <Logo width={80} height={99} />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0078D4',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    elevation: 9999,
  },
});
