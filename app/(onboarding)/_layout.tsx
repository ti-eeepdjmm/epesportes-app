// app/(auth)/_layout.tsx

import React, { useEffect } from 'react';
import { Slot } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import {
  Platform,
  KeyboardAvoidingView,
  SafeAreaView,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SignUpProvider } from '@/contexts/SignUpContext'; // 👈 IMPORTANTE
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/hooks/useTheme';

export default function OnboardLayout() {
  const opacity = useSharedValue(0);
  const theme = useTheme();

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400 });
  }, []);

  return (
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View style={[styles.flex, fadeStyle]}>
              <Slot />
              <StatusBar style="light" backgroundColor={theme.greenLight} />
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
