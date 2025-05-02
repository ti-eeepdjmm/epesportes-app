import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { useThemeContext } from '@/contexts/ThemeContext';
import { CustomSwitch } from './CustomSwitch';

type Props = {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  icon?: React.ReactNode; // agora é só um componente qualquer
};

export function SettingToggle({ label, description, value, onChange, icon }: Props) {
  const { theme, setTheme } = useThemeContext();
  const currentTheme = useTheme();

  return (
    <View style={[styles.container, { borderBottomColor: currentTheme.black }]}>
      {icon && <View style={styles.icon}>{icon}</View>}

      <View style={styles.textContainer}>
        <Text style={[styles.label, { color: currentTheme.black }]}>{label}</Text>
        {description && (
          <Text style={[styles.description, { color: currentTheme.black }]}>{description}</Text>
        )}
      </View>

      <CustomSwitch value={value} onChange={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  icon: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
  },
  description: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
});
