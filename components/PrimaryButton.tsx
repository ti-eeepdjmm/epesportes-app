import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../hooks/useTheme';

type Props = {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export function PrimaryButton({ title, onPress, style, textStyle }: Props) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.button,
        { backgroundColor: theme.greenBackground },
        style,
      ]}
    >
      <Text style={[styles.text, { color: '#fff' }, textStyle]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    margin:'auto',
    minWidth:256,
    minHeight:32,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins_400Regular',
    width: '100%',
    textAlign: 'center',

  },
});
