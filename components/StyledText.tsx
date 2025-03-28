import { useTheme } from '@/hooks/useTheme';
import { useMemo } from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

export function StyledText(props: TextProps) {
  const theme = useTheme();

  const styles = useMemo(() =>
    StyleSheet.create({
      text: {
        fontFamily: 'Poppins_500Medium',
        fontSize: 16,
        color: theme.black,
      },
    }), [theme]
  );

  return (
    <Text
      {...props}
      style={[styles.text, props.style]}
    />
  );
}
