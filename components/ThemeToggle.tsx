import React from 'react';
import { View, Switch, Text, StyleSheet } from 'react-native';
import { useThemeContext } from '../context/ThemeContext';
import { useTheme } from '../hooks/useTheme';
import MoonIcon from './icons/MoonIcon';

export function ThemeToggle() {
  const { theme, setTheme } = useThemeContext();
  const currentTheme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <MoonIcon color={currentTheme.black} size={24} />
        <Text style={[styles.label, { color: currentTheme.black }]}>Modo Escuro</Text>
      </View>
      <Switch
        style={[{borderColor: currentTheme.white}]}
        value={theme === 'dark'}
        onValueChange={(val) => setTheme(val ? 'dark' : 'light')}
        trackColor={{
            false: currentTheme.gray,
            true: currentTheme.black,
          }}
        thumbColor={ theme === 'dark'? currentTheme.white:currentTheme.white } // ou algo como '#fff'
        ios_backgroundColor={currentTheme.black}
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
