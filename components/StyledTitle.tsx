import { useTheme } from '@/hooks/useTheme';
import { useMemo } from 'react'
import { Text, TextProps, StyleSheet } from 'react-native';

export function StyledTitle(props: TextProps) {
  const theme = useTheme();
  
  const styles = useMemo(() => 
    StyleSheet.create({
    title: {
      fontFamily: 'Poppins_700Bold',
      fontSize: 24,
      color: theme.black, // você pode trocar por theme.text ou theme.primary
    },
  }), [theme]
);

  return (
    <Text
      {...props}
      style={[styles.title, props.style]}
    />
  );
}
