import { useTheme } from '@/hooks/useTheme';
import React from 'react';
import { View, StyleSheet } from 'react-native';

interface SeparatorProps {
  style?: object;
}

export function Separator({ style }: SeparatorProps) {
  const theme = useTheme()
  const styles = StyleSheet.create({
    divider: {
      height: 1,
      backgroundColor: theme.grayLight,
      marginVertical: 24,
      width: '100%',
       ...style,
    },
  });
  
  return <View style={styles.divider} />;
}

