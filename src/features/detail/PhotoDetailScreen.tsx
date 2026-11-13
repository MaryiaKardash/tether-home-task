import Ionicons from '@expo/vector-icons/Ionicons';
import { type InfiniteData, useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import type { FeedPage } from '@/data/mockFeed';
import { photoUrl } from '@/data/images';
import type { Photo } from '@/domain/types';
import { FEED_KEY } from '@/features/feed/useFeed';
import { CARD_MARGIN } from '@/theme/layout';

const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 1000;

function close() {
  router.back();
}

export function PhotoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(0);

  const photo = queryClient
    .getQueryData<InfiniteData<FeedPage, number>>(FEED_KEY)
    ?.pages.flatMap((page) => page.items)
    .find((item): item is Photo => item.kind === 'photo' && item.id === Number(id));

  const pan = usePanGesture({
    activeOffsetY: [-10, 10],
    onUpdate: (event) => {
      'worklet';
      translateY.set(event.translationY);
    },
    onDeactivate: (event) => {
      'worklet';
      const shouldClose =
        !event.canceled &&
        (Math.abs(event.translationY) > DISMISS_DISTANCE ||
          Math.abs(event.velocityY) > DISMISS_VELOCITY);
      if (shouldClose) {
        const direction = event.translationY + event.velocityY < 0 ? -1 : 1;
        translateY.set(
          withTiming(direction * height, { duration: 180 }, (finished) => {
            if (finished) scheduleOnRN(close);
          }),
        );
      } else {
        translateY.set(withSpring(0));
      }
    },
  });

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(Math.abs(translateY.get()), [0, height / 2], [1, 0], Extrapolation.CLAMP),
  }));

  const contentStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.get() },
      {
        scale: interpolate(
          Math.abs(translateY.get()),
          [0, height / 2],
          [1, 0.85],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  const cardWidth = width - insets.left - insets.right - CARD_MARGIN * 2;

  return (
    <View style={styles.screen}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]} />
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.content, contentStyle]}>
          {photo ? (
            <>
              <Image
                source={{ uri: photoUrl(photo, cardWidth) }}
                cachePolicy="memory-disk"
                style={{ width, aspectRatio: photo.width / photo.height }}
                accessibilityIgnoresInvertColors
              />
              <Text style={styles.title}>{photo.title}</Text>
            </>
          ) : (
            <Text style={styles.title}>This photo is no longer loaded.</Text>
          )}
        </Animated.View>
      </GestureDetector>
      <Pressable
        onPress={close}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Close photo"
        style={[styles.close, { top: insets.top + 8, right: insets.right + 16 }]}>
        <Ionicons name="close" size={28} color="#ffffff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  backdrop: {
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    padding: 16,
  },
  close: {
    position: 'absolute',
  },
});
