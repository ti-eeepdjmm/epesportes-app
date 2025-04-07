// components/Base/CheckboxGroup.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface CheckboxGroupProps {
  label: string;
  value: boolean;
  onChange: (val: boolean) => void;
}

export function CheckboxGroup({ label, value, onChange }: CheckboxGroupProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity
      style={styles(theme).container}
      onPress={() => onChange(!value)}
    >
      <View style={[styles(theme).box, value && styles(theme).checked]} />
      <Text style={styles(theme).label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 4,
    },
    box: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: theme.greenLight,
      marginRight: 8,
    },
    checked: {
      backgroundColor: theme.greenLight,
    },
    label: {
      fontSize: 14,
      fontFamily: 'Poppins_400Regular',
      color: theme.black,
    },
  });