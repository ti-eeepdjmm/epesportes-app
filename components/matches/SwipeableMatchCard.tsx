import React, { useRef } from 'react';
import { Animated, StyleSheet, NativeSyntheticEvent } from 'react-native';
import {
  PanGestureHandler,
  HandlerStateChangeEvent,
  PanGestureHandlerEventPayload,
} from 'react-native-gesture-handler';
import { MatchCardSummary } from '@/components/matches/MatchCardSummary';

interface SwipeableMatchCardProps {
  match: any;
  onPress: () => void;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export const SwipeableMatchCard: React.FC<SwipeableMatchCardProps> = ({
  match,
  onPress,
  onSwipeLeft,
  onSwipeRight,
  isFirst = false,
  isLast = false,
}) => {
  const translateX = useRef(new Animated.Value(0)).current;
  const SWIPE_THRESHOLD = 80;
  const SWIPE_DURATION = 150;

  const handleGesture = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    {
      useNativeDriver: true,
      listener: (event: NativeSyntheticEvent<PanGestureHandlerEventPayload>) => {
        const { translationX } = event.nativeEvent;
        if ((isFirst && translationX > 0) || (isLast && translationX < 0)) {
          translateX.setValue(0);
        }
      },
    }
  );

  const handleGestureEnd = (
    event: HandlerStateChangeEvent<PanGestureHandlerEventPayload>
  ) => {
    const { translationX } = event.nativeEvent;

    if (translationX > SWIPE_THRESHOLD && !isFirst) {
      Animated.timing(translateX, {
        toValue: 300,
        duration: SWIPE_DURATION,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          onSwipeRight();
          translateX.setValue(0);
        }, SWIPE_DURATION);
      });
    } else if (translationX < -SWIPE_THRESHOLD && !isLast) {
      Animated.timing(translateX, {
        toValue: -300,
        duration: SWIPE_DURATION,
        useNativeDriver: true,
      }).start(() => {
        setTimeout(() => {
          onSwipeLeft();
          translateX.setValue(0);
        }, SWIPE_DURATION);
      });
    } else {
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <PanGestureHandler
      onGestureEvent={handleGesture}
      onHandlerStateChange={handleGestureEnd}
    >
      <Animated.View
        style={[
          styles.cardContainer,
          {
            transform: [
              { translateX },
            ],
          },
        ]}
      >
        <MatchCardSummary match={match} onPress={onPress} />
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    alignSelf: 'center',
  },
});
