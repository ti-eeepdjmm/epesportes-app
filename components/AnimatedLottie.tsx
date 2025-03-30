// components/AnimatedLottie.tsx
import React from 'react';
import LottieView from 'lottie-react-native';

interface AnimatedLottieProps {
  source: any; // você pode tipar com ImageSourcePropType se preferir
  autoPlay?: boolean;
  loop?: boolean;
  width?: number;
  height?: number;
}

export default function AnimatedLottie({
  source,
  autoPlay = true,
  loop = true,
  width = 300,
  height = 300,
}: AnimatedLottieProps) {
  return (
    <LottieView
      source={source}
      autoPlay={autoPlay}
      loop={loop}
      style={{ width, height }}
    />
  );
}
