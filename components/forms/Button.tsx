// components/Base/Button.tsx
import React from 'react';
import {
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  View,
} from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  icon?: React.ReactNode; // ✅ Novo: suporte a ícone
}

export function Button({ title, onPress, loading, style, icon }: ButtonProps) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    button: {
      backgroundColor: theme.greenLight,
      paddingVertical: 8,
      paddingHorizontal: 24,
      borderRadius: 8,
      flexDirection: 'row', // ✅ Para alinhar texto + ícone
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    text: {
      color: theme.white,
      fontSize: 16,
      fontFamily: 'Poppins_500Medium',
      alignItems: 'center',
    },
    iconWrapper: {
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <>
          {!!icon && <View style={styles.iconWrapper}>{icon}</View>}
          <Text style={styles.text}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
