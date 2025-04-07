import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../hooks/useTheme';

type Props = {
  value: boolean;
  onChange: (value: boolean) => void;
  width?: number;
  height?: number;
};

export function CustomSwitch({ value, onChange, width = 36, height = 20 }: Props) {
  const theme = useTheme();
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [value]);

  
  const thumbColor = value ? theme.white : theme.white;

  const thumbSize = height * 0.8;
  const padding = (height - thumbSize) / 2;
  const thumbTranslateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [padding, width - thumbSize - padding],
  });

  return (
    <AnimatedPressable
      onPress={() => onChange(!value)}
      style={[
        styles.track,
        {
          backgroundColor: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [theme.gray, theme.greenLight],
          }),
          width,
          height,
          borderRadius: height / 2,
          padding,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.thumb,
          {
            width: thumbSize,
            height: thumbSize,
            borderRadius: thumbSize / 2,
            transform: [{ translateX: thumbTranslateX }],
            backgroundColor: thumbColor,
          },
        ]}
      />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  track: {
    justifyContent: 'center',
  },
  thumb: {
    position: 'absolute',
  },
});
