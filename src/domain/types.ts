export interface Photo {
  kind: 'photo';
  id: number;
  title: string;
  width: number;
  height: number;
}

export interface TextPost {
  kind: 'text';
  id: number;
  title: string;
  body: string;
}

export type FeedItem = Photo | TextPost;
