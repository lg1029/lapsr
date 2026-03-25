import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

interface Props {
  message: string;
}

export default function ErrorBanner({ message }: Props) {
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FDECEA',
    borderLeftWidth: 4,
    borderLeftColor: '#D32F2F',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 4,
  },
  text: {
    color: '#B71C1C',
    fontSize: 14,
  },
});
