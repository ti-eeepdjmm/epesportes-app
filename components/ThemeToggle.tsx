import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeContext } from '../context/ThemeContext';
import { useTheme } from '../hooks/useTheme';
import MoonIcon from './icons/MoonIcon';
import { CustomSwitch } from './CustomSwitch';

export function ThemeToggle() {
  const { theme, setTheme } = useThemeContext();
  const currentTheme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <MoonIcon color={currentTheme.black} size={24} />
        <Text style={[styles.label, { color: currentTheme.black }]}>Modo Escuro</Text>
      </View>
      <CustomSwitch
        value={theme === 'dark'}
        onChange={(val) => setTheme(val ? 'dark' : 'light')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems:'center',
    justifyContent: 'space-between',
    padding: 24,
    gap: 8,
    minWidth:'100%',
  },
  textContainer:{
    flexDirection: 'row',
    gap: 8,
    
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
});
