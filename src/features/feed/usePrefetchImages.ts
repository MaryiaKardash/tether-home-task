import type { ViewToken } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { useRef } from 'react';

import { photoUrl } from '@/data/images';
import type { FeedItem } from '@/domain/types';

const PREFETCH_FROM = 3;
const PREFETCH_AHEAD = 6;

export function usePrefetchImages(items: FeedItem[], cardWidth: number) {
  const prefetched = useRef(new Set<string>());

  return ({ viewableItems }: { viewableItems: ViewToken<FeedItem>[] }) => {
    const lastVisible = viewableItems.at(-1)?.index;
    if (lastVisible == null) return;
    const urls = items
      .slice(lastVisible + PREFETCH_FROM, lastVisible + PREFETCH_FROM + PREFETCH_AHEAD)
      .filter((item) => item.kind === 'photo')
      .map((photo) => photoUrl(photo, cardWidth))
      .filter((url) => !prefetched.current.has(url));
    if (urls.length === 0) return;
    urls.forEach((url) => prefetched.current.add(url));
    void Image.prefetch(urls, 'memory-disk');
  };
}
