# YGO Vault Next

A modern, offline-first Yu-Gi-Oh! card collection manager built with React, TypeScript, and Vite.

## Features

- **Collection Management** — Add, edit, delete, search, filter, and sort your card collection
- **Deck Builder** — Create and manage decks with Main/Extra/Side zones
- **Analytics** — Collection stats, rarity distribution, value tracking with charts
- **Import/Export** — JSON import/export with drag-and-drop, legacy format support
- **Themes** — Blue-Eyes, Dark Magician, Exodia themes in light/dark modes
- **Offline-First** — All data stored locally in IndexedDB via Dexie
- **PWA** — Installable as a standalone app on mobile and desktop

## Tech Stack

- **React 19** + TypeScript
- **Vite 8** (build tool)
- **Zustand** (state management)
- **Dexie** (IndexedDB)
- **Fuse.js** (fuzzy search)
- **Recharts** (charts)
- **Zod** (validation)
- **CSS Modules** (styling)

## Setup

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

## Project Structure

```
src/
├── app/            # Router, shell layout, providers, entry point
├── features/       # Feature modules (collection, decks, analytics, settings, etc.)
├── core/           # Shared logic (types, schemas, storage, theme, utils)
├── shared/         # Reusable UI components and styles
└── assets/         # Images, icons
```

## Mobile Testing

After running `npm run dev`, Vite shows a local URL (e.g. `http://localhost:5173`).
To test on a phone on the same Wi-Fi network, use the Network URL shown in the terminal.

## Deploy

The project builds to the `dist/` folder. Compatible with any static hosting (Vercel, Netlify, GitHub Pages, etc.).

For Vercel: connect the repo and it will auto-detect Vite. No extra config needed.
