import type { Photo } from '@/domain/types';

const PHOTOS_URL = 'https://jsonplaceholder.typicode.com/photos';
const TIMEOUT_MS = 15_000;
const BASE_WIDTH = 1080;
const ASPECT_RATIOS = [1, 4 / 5, 3 / 2, 16 / 9, 2 / 3, 3 / 4];

export const PAGE_SIZE = 30;

export interface FeedPage {
  items: Photo[];
  nextCursor: number | null;
}

interface ApiPhoto {
  id: number;
  title: string;
}

function toPhoto({ id, title }: ApiPhoto): Photo {
  const ratio = ASPECT_RATIOS[id % ASPECT_RATIOS.length] ?? 1;
  return { id, title, width: BASE_WIDTH, height: Math.round(BASE_WIDTH / ratio) };
}

export async function fetchFeedPage(
  cursor: number,
  signal?: AbortSignal,
  limit = PAGE_SIZE,
): Promise<FeedPage> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  if (signal?.aborted) controller.abort();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, TIMEOUT_MS);

  try {
    const response = await fetch(`${PHOTOS_URL}?_start=${cursor}&_limit=${limit}`, {
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Loading photos failed with ${response.status}`);
    const body: unknown = await response.json();
    if (!Array.isArray(body)) throw new Error('Unexpected response from the photos API');
    const items = (body as ApiPhoto[]).map(toPhoto);
    return { items, nextCursor: items.length < limit ? null : cursor + items.length };
  } catch (error) {
    if (timedOut) throw new Error('Loading photos timed out');
    throw error;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }
}
