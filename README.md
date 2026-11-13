# Tether Feed

A Tether home task with a long, fast feed: 5,000 mixed items (photos of different
heights and text posts), interactive cards, and a photo detail screen you close by dragging.

## Running it

Requirements: Node 22 and pnpm 10.

```bash
pnpm install
pnpm start
```

Then press `i` for the iOS simulator or `a` for Android, or scan the QR code with Expo Go.
Everything the app uses (FlashList, Reanimated, Gesture Handler, expo-image) ships with Expo Go,
so no native build is needed. If the dev client opens instead of Expo Go, start with
`pnpm start --go`.

Development mode is much slower than a real build, especially on Android. To judge scrolling, run
Metro in production mode:

```bash
pnpm start --go --no-dev --minify
```

Other scripts:

| Script                 | What it does            |
| ---------------------- | ----------------------- |
| `pnpm typecheck`       | TypeScript, strict mode |
| `pnpm lint`            | ESLint (Expo config)    |
| `pnpm format`          | Prettier                |
| `pnpm ios` / `android` | Native dev build        |

## Native builds (prebuild)

The app depends on native modules: Reanimated 4 (with `react-native-worklets`), Gesture Handler,
FlashList, expo-image and expo-dev-client. The `ios/` and `android/` folders are not committed.
They are generated from `app.json` and the installed packages with Expo prebuild, and are listed in
`.gitignore`.

Generate them:

```bash
pnpm expo prebuild
```

Regenerate from scratch after adding or upgrading a native package, or after changing `plugins` in
`app.json`:

```bash
pnpm expo prebuild --clean
```

`pnpm ios` and `pnpm android` run prebuild automatically when the folders are missing, then build
the app, install it on the simulator or emulator and start Metro. Because `expo-dev-client` is
installed, `pnpm start` opens that development build by default; use `pnpm start --go` for Expo Go
instead.

For performance checks, build in Release:

```bash
pnpm expo run:ios --configuration Release
```

```bash
pnpm expo run:android --variant release
```

Notes:

- Reanimated 4 needs the New Architecture, which is on by default in Expo SDK 58. Its Babel plugin
  is added by `babel-preset-expo` when `react-native-worklets` is installed, so there is no
  `babel.config.js`.

## What's in the app

- **Feed** of 5,000 items, loaded 30 at a time with pull to refresh and infinite scroll.
- **Two card types**: photo cards (six aspect ratios) and text posts (every fifth item).
- **Like button** with a small pop animation.
- **Swipe a card left or right** to remove it. A red "Remove" strip shows behind the card while
  you drag, and the feed shows a one-line tip until the first card is removed.
- **Photo detail**: tap a photo to open it full screen, drag it up or down to close. The backdrop
  fades and the photo shrinks a little as you drag; let go early and it springs back.
- Light and dark mode.

## Stack

- Expo SDK 58, React Native 0.88, New Architecture, React Compiler
- expo-router for navigation (typed routes)
- `@shopify/flash-list` v2 for the list
- `react-native-reanimated` v4 and `react-native-gesture-handler` v3 for animations and gestures
- `expo-image` for loading and caching images
- TanStack Query for paging, zustand for likes and removed cards

## Project structure

```
src/
  app/                 routes: feed (index) and photo/[id] (transparent modal)
  data/
    mockFeed.ts        builds the 5,000 items and serves them in pages
    images.ts          image URL for a photo at an exact pixel size
    feedCache.ts       query key for the feed and lookup of a loaded photo by id
  domain/types.ts      FeedItem = Photo | TextPost
  features/
    feed/              FeedScreen, PhotoCard, TextCard, LikeButton, SwipeToRemove,
                       FeedStatus (empty, header, footer), useFeed, usePrefetchImages
    detail/            PhotoDetailScreen (drag to dismiss)
  store/               likes and removed cards (zustand)
  theme/               colors (light/dark), card layout and animation constants
```

## Data

The feed is generated locally in `src/data/mockFeed.ts`. Item `N` is always the same, so the feed
looks identical on every run. `fetchFeedPage(cursor)` returns 30 items after a 300 ms delay so
loading states behave like a real API; swapping it for a real endpoint only means replacing that
one function.

Photo files come from the Unsplash CDN. There are 40 photos that repeat across the feed; each card
asks for its photo at the exact pixel size it will be shown at, cropped to its aspect ratio.

## How the feed stays smooth

- **No measuring.** Every item knows its size before it renders: photos carry width and height,
  so the image box is reserved with `aspectRatio` and nothing jumps when the picture loads.
- **Recycling.** FlashList reuses cells, grouped only by kind (`photo` / `text`). Cards keep no
  local state that could leak into a reused cell: likes and removed cards live in stores keyed by
  id, and expo-image gets a `recyclingKey`.
- **Right-sized images.** Each card requests its image at its own pixel width, so the device never
  decodes a larger image than it shows.
- **Prefetching.** As you scroll, images for the next few cards (starting three past the last
  visible one) are downloaded ahead of time, each URL only once.
- **Loading early.** The next page starts loading when you're two screens from the end, so the
  list normally never reaches the spinner.
- **Animations on the UI thread.** The like pop, the swipe, the red strip and the detail drag all
  run in Reanimated worklets. JavaScript is only called at the end of a gesture (to remove a card
  or close the screen).
- **Light cards.** The like button reads only its own item from the store, so a tap re-renders one
  button. The swipe strip is mounted only on the card being swiped. Cards don't clip to rounded
  corners (the image rounds its own corners), which is expensive on Android.

## Known gaps

- Likes and removed cards are kept in memory only and reset when the app restarts.

## Improvements

Things I would do next, roughly in order:

- **Keep likes and removed cards** across restarts with zustand's `persist` (MMKV or
  AsyncStorage), and add an "Undo" snackbar after removing a card.
- **Collapsible header** that hides while scrolling down and comes back on scroll up, driven by the
  list's scroll position on the UI thread.
- **Better placeholders:** BlurHash or ThumbHash previews instead of a flat color while photos
  load.
- **Haptics** on like and on remove.
- **Real backend:** replace `fetchFeedPage` with a cursor-based API and keep the TanStack Query
  cache on disk so the feed opens instantly offline.
- **Tests and CI:** unit tests for paging and the stores, end-to-end flows (Maestro) for scrolling,
  swiping and the detail drag, and frame-rate runs on a low-end Android device (Flashlight) on
  every pull request.
