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
import { FLING_VELOCITY, FLY_OUT_DURATION } from '@/theme/motion';

import { SwipeHint } from './SwipeHint';

interface Props {
  itemId: number;
  width: number;
  children: ReactNode;
}

function remove(id: number) {
  useRemoved.getState().remove(id);
}

export function SwipeToRemove({ itemId, width: cardWidth, children }: Props) {
  const width = cardWidth + CARD_MARGIN * 2;
  const threshold = width * 0.35;
  const [showHint, setShowHint] = useRecyclingState(false, [itemId]);
  const translateX = useSharedValue(0);
  const swipedId = useSharedValue(-1);
  const currentId = useSharedValue(itemId);

  useEffect(() => {
    currentId.set(itemId);
  }, [currentId, itemId]);

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
        (Math.abs(event.translationX) > threshold || Math.abs(event.velocityX) > FLING_VELOCITY);
      if (shouldRemove) {
        const direction = event.translationX + event.velocityX < 0 ? -1 : 1;
        translateX.set(
          withTiming(direction * width, { duration: FLY_OUT_DURATION }, (finished) => {
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
    const x = swipedId.get() === itemId ? translateX.get() : 0;
    return { transform: [{ translateX: x }] };
  });

  return (
    <View>
      {showHint && <SwipeHint translateX={translateX} threshold={threshold} width={width} />}
      <GestureDetector gesture={pan}>
        <Animated.View
          style={cardStyle}
          accessibilityActions={[{ name: 'remove', label: 'Remove' }]}
          onAccessibilityAction={() => remove(itemId)}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}
