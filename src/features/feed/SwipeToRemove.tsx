import { useRecyclingState } from '@shopify/flash-list';
import { type ReactNode, useEffect } from 'react';
import { View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { useRemoved } from '@/store/removed';
import { CARD_MARGIN } from '@/theme/layout';

import { SwipeHint } from './SwipeHint';

const REMOVE_VELOCITY = 1000;

interface Props {
  photoId: number;
  width: number;
  children: ReactNode;
}

function remove(id: number) {
  useRemoved.getState().remove(id);
}

export function SwipeToRemove({ photoId, width: cardWidth, children }: Props) {
  const width = cardWidth + CARD_MARGIN * 2;
  const threshold = width * 0.35;
  const [showHint, setShowHint] = useRecyclingState(false, [photoId]);
  const translateX = useSharedValue(0);
  const swipedId = useSharedValue(-1);
  const currentId = useSharedValue(photoId);

  useEffect(() => {
    currentId.set(photoId);
  }, [currentId, photoId]);

  const pan = usePanGesture({
    activeOffsetX: [-15, 15],
    failOffsetY: [-10, 10],
    onActivate: () => {
      'worklet';
      swipedId.set(currentId.get());
      translateX.set(0);
      scheduleOnRN(setShowHint, true);
    },
    onUpdate: (event) => {
      'worklet';
      translateX.set(event.translationX);
    },
    onDeactivate: (event) => {
      'worklet';
      const id = currentId.get();
      const shouldRemove =
        !event.canceled &&
        (Math.abs(event.translationX) > threshold || Math.abs(event.velocityX) > REMOVE_VELOCITY);
      if (shouldRemove) {
        const direction = event.translationX + event.velocityX < 0 ? -1 : 1;
        translateX.set(
          withTiming(direction * width, { duration: 180 }, (finished) => {
            if (finished) scheduleOnRN(remove, id);
          }),
        );
      } else {
        translateX.set(
          withSpring(0, undefined, (finished) => {
            if (finished) scheduleOnRN(setShowHint, false);
          }),
        );
      }
    },
  });

  const cardStyle = useAnimatedStyle(() => {
    const x = swipedId.get() === photoId ? translateX.get() : 0;
    return { transform: [{ translateX: x }] };
  });

  return (
    <View>
      {showHint && <SwipeHint translateX={translateX} threshold={threshold} width={width} />}
      <GestureDetector gesture={pan}>
        <Animated.View
          style={cardStyle}
          accessibilityActions={[{ name: 'remove', label: 'Remove photo' }]}
          onAccessibilityAction={() => remove(photoId)}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
