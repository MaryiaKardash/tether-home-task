import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { useColors } from '@/theme/colors';
import { CARD_MARGIN, CARD_RADIUS, SPACING } from '@/theme/layout';

interface Props {
  translateX: SharedValue<number>;
  threshold: number;
  width: number;
}

export function SwipeHint({ translateX, threshold, width }: Props) {
  const colors = useColors();

  const hintStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      Math.abs(translateX.get()),
      [0, 20, threshold, width],
      [0, 0.5, 1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const leftSideStyle = useAnimatedStyle(() => ({
    opacity: translateX.get() > 0 ? 1 : 0,
  }));

  const rightSideStyle = useAnimatedStyle(() => ({
    opacity: translateX.get() < 0 ? 1 : 0,
  }));

  return (
    <Animated.View
      style={[styles.hint, { backgroundColor: colors.danger }, hintStyle]}
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden>
      <Animated.View style={[styles.side, leftSideStyle]}>
        <Ionicons name="trash-outline" size={22} color={colors.onBackdrop} />
        <Text style={[styles.text, { color: colors.onBackdrop }]}>Remove</Text>
      </Animated.View>
      <Animated.View style={[styles.side, rightSideStyle]}>
        <Text style={[styles.text, { color: colors.onBackdrop }]}>Remove</Text>
        <Ionicons name="trash-outline" size={22} color={colors.onBackdrop} />
      </Animated.View>
    </Animated.View>
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
    paddingHorizontal: SPACING.xxl,
  },
  side: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
  },
});
