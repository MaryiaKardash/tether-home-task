import type { FeedItem } from '@/domain/types';

export const PAGE_SIZE = 30;
export const TOTAL_ITEMS = 5000;

const TEXT_EVERY = 5;
const DELAY_MS = 300;
const BASE_WIDTH = 1080;
const ASPECT_RATIOS = [1, 4 / 5, 3 / 2, 16 / 9, 2 / 3, 3 / 4];

const TITLES = [
  'Morning light over the lake',
  'Quiet trail after the rain',
  'Last stop before the pass',
  'Fog rolling in from the valley',
  'Camp spot with a view',
  'Golden hour on the ridge',
  'A slow day by the water',
  'First snow on the peaks',
  'Wildflowers along the path',
  'Sunset from the old bridge',
  'Into the forest again',
  'Clear skies, cold hands',
];

const SENTENCES = [
  'We started before sunrise to beat the crowds.',
  'The road up was narrow, but the view at the top made up for it.',
  'Packed too much food again, which nobody complained about.',
  'The weather changed three times in one afternoon.',
  'Found a small cafe at the bottom of the hill that is worth the detour.',
  'Next time I will bring a lighter tripod.',
  'Water was colder than it looked.',
  'Most of the trail is easy, the last kilometre is not.',
  'We waited an hour for the clouds to clear and it was worth it.',
  'Battery died right before the best part of the day.',
];

export interface FeedPage {
  items: FeedItem[];
  nextCursor: number | null;
}

function makeItem(id: number): FeedItem {
  const title = TITLES[id % TITLES.length] ?? '';

  if (id % TEXT_EVERY === 0) {
    const count = 1 + (id % 4);
    const body = Array.from(
      { length: count },
      (_, i) => SENTENCES[(id + i) % SENTENCES.length],
    ).join(' ');
    return { kind: 'text', id, title, body };
  }

  const ratio = ASPECT_RATIOS[id % ASPECT_RATIOS.length] ?? 1;
  return { kind: 'photo', id, title, width: BASE_WIDTH, height: Math.round(BASE_WIDTH / ratio) };
}

let allItems: FeedItem[] | null = null;

function getAllItems(): FeedItem[] {
  allItems ??= Array.from({ length: TOTAL_ITEMS }, (_, i) => makeItem(i + 1));
  return allItems;
}

export async function fetchFeedPage(cursor: number, limit = PAGE_SIZE): Promise<FeedPage> {
  await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
  const items = getAllItems().slice(cursor, cursor + limit);
  const next = cursor + items.length;
  return { items, nextCursor: next < TOTAL_ITEMS ? next : null };
}
