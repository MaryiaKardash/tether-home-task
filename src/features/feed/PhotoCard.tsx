import { Image } from 'expo-image';
import { router } from 'expo-router';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { photoUrl } from '@/data/images';
import type { Photo } from '@/domain/types';
import type { Colors } from '@/theme/colors';

import { LikeButton } from './LikeButton';
import { SwipeToRemove } from './SwipeToRemove';

export const CARD_MARGIN = 12;

interface Props {
  photo: Photo;
  width: number;
  colors: Colors;
}

function placeholderColor(id: number): string {
  return `hsl(${(id * 47) % 360}, 25%, 70%)`;
}

export const PhotoCard = memo(function PhotoCard({ photo, width, colors }: Props) {
  return (
    <SwipeToRemove photoId={photo.id}>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Pressable
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
          <LikeButton photoId={photo.id} colors={colors} />
        </View>
      </View>
    </SwipeToRemove>
  );
});

const styles = StyleSheet.create({
  card: {
    marginHorizontal: CARD_MARGIN,
    marginBottom: CARD_MARGIN,
    borderRadius: 14,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 2,
    paddingBottom: 10,
  },
  meta: {
    fontSize: 13,
  },
});
