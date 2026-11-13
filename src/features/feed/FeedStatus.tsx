import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useRemoved } from '@/store/removed';
import { useColors } from '@/theme/colors';
import { CARD_MARGIN, CARD_RADIUS, SPACING } from '@/theme/layout';

interface EmptyStateProps {
  loading: boolean;
  failed: boolean;
  exhausted: boolean;
  onReload: () => void;
}

export function EmptyState({ loading, failed, exhausted, onReload }: EmptyStateProps) {
  const colors = useColors();

  let content;
  if (loading) {
    content = <ActivityIndicator />;
  } else if (exhausted) {
    content = (
      <Text style={[styles.message, { color: colors.muted }]}>Nothing left in the feed.</Text>
    );
  } else {
    content = (
      <Pressable onPress={onReload} accessibilityRole="button">
        <Text style={[styles.message, { color: colors.text }]}>
          {failed ? 'Could not load the feed. Tap to retry.' : 'No posts yet. Tap to reload.'}
        </Text>
      </Pressable>
    );
  }

  return <View style={[styles.empty, { backgroundColor: colors.background }]}>{content}</View>;
}

interface ListHeaderProps {
  refreshFailed: boolean;
  onRetry: () => void;
}

export function ListHeader({ refreshFailed, onRetry }: ListHeaderProps) {
  const colors = useColors();
  const hasRemovedAny = useRemoved((state) => Object.keys(state.removed).length > 0);

  if (refreshFailed) {
    return (
      <Pressable
        onPress={onRetry}
        accessibilityRole="button"
        style={[styles.banner, { backgroundColor: colors.card }]}>
        <Text style={[styles.centerText, { color: colors.text }]}>
          Could not refresh the feed. Tap to try again.
        </Text>
      </Pressable>
    );
  }

  if (hasRemovedAny) return null;

  return (
    <View style={styles.tip}>
      <Ionicons name="swap-horizontal" size={16} color={colors.muted} />
      <Text style={{ color: colors.muted }}>Swipe a card left or right to remove it</Text>
    </View>
  );
}

interface ListFooterProps {
  loading: boolean;
  failed: boolean;
  onRetry: () => void;
}

export function ListFooter({ loading, failed, onRetry }: ListFooterProps) {
  const colors = useColors();

  if (loading) return <ActivityIndicator style={styles.footer} />;
  if (!failed) return null;

  return (
    <Pressable onPress={onRetry} accessibilityRole="button" style={styles.footer}>
      <Text style={[styles.centerText, { color: colors.muted }]}>
        Could not load more posts. Tap to retry.
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    padding: SPACING.xl,
  },
  banner: {
    marginHorizontal: CARD_MARGIN,
    marginBottom: CARD_MARGIN,
    padding: SPACING.lg,
    borderRadius: CARD_RADIUS,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginBottom: CARD_MARGIN,
  },
  footer: {
    padding: SPACING.xl,
  },
  centerText: {
    textAlign: 'center',
  },
});
