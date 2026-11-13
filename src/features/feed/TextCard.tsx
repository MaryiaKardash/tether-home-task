import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { TextPost } from '@/domain/types';
import type { Colors } from '@/theme/colors';
import { CARD_MARGIN, CARD_RADIUS } from '@/theme/layout';

import { LikeButton } from './LikeButton';
import { SwipeToRemove } from './SwipeToRemove';

interface Props {
  post: TextPost;
  width: number;
  colors: Colors;
}

export const TextCard = memo(function TextCard({ post, width, colors }: Props) {
  return (
    <SwipeToRemove photoId={post.id} width={width}>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>{post.title}</Text>
        <Text style={[styles.body, { color: colors.text }]}>{post.body}</Text>
        <View style={styles.footer}>
          <Text style={[styles.meta, { color: colors.muted }]}>#{post.id}</Text>
          <LikeButton photoId={post.id} colors={colors} />
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
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  body: {
    fontSize: 15,
    lineHeight: 21,
    marginTop: 6,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 10,
  },
  meta: {
    fontSize: 13,
  },
});
