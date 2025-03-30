// components/forms/InputField.tsx
import React from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { Controller, Control } from 'react-hook-form';
import { useTheme } from '@/hooks/useTheme';

interface InputFieldProps extends TextInputProps {
  name: string;
  control: Control<any>;
  label?: string;
}

export function InputField({
  name,
  control,
  label,
  style,
  ...props
}: InputFieldProps) {
  const theme = useTheme();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View style={{ marginBottom: 16 }}>
          {label && <Text style={styles(theme).label}>{label}</Text>}
          <TextInput
            style={[
              styles(theme).input,
              !!error && styles(theme).errorInput,
              style,
            ]}
            placeholderTextColor={theme.gray}
            onChangeText={onChange}
            onBlur={onBlur}
            value={value}
            {...props}
          />
          {!!error && <Text style={styles(theme).errorText}>{error.message}</Text>}
        </View>
      )}
    />
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    label: {
      fontFamily: 'Poppins_500Medium',
      fontSize: 14,
      color: theme.black,
      marginBottom: 4,
    },
    input: {
      borderWidth: 1,
      borderColor: theme.grayLight,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: theme.black,
    },
    errorInput: {
      borderColor: theme.error,
    },
    errorText: {
      marginTop: 4,
      color: theme.error,
      fontSize: 12,
    },
  });
