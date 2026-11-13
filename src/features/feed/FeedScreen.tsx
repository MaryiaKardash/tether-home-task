import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Photo } from '@/domain/types';
import { useColors } from '@/theme/colors';

import { CARD_MARGIN, PhotoCard } from './PhotoCard';
import { useFeed } from './useFeed';

const keyExtractor = (photo: Photo) => String(photo.id);
const getItemType = (photo: Photo) => photo.height;

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
  const cardWidth = width - insets.left - insets.right - CARD_MARGIN * 2;

  const renderItem: ListRenderItem<Photo> = ({ item }) => (
    <PhotoCard photo={item} width={cardWidth} colors={colors} />
  );
  const extraData = { cardWidth, colors };

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
  ) : null;

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
    <FlashList<Photo>
      data={items}
      extraData={extraData}
      keyExtractor={keyExtractor}
      getItemType={getItemType}
      renderItem={renderItem}
      onEndReached={loadMore}
      onEndReachedThreshold={1}
      refreshing={refreshing}
      onRefresh={refresh}
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingTop: insets.top + CARD_MARGIN,
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
    borderRadius: 14,
  },
  footer: {
    padding: 16,
  },
  centerText: {
    textAlign: 'center',
  },
});
