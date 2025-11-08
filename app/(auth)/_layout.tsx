// app/(auth)/_layout.tsx

import React, { useEffect, useMemo } from 'react';
import { Slot } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import {
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { SignUpProvider } from '@/contexts/SignUpContext'; // 👈 IMPORTANTE
import { StatusBar } from 'expo-status-bar';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

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
        <KeyboardAwareScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid
          extraScrollHeight={20}
          keyboardOpeningTime={0}
        >
            <Animated.View style={[styles.flex, fadeStyle]}>
              <Slot />
              <StatusBar style="dark" backgroundColor="white" />
            </Animated.View>
          </KeyboardAwareScrollView>
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
