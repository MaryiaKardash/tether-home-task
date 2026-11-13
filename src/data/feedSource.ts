import type { Photo } from '@/domain/types';

import { fetchPhotos } from './api';

export const PAGE_SIZE = 30;

export interface FeedPage {
  items: Photo[];
  nextCursor: number | null;
}

let cache: Promise<Photo[]> | null = null;

function loadAll(): Promise<Photo[]> {
  cache ??= fetchPhotos().catch((error: unknown) => {
    cache = null;
    throw error;
  });
  return cache;
}

export async function fetchFeedPage(cursor = 0, limit = PAGE_SIZE): Promise<FeedPage> {
  const all = await loadAll();
  const end = Math.min(cursor + limit, all.length);
  return { items: all.slice(cursor, end), nextCursor: end < all.length ? end : null };
}

export function resetFeed(): void {
  cache = null;
}
