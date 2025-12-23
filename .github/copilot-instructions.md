# AutoMosaic - AI Assistant Context

## Project Overview
AutoMosaic is a browser-based slideshow/mosaic video generator built with Next.js 16 + Remotion 4 + Tailwind CSS.

## Tech Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Video Engine**: Remotion 4 (@remotion/player, @remotion/transitions)
- **Styling**: Tailwind CSS 4 with custom design tokens
- **State**: Zustand
- **Validation**: Zod
- **Icons**: Lucide React

## Project Structure
```
src/
├── app/              # Next.js App Router pages
├── components/ui/    # Reusable UI components (Header, Sidebar, Canvas, Timeline)
├── features/         # Feature-sliced design
│   ├── composition/  # Remotion compositions, layouts, transitions
│   ├── editor/       # Main editor page
│   ├── layout/       # Layout engine logic
│   └── upload/       # Drag-and-drop uploader
├── lib/              # Types, utilities
└── stores/           # Zustand stores
```

## Key Guidelines
1. **Server Components by default** - Only use `'use client'` for interactivity
2. **Tailwind utility classes only** - No external CSS
3. **Zod for validation** - All props and API inputs
4. **Zustand for state** - Global editor state in `src/stores/editor-store.ts`
5. **Mockup-driven UI** - `/docs/mockups/` is source of truth

## Commands
```bash
pnpm dev      # Development server
pnpm build    # Production build
pnpm lint     # ESLint
```
