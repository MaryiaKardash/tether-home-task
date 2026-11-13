import { FlashList, type ListRenderItem } from '@shopify/flash-list';
import { StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { FeedItem } from '@/domain/types';
import { useColors } from '@/theme/colors';
import { CARD_MARGIN } from '@/theme/layout';

import { EmptyState, ListFooter, ListHeader } from './FeedStatus';
import { PhotoCard } from './PhotoCard';
import { TextCard } from './TextCard';
import { useFeed } from './useFeed';
import { usePrefetchImages } from './usePrefetchImages';

const keyExtractor = (item: FeedItem) => String(item.id);
const getItemType = (item: FeedItem) => item.kind;

export function FeedScreen() {
  const feed = useFeed();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const cardWidth = width - insets.left - insets.right - CARD_MARGIN * 2;
  const onViewableItemsChanged = usePrefetchImages(feed.items, cardWidth);

  if (feed.items.length === 0) {
    return (
      <EmptyState
        loading={feed.loading}
        failed={feed.loadFailed}
        exhausted={feed.exhausted}
        onReload={feed.reload}
      />
    );
  }

  const renderItem: ListRenderItem<FeedItem> = ({ item }) =>
    item.kind === 'photo' ? (
      <PhotoCard photo={item} width={cardWidth} />
    ) : (
      <TextCard post={item} width={cardWidth} />
    );

  return (
    <FlashList<FeedItem>
      data={feed.items}
      extraData={cardWidth}
      keyExtractor={keyExtractor}
      getItemType={getItemType}
      renderItem={renderItem}
      onEndReached={feed.loadMore}
      onEndReachedThreshold={2}
      onViewableItemsChanged={onViewableItemsChanged}
      refreshing={feed.refreshing}
      onRefresh={feed.refresh}
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{
        ...styles.content,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
      ListHeaderComponent={
        <ListHeader refreshFailed={feed.refreshFailed} onRetry={() => void feed.refresh()} />
      }
      ListFooterComponent={
        <ListFooter
          loading={feed.loadingMore}
          failed={feed.loadMoreFailed}
          onRetry={feed.retryLoadMore}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: CARD_MARGIN,
  },
});
