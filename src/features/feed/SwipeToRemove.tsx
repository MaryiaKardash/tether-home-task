import Ionicons from '@expo/vector-icons/Ionicons';
import { type ReactNode, useEffect } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { useRemoved } from '@/store/removed';
import { useColors } from '@/theme/colors';
import { CARD_MARGIN, CARD_RADIUS } from '@/theme/layout';

const REMOVE_VELOCITY = 1000;

interface Props {
  photoId: number;
  children: ReactNode;
}

export function SwipeToRemove({ photoId, children }: Props) {
  const { width } = useWindowDimensions();
  const colors = useColors();
  const threshold = width * 0.35;
  const remove = useRemoved((state) => state.remove);
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
    },
    onUpdate: (event) => {
      'worklet';
      translateX.set(event.translationX);
    },
    onDeactivate: (event) => {
      'worklet';
      const id = currentId.get();
      const shouldRemove =
        Math.abs(event.translationX) > threshold || Math.abs(event.velocityX) > REMOVE_VELOCITY;
      if (shouldRemove) {
        const direction = event.translationX + event.velocityX < 0 ? -1 : 1;
        translateX.set(
          withTiming(direction * width, { duration: 180 }, (finished) => {
            if (finished) scheduleOnRN(remove, id);
          }),
        );
      } else {
        translateX.set(withSpring(0));
      }
    },
  });

  const cardStyle = useAnimatedStyle(() => {
    const x = swipedId.get() === photoId ? translateX.get() : 0;
    return { transform: [{ translateX: x }] };
  });

  const hintStyle = useAnimatedStyle(() => {
    const x = swipedId.get() === photoId ? Math.abs(translateX.get()) : 0;
    return {
      opacity: interpolate(x, [0, 20, threshold, width], [0, 0.5, 1, 0], Extrapolation.CLAMP),
    };
  });

  const leftSideStyle = useAnimatedStyle(() => ({
    opacity: swipedId.get() === photoId && translateX.get() > 0 ? 1 : 0,
  }));

  const rightSideStyle = useAnimatedStyle(() => ({
    opacity: swipedId.get() === photoId && translateX.get() < 0 ? 1 : 0,
  }));

  return (
    <View>
      <Animated.View
        style={[styles.hint, { backgroundColor: colors.danger }, hintStyle]}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden>
        <Animated.View style={[styles.hintSide, leftSideStyle]}>
          <Ionicons name="trash-outline" size={22} color="#ffffff" />
          <Text style={styles.hintText}>Remove</Text>
        </Animated.View>
        <Animated.View style={[styles.hintSide, rightSideStyle]}>
          <Text style={styles.hintText}>Remove</Text>
          <Ionicons name="trash-outline" size={22} color="#ffffff" />
        </Animated.View>
      </Animated.View>
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

const styles = StyleSheet.create({
  hint: {
    position: 'absolute',
    top: 0,
    bottom: CARD_MARGIN,
    left: CARD_MARGIN,
    right: CARD_MARGIN,
    borderRadius: CARD_RADIUS,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  hintSide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hintText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
});
