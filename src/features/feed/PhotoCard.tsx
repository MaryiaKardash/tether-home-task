import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { photoUrl } from '@/data/images';
import type { Photo } from '@/domain/types';
import type { Colors } from '@/theme/colors';

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
    <View style={[styles.card, { backgroundColor: colors.card }]}>
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
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
        {photo.title}
      </Text>
      <Text style={[styles.meta, { color: colors.muted }]}>#{photo.id}</Text>
    </View>
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
  meta: {
    fontSize: 13,
    paddingHorizontal: 12,
    paddingTop: 2,
    paddingBottom: 12,
  },
});
