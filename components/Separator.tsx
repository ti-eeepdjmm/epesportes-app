import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { View, StyleSheet } from 'react-native';

export function Separator() {
  const theme = useTheme()
  const styles = StyleSheet.create({
    divider: {
      height: 1,
      backgroundColor: theme.grayLight,
      marginVertical: 24,
    },
  });
  
  return <View style={styles.divider} />;
}

