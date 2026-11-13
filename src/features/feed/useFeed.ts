import { type InfiniteData, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { type FeedPage, fetchFeedPage } from '@/data/mockFeed';
import { useRemoved } from '@/store/removed';

export const FEED_KEY = ['feed'] as const;
const FIRST_PAGE_KEY = ['feed', 'first-page'] as const;

export function useFeed() {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshFailed, setRefreshFailed] = useState(false);

  const {
    data,
    isPending,
    isError,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: FEED_KEY,
    queryFn: ({ pageParam }) => fetchFeedPage(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  const removed = useRemoved((state) => state.removed);
  const items =
    data?.pages.flatMap((page) => page.items).filter((photo) => !removed[photo.id]) ?? [];

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage && !isFetchNextPageError && !refreshing) {
      void fetchNextPage();
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    setRefreshFailed(false);
    try {
      await queryClient.cancelQueries({ queryKey: FEED_KEY, exact: true });
      const first = await queryClient.fetchQuery({
        queryKey: FIRST_PAGE_KEY,
        queryFn: () => fetchFeedPage(0),
        staleTime: 0,
      });
      queryClient.setQueryData<InfiniteData<FeedPage, number>>(FEED_KEY, {
        pages: [first],
        pageParams: [0],
      });
    } catch {
      setRefreshFailed(true);
    } finally {
      setRefreshing(false);
    }
  };

  return {
    items,
    loading: isPending,
    loadFailed: isError && !data,
    refreshing,
    refreshFailed,
    loadingMore: isFetchingNextPage,
    loadMoreFailed: isFetchNextPageError,
    loadMore,
    refresh,
    retryLoadMore: () => void fetchNextPage(),
    reload: () => void refetch(),
  };
}
