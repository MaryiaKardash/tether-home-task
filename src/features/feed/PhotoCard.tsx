import { Image } from 'expo-image';
import { router } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { photoUrl } from '@/data/images';
import type { Photo } from '@/domain/types';
import { useColors } from '@/theme/colors';
import { CARD_MARGIN, CARD_RADIUS, SPACING } from '@/theme/layout';

import { LikeButton } from './LikeButton';
import { SwipeToRemove } from './SwipeToRemove';

interface Props {
  photo: Photo;
  width: number;
}

function placeholderColor(id: number): string {
  return `hsl(${(id * 47) % 360}, 25%, 70%)`;
}

export const PhotoCard = memo(function PhotoCard({ photo, width }: Props) {
  const colors = useColors();
  return (
    <SwipeToRemove itemId={photo.id} width={width}>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open photo: ${photo.title}`}
          onPress={() =>
            router.push({ pathname: '/photo/[id]', params: { id: String(photo.id) } })
          }>
          <Image
            source={{ uri: photoUrl(photo, width) }}
            recyclingKey={String(photo.id)}
            cachePolicy="memory-disk"
            transition={120}
            style={[
              styles.image,
              {
                aspectRatio: photo.width / photo.height,
                backgroundColor: placeholderColor(photo.id),
              },
            ]}
            accessibilityIgnoresInvertColors
          />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {photo.title}
        </Text>
        <View style={styles.footer}>
          <Text style={[styles.meta, { color: colors.muted }]}>#{photo.id}</Text>
          <LikeButton itemId={photo.id} />
        </View>
      </View>
    </SwipeToRemove>
  );
});

const styles = StyleSheet.create({
  card: {
    marginHorizontal: CARD_MARGIN,
    marginBottom: CARD_MARGIN,
    borderRadius: CARD_RADIUS,
  },
  image: {
    width: '100%',
    borderTopLeftRadius: CARD_RADIUS,
    borderTopRightRadius: CARD_RADIUS,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxs,
    paddingBottom: SPACING.md,
  },
  meta: {
    fontSize: 13,
  },
});
