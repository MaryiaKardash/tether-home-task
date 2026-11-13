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
import type { Colors } from '@/theme/colors';

interface Props {
  photoId: number;
  colors: Colors;
}

export function LikeButton({ photoId, colors }: Props) {
  const liked = useIsLiked(photoId);
  const toggle = useLikes((state) => state.toggle);
  const scale = useSharedValue(1);

  const heartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.get() }],
  }));

  const onPress = () => {
    if (!liked) {
      scale.set(withSequence(withTiming(1.4, { duration: 90 }), withSpring(1)));
    }
    toggle(photoId);
  };

  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={liked ? 'Unlike photo' : 'Like photo'}
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
