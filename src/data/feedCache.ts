import { type InfiniteData, useQueryClient } from '@tanstack/react-query';

import type { Photo } from '@/domain/types';

import type { FeedPage } from './mockFeed';

export const FEED_KEY = ['feed'] as const;

export type FeedData = InfiniteData<FeedPage, number>;

export function useCachedPhoto(id: number): Photo | undefined {
  const queryClient = useQueryClient();
  return queryClient
    .getQueryData<FeedData>(FEED_KEY)
    ?.pages.flatMap((page) => page.items)
    .find((item): item is Photo => item.kind === 'photo' && item.id === id);
}
