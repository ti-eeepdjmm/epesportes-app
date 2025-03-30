// components/base/Button.tsx
import React, { ReactNode, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, TouchableOpacityProps } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  icon?: ReactNode;
}

export function Button({ title, onPress, loading, icon, ...rest }: ButtonProps) {
  const theme = useTheme();

  const styles = useMemo(() => StyleSheet.create({
    button: {
      backgroundColor: theme.greenBackground,
      borderRadius: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    text: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
    },
    icon: {
      marginRight: 8,
    },
  }), [theme]);

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      disabled={loading}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <>
          {icon && <View style={styles.icon}>{icon}</View>}
          <Text style={styles.text}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
