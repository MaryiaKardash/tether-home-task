import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { FEED_KEY, type FeedData } from '@/data/feedCache';
import { fetchFeedPage } from '@/data/mockFeed';
import { useRemoved } from '@/store/removed';

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
  const items = data?.pages.flatMap((page) => page.items).filter((item) => !removed[item.id]) ?? [];
  const allRemoved = data !== undefined && items.length === 0;

  useEffect(() => {
    if (allRemoved && hasNextPage && !isFetchingNextPage && !isFetchNextPageError && !refreshing) {
      void fetchNextPage();
    }
  }, [
    allRemoved,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    refreshing,
    fetchNextPage,
  ]);

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
      queryClient.setQueryData<FeedData>(FEED_KEY, {
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
    loading: isPending || (allRemoved && isFetchingNextPage),
    loadFailed: (isError && !data) || (allRemoved && isFetchNextPageError),
    exhausted: allRemoved && !hasNextPage,
    refreshing,
    refreshFailed,
    loadingMore: isFetchingNextPage,
    loadMoreFailed: isFetchNextPageError,
    loadMore,
    refresh,
    retryLoadMore: () => void fetchNextPage(),
    reload: () => void (allRemoved ? fetchNextPage() : refetch()),
  };
}
