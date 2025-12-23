# AutoMosaic

Browser-based slideshow generator built with Next.js 16 + Remotion 4 + Tailwind.

## Quick Start
```bash
pnpm install
pnpm dev
```

## Key Files
- `src/stores/editor-store.ts` - Global state (images, slides, config)
- `src/features/layout/LayoutEngine.ts` - Slide generation logic
- `src/features/composition/` - Remotion compositions

## Design System
Dark theme using Zinc palette. See `/docs/design/design-system.html`.

## Guidelines
- Server Components by default
- Tailwind utility classes only
- Mockups in `/docs/mockups/` are source of truth
