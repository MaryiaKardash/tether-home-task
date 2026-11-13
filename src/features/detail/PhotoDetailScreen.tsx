import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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

import { useCachedPhoto } from '@/data/feedCache';
import { photoUrl } from '@/data/images';
import { useColors } from '@/theme/colors';
import { CARD_MARGIN, HIT_SLOP, SPACING } from '@/theme/layout';
import { FLING_VELOCITY, FLY_OUT_DURATION } from '@/theme/motion';

const DISMISS_DISTANCE = 120;

const CLOSE_ICON_SIZE = 28;
const CLOSE_OFFSET = SPACING.sm;
const TITLE_LINE_HEIGHT = 22;
const TITLE_PADDING = SPACING.xl;
const TITLE_HEIGHT = TITLE_LINE_HEIGHT + TITLE_PADDING * 2;
const RESERVED_HEIGHT = TITLE_HEIGHT + (CLOSE_OFFSET + CLOSE_ICON_SIZE) * 2;

function close() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

export function PhotoDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const photo = useCachedPhoto(Number(id));
  const colors = useColors();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(0);

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
          Math.abs(event.velocityY) > FLING_VELOCITY);
      if (shouldClose) {
        const direction = event.translationY + event.velocityY < 0 ? -1 : 1;
        translateY.set(
          withTiming(direction * height, { duration: FLY_OUT_DURATION }, (finished) => {
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
  const maxImageHeight = height - insets.top - insets.bottom - RESERVED_HEIGHT;
  const titleStyle = [styles.title, { color: colors.onBackdrop }];

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <Animated.View
        style={[StyleSheet.absoluteFill, { backgroundColor: colors.backdrop }, backdropStyle]}
      />
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.content, contentStyle]}>
          {photo ? (
            <>
              <Image
                source={{ uri: photoUrl(photo, cardWidth) }}
                cachePolicy="memory-disk"
                style={[
                  styles.image,
                  {
                    width: Math.min(width, (maxImageHeight * photo.width) / photo.height),
                    aspectRatio: photo.width / photo.height,
                  },
                ]}
                accessibilityIgnoresInvertColors
              />
              <Text style={titleStyle}>{photo.title}</Text>
            </>
          ) : (
            <Text style={titleStyle}>This photo is no longer loaded.</Text>
          )}
        </Animated.View>
      </GestureDetector>
      <Pressable
        onPress={close}
        hitSlop={HIT_SLOP}
        accessibilityRole="button"
        accessibilityLabel="Close photo"
        style={[
          styles.close,
          { top: insets.top + CLOSE_OFFSET, right: insets.right + SPACING.xl },
        ]}>
        <Ionicons name="close" size={CLOSE_ICON_SIZE} color={colors.onBackdrop} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  image: {
    alignSelf: 'center',
  },
  title: {
    fontSize: 16,
    lineHeight: TITLE_LINE_HEIGHT,
    fontWeight: '600',
    padding: TITLE_PADDING,
  },
  close: {
    position: 'absolute',
  },
});
