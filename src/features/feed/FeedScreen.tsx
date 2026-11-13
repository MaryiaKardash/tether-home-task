import { FlashList, type ListRenderItem, type ViewToken } from '@shopify/flash-list';
import { Image } from 'expo-image';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { photoUrl } from '@/data/images';
import type { FeedItem } from '@/domain/types';
import { useRemoved } from '@/store/removed';
import { useColors } from '@/theme/colors';
import { CARD_MARGIN, CARD_RADIUS } from '@/theme/layout';

import { PhotoCard } from './PhotoCard';
import { TextCard } from './TextCard';
import { useFeed } from './useFeed';

const keyExtractor = (item: FeedItem) => String(item.id);
const getItemType = (item: FeedItem) => item.kind;

const PREFETCH_FROM = 3;
const PREFETCH_AHEAD = 6;
const prefetched = new Set<string>();

export function FeedScreen() {
  const {
    items,
    loading,
    loadFailed,
    refreshing,
    refreshFailed,
    loadingMore,
    loadMoreFailed,
    loadMore,
    refresh,
    retryLoadMore,
    reload,
  } = useFeed();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const hasRemovedAny = useRemoved((state) => Object.keys(state.removed).length > 0);
  const cardWidth = width - insets.left - insets.right - CARD_MARGIN * 2;

  const renderItem: ListRenderItem<FeedItem> = ({ item }) =>
    item.kind === 'photo' ? (
      <PhotoCard photo={item} width={cardWidth} colors={colors} />
    ) : (
      <TextCard post={item} width={cardWidth} colors={colors} />
    );
  const extraData = { cardWidth, colors };

  const onViewableItemsChanged = ({ viewableItems }: { viewableItems: ViewToken<FeedItem>[] }) => {
    const lastVisible = viewableItems.at(-1)?.index;
    if (lastVisible == null) return;
    const urls = items
      .slice(lastVisible + PREFETCH_FROM, lastVisible + PREFETCH_FROM + PREFETCH_AHEAD)
      .filter((item) => item.kind === 'photo')
      .map((photo) => photoUrl(photo, cardWidth))
      .filter((url) => !prefetched.has(url));
    if (urls.length === 0) return;
    urls.forEach((url) => prefetched.add(url));
    void Image.prefetch(urls, 'memory-disk');
  };

  if (items.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        {loading ? (
          <ActivityIndicator />
        ) : (
          <Pressable onPress={reload} accessibilityRole="button" style={styles.retry}>
            <Text style={{ color: colors.text }}>
              {loadFailed
                ? 'Could not load the feed. Tap to retry.'
                : 'No photos yet. Tap to reload.'}
            </Text>
          </Pressable>
        )}
      </View>
    );
  }

  const header = refreshFailed ? (
    <Pressable
      onPress={() => void refresh()}
      accessibilityRole="button"
      style={[styles.banner, { backgroundColor: colors.card }]}>
      <Text style={[styles.centerText, { color: colors.text }]}>
        Could not refresh the feed. Tap to try again.
      </Text>
    </Pressable>
  ) : hasRemovedAny ? null : (
    <View style={styles.tip}>
      <Ionicons name="swap-horizontal" size={16} color={colors.muted} />
      <Text style={{ color: colors.muted }}>Swipe a card left or right to remove it</Text>
    </View>
  );

  const footer = loadingMore ? (
    <ActivityIndicator style={styles.footer} />
  ) : loadMoreFailed ? (
    <Pressable onPress={retryLoadMore} accessibilityRole="button" style={styles.footer}>
      <Text style={[styles.centerText, { color: colors.muted }]}>
        Could not load more photos. Tap to retry.
      </Text>
    </Pressable>
  ) : null;

  return (
    <FlashList<FeedItem>
      data={items}
      extraData={extraData}
      keyExtractor={keyExtractor}
      getItemType={getItemType}
      renderItem={renderItem}
      onEndReached={loadMore}
      onEndReachedThreshold={2}
      onViewableItemsChanged={onViewableItemsChanged}
      refreshing={refreshing}
      onRefresh={refresh}
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingTop: CARD_MARGIN,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
      ListHeaderComponent={header}
      ListFooterComponent={footer}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retry: {
    padding: 16,
  },
  banner: {
    marginHorizontal: CARD_MARGIN,
    marginBottom: CARD_MARGIN,
    padding: 12,
    borderRadius: CARD_RADIUS,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: CARD_MARGIN,
  },
  footer: {
    padding: 16,
  },
  centerText: {
    textAlign: 'center',
  },
});
