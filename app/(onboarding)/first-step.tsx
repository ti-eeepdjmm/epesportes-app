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

export default function OnboardNext() {
  const theme = useTheme();

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: '100%',
    paddingBottom: 24,
    gap: 24,
  }));

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 800 });
    translateY.value = withTiming(0, { duration: 800 });
  }, []);

  return (
    <View style={[globalStyles.containerOnboard, { backgroundColor: theme.white }]}>
      <WaveBackground />
      <Animated.View style={animatedStyle}>
        <AnimatedLottie
          source={require('../../assets/animations/volei.json')}
          height={350}
          width={350}
        />
        <Animated.View>
          <Text style={[globalStyles.title, { color: theme.greenLight }]}>
            Chegou a hora!
          </Text>
          <Text style={[globalStyles.paragraph, { color: theme.black }]}>
            Mergulhe no universo dos esportes!
          </Text>
          <PrimaryButton
            title="Criar Conta"
            onPress={() => router.push('/(auth)/signup-start')}
            style={{ width: 256, marginTop: 12 }}
          />
          <PrimaryButton
            title="Já Tenho Conta"
            onPress={() => router.push('/(auth)/login')}
            style={{ width: 256, marginTop: 12 }}
          />
        </Animated.View>
        <Logo styles={{ position: 'absolute', bottom: 24 }} />
      </Animated.View>
    </View>
  );
}
