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

export default function AuthLayout() {
  const opacity = useSharedValue(0);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400 });
  }, []);

  return (
    <SignUpProvider>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View style={[styles.flex, fadeStyle]}>
              <Slot />
              <StatusBar style="dark" backgroundColor="white" />
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SignUpProvider>
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
