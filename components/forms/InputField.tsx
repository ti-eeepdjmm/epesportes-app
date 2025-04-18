import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Pressable } from 'react-native';
import { useController, Control } from 'react-hook-form';
import { useTheme } from '@/hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

interface InputFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  control: Control<any>;
  secure?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric';
}

export function InputField({
  name,
  label,
  placeholder,
  control,
  secure = false,
  keyboardType = 'default',
}: InputFieldProps) {
  const theme = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    field: { onChange, onBlur, value },
    fieldState: { error },
  } = useController({ name, control });

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={[styles(theme).label]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          onBlur(); // importante para RHF saber que perdeu foco
        }}
        placeholder={placeholder}
        placeholderTextColor={theme.gray}
        secureTextEntry={secure && !showPassword}
        keyboardType={keyboardType}
        style={[
          styles(theme).input,
          isFocused && styles(theme).focusedInput,
          error && styles(theme).errorInput,
        ]}
      />
      {secure && (
        <Pressable
          onPress={() => setShowPassword((prev) => !prev)}
          style={styles(theme).eyeIcon}
        >
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={20}
            color={theme.gray}
          />
        </Pressable>
      )}
      {error?.message && (
        <Text style={styles(theme).errorText}>{error.message}</Text>
      )}
    </View>
  );
}

const styles = (theme: any) =>
  StyleSheet.create({
    label: {
      fontSize: 16,
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
    focusedInput: {
      borderColor: theme.greenLight, // borda verde ao focar
    },
    errorInput: {
      borderColor: theme.error,
    },
    errorText: {
      marginTop: 4,
      color: theme.error,
      fontSize: 14,
    },
    eyeIcon: {
      position: 'absolute',
      right: 12,
      top: 40,
    },
  });
