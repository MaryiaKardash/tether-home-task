import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { TextPost } from '@/domain/types';
import { useColors } from '@/theme/colors';
import { CARD_MARGIN, CARD_RADIUS, SPACING } from '@/theme/layout';

import { LikeButton } from './LikeButton';
import { SwipeToRemove } from './SwipeToRemove';

interface Props {
  post: TextPost;
  width: number;
}

export const TextCard = memo(function TextCard({ post, width }: Props) {
  const colors = useColors();
  return (
    <SwipeToRemove itemId={post.id} width={width}>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>{post.title}</Text>
        <Text style={[styles.body, { color: colors.text }]}>{post.body}</Text>
        <View style={styles.footer}>
          <Text style={[styles.meta, { color: colors.muted }]}>#{post.id}</Text>
          <LikeButton itemId={post.id} />
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
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  body: {
    fontSize: 15,
    lineHeight: 21,
    marginTop: SPACING.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  meta: {
    fontSize: 13,
  },
});
