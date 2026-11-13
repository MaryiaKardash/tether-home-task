import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useIsLiked, useLikes } from '@/store/likes';
import { useColors } from '@/theme/colors';
import { HIT_SLOP } from '@/theme/layout';

interface Props {
  itemId: number;
}

export function LikeButton({ itemId }: Props) {
  const colors = useColors();
  const liked = useIsLiked(itemId);
  const scale = useSharedValue(1);

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  const onPress = () => {
    if (!liked) {
      scale.set(withSequence(withTiming(1.4, { duration: 90 }), withSpring(1)));
    }
    useLikes.getState().toggle(itemId);
  };

  return (
    <Pressable
      onPress={onPress}
      hitSlop={HIT_SLOP}
      accessibilityRole="button"
      accessibilityLabel={liked ? 'Unlike' : 'Like'}
      accessibilityState={{ selected: liked }}>
      <Animated.View style={heartStyle}>
        <Ionicons
          name={liked ? 'heart' : 'heart-outline'}
          size={24}
          color={liked ? colors.accent : colors.muted}
        />
      </Animated.View>
    </Pressable>
  );
}
