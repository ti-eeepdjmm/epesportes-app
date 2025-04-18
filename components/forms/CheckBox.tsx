// components/forms/CheckBox.tsx
import React from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

interface CheckBoxProps {
  label: string;
  value: boolean;
  onChange: (newValue: boolean) => void;
}

export function CheckBox({ label, value, onChange }: CheckBoxProps) {
  const theme = useTheme();

  return (
    <Pressable
      style={styles(theme).container}
      onPress={() => onChange(!value)}
    >
      <View style={[styles(theme).box, value && styles(theme).checkedBox]}>
        {value && (
          <Ionicons name="checkmark" size={16} color={theme.white} />
        )}
      </View>
      <Text style={styles(theme).label}>{label}</Text>
    </Pressable>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 16,
    },
    box: {
      width: 24,
      height: 24,
      borderWidth: 2,
      borderRadius: 6,
      borderColor: theme.greenLight,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.white,
    },
    checkedBox: {
      backgroundColor: theme.greenLight,
    },
    label: {
      marginLeft: 8,
      fontSize: 16,
      color: theme.black,
    },
  });
