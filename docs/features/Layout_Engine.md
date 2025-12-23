# Layout Engine

## Goal
The Layout Engine is responsible for intelligently grouping input images into aesthetic slide layouts, ensuring visual variety and robustness for different aspect ratios and image counts.

## Components

### LayoutEngine (`src/features/layout/LayoutEngine.ts`)
- **Role**: Pure logic for grouping images and selecting layout templates.
- **Key Logic**:
    - `groupImagesIntoSlides`: Splits a list of images into chunks. 
        - **Smart Recycling**: If the final group is too small (< 3 images), it "borrows" random images from the rest of the project to ensure dense, aesthetic layouts (avoiding "orphan" slides).
    - `selectLayoutForCount`: Maps image counts (1-6+) to specific layout types (e.g., `grid-2x2`, `bento`).
    - `distributeDurations`: Allocates time to slides based on visual complexity.

### SlideLayout (`src/features/composition/SlideLayout.tsx`)
- **Role**: React/Remotion component that renders the visual layout.
- **Supported Layouts**:
    - **Grid**: 2x2, 3x2, 3x3 grids.
    - **Hero**: Large hero image with side column of thumbnails.
    - **Bento**: Asymmetric grid mimicking bento boxes.
    - **Mosaic**: 2-row asymmetric layout.
    - **Stacked**: Images stacked with z-index cycling animation.
    - **Scattered**: Polaroids scattered on a surface.
- **Focal Points**:
    - Supports user-defined focal points (x/y percentage).
    - Renders a CSS `object-position` rule.
    - **Debug Mode**: Shows a red dot indicator on hover/preview for verifying focal point accuracy.

## Data Flow
1. **Input**: Array of `ImageAsset` (files/blobs).
2. **Process**: `LayoutEngine.generateSlides(images)` -> returns `SlideConfig[]`.
3. **Render**: `Composition` maps `SlideConfig` to `SlideLayout` components.

## Configuration
- `minPerSlide` / `maxPerSlide`: Controls density.
- `padSmallGroups`: (Implicitly true) Ensures minimal density for better visuals.
