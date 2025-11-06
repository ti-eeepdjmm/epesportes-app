// app/(auth)/_layout.tsx

import React, { useEffect } from 'react';
import { Slot } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { StyleSheet, ScrollView, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';

import { useTheme } from '@/hooks/useTheme';

export default function OnboardLayout() {
  const opacity = useSharedValue(0);
  const theme = useTheme();
  const { top } = useSafeAreaInsets();

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400 });
  }, []);

  useEffect(() => {
    // Android: aplica a cor da system status bar de forma nativa
    if (Platform.OS === 'android') {
      SystemUI.setBackgroundColorAsync(theme.greenLight).catch(() => {});
    }
  }, [theme.greenLight]);

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      {/* iOS: pinta a área da status bar */}
      {Platform.OS === 'ios' && (
        <View style={{ height: top, backgroundColor: theme.greenLight }} />
      )}

      <Animated.View style={[styles.flex, fadeStyle]} >
        <StatusBar style="dark" translucent={false} />
        <Slot />
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  flex: {
    flex: 1,
  },
});
