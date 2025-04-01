// app/(auth)/_layout.tsx
import React, { useEffect } from 'react';
import { Slot } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { SignUpProvider } from '@/contexts/SignUpContext';

export default function AuthLayout() {
  const opacity = useSharedValue(0);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400 });
  }, []);

  return (
    <Animated.View style={[{ flex: 1 }, fadeStyle]}>
      <SignUpProvider>
        <Slot />
      </SignUpProvider>
    </Animated.View>
  );
}
