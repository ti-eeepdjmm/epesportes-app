import React, { useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';
import { globalStyles } from '../../constants/styles';
import { PrimaryButton } from '../../components/PrimaryButton';
import { router } from 'expo-router';
import WaveBackground from '@/components/WaveBackground';
import AnimatedLottie from '@/components/AnimatedLottie';
import { Logo } from '@/components/Logo';

export default function OnboardStart() {
  const theme = useTheme();

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
    alignItems:'center',
    justifyContent:'flex-start',
    height: '100%',
    paddingBottom:24,
    gap:64,
  }));

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800 });
    translateY.value = withTiming(0, { duration: 800 });
  }, []);

  return (
    <View style={[globalStyles.containerOnboard, { backgroundColor: theme.white }]}>
      <WaveBackground />
      <Animated.View style={animatedStyle}>
        <AnimatedLottie source={require('../../assets/animations/futebol.json')} />
        <Animated.View>
          <Text style={[globalStyles.title, { color: theme.greenDetail }]}>
            Bem vindo!
          </Text>
          <Text style={[globalStyles.paragraph, { color: theme.black }]}>
            Seu App de esportes da EEEP DJMM
          </Text>
          <PrimaryButton title="Começar" onPress={() => router.push('/(onboarding)/first-step')} />
        </Animated.View>
        <Logo styles={{position:'absolute', bottom: 24}} />
      </Animated.View>
    </View>
  );
}
