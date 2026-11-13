import type { Photo } from '@/domain/types';

const PHOTOS_URL = 'https://jsonplaceholder.typicode.com/photos';
const TIMEOUT_MS = 15_000;
const BASE_WIDTH = 1080;
const ASPECT_RATIOS = [1, 4 / 5, 3 / 2, 16 / 9, 2 / 3, 3 / 4];

interface ApiPhoto {
  id: number;
  title: string;
}

export async function fetchPhotos(): Promise<Photo[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(PHOTOS_URL, { signal: controller.signal });
    if (!response.ok) throw new Error(`GET /photos failed with ${response.status}`);
    const photos = (await response.json()) as ApiPhoto[];
    return photos.map(({ id, title }) => {
      const ratio = ASPECT_RATIOS[id % ASPECT_RATIOS.length] ?? 1;
      return { id, title, width: BASE_WIDTH, height: Math.round(BASE_WIDTH / ratio) };
    });
  } finally {
    clearTimeout(timer);
  }
}
