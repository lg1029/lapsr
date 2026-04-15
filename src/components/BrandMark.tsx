import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Logo from './Logo';

export default function BrandMark() {
  return (
    <View style={styles.container}>
      <Logo width={24} height={30} />
      <Text style={styles.text}>LAPSr</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
});
