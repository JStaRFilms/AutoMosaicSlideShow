# Escalation Handoff Report

**Generated:** 2025-12-23T17:23:48+01:00
**Original Issue:** Fine-Tune Layout Engine (Cut-off images & Blank slides)

---

## PART 1: THE DAMAGE REPORT

### 1.1 Original Goal
The objective was to fine-tune the `LayoutEngine` to prevent "orphan" slides (1-2 images) by recycling images to fill denser layouts, and to fix layout rendering issues where images were being cut off or not appearing.

### 1.2 Observed Failure / Error
Despite implementing image recycling and explicit grid row calculations:
1.  **Cut-off Images:** Users still report images being cut off in the grid layouts (`HeroLayout` specifically mentioned).
2.  **Blank Slots:** Users see blank spaces where images should be, even though the logic supposedly "pads" the slide with recycled images.

### 1.3 Failed Approach
1.  **Padding Logic:** Modifying `groupImagesIntoSlides` in `LayoutEngine.ts` to pad small groups with random images from the project.
    -   *Failure Point:* I suspect I am pushing the *same* image objects (by reference) into the array. When `SlideLayout` renders them, it uses `key={i}`, which *should* be fine, but if the component logic inside relies on `img.id` for anything unique (or if `Remotion` caching behaves oddly with identical object references), this could be the cause of blanks. Wait, `SlideLayout` uses `key={i}` for the wrapper, but if the `Img` component or internal React reconciliation gets confused by identical properties, it might be an issue. **Update:** `SlideLayout` maps `images.map((img, i) => ... key={i})`.
2.  **Explicit Row Math:** Updating `SlideLayout.tsx` to calculate `gridTemplateRows` explicitly based on `Math.ceil(images.length / cols)`.
    -   *Failure Point:* `HeroLayout` sidebar might still be miscalculating height, or `min-height` constraints on the container are causing overflow.

### 1.4 Key Files Involved
- `src/features/layout/LayoutEngine.ts` (Logic for grouping/padding)
- `src/features/composition/SlideLayout.tsx` (Render logic for grids)

### 1.5 Best-Guess Diagnosis
1.  **Blank Images (Critical):** The "recycling" logic in `LayoutEngine.ts` pushes existing image objects into the new group. `group.push(...paddingImages)`. These objects share the same `id`. If any downstream component uses `id` as a key (or if Remotion does internally), this causes collisions. The fix requires cloning the image object and assigning a new ephemeral `id` (e.g., `original-id_recycled_timestamp`).
2.  **Cut-off Images:** likely a CSS Grid vs Flexbox conflict. `gridTemplateRows: repeat(N, 1fr)` works well if the container has a defined height. In Remotion, `AbsoluteFill` provides that. However, if the `gap` calculation + `1fr` rows exceeds 100% due to box-sizing or precision issues, the last row gets clipped. We might need `minmax(0, 1fr)` or safer gap handling.

---

## PART 2: FULL FILE CONTENTS (Self-Contained)

### File: `src/features/layout/LayoutEngine.ts`
```typescript
/**
 * Layout Engine
 * Automatically groups images into aesthetic slide layouts.
 * 
 * Supports: Grid, Hero, Stacked, Scattered, Bento, Mosaic layouts
 * Randomizes layout selection per slide for visual variety.
 */

import type { ImageAsset, LayoutType, SlideConfig, LayoutConfig } from "@/lib/types";

// ============================================
// Layout Templates by Image Count
// ============================================

const LAYOUTS_BY_COUNT: Record<number, LayoutType[]> = {
    1: ["hero-left", "hero-right"], // Single hero image
    2: ["split-vertical", "hero-left", "hero-right"],
    3: ["mosaic", "stacked", "scattered", "hero-left"],
    4: ["grid-2x2", "hero-left", "hero-right", "bento"],
    5: ["grid-3x2"], // Bento only supports 4 slots currently
    6: ["grid-3x2", "grid-3x3"],
};

// Fallback for 7+ images
const LARGE_GROUP_LAYOUTS: LayoutType[] = ["grid-3x3", "grid-3x2"];

// ============================================
// Utility Functions
// ============================================

function randomChoice<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray<T>(arr: T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

function generateId(): string {
    return `slide-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ============================================
// Layout Selection
// ============================================

function selectLayoutForCount(count: number): LayoutType {
    if (count <= 0) return "grid-2x2";

    const layouts = LAYOUTS_BY_COUNT[count] || LARGE_GROUP_LAYOUTS;
    return randomChoice(layouts);
}

// ============================================
// Image Grouping Strategy
// ============================================

interface GroupingOptions {
    minPerSlide: number;
    maxPerSlide: number;
    preferVariety: boolean;
}

const DEFAULT_GROUPING: GroupingOptions = {
    minPerSlide: 1,
    maxPerSlide: 6,
    preferVariety: true,
};

function groupImagesIntoSlides(
    images: ImageAsset[],
    options: GroupingOptions = DEFAULT_GROUPING
): ImageAsset[][] {
    if (images.length === 0) return [];

    const { minPerSlide, maxPerSlide, preferVariety } = options;
    const groups: ImageAsset[][] = [];
    let remaining = [...images];

    // standard grouping logic
    while (remaining.length > 0) {
        // Vary group size for visual interest
        let groupSize: number;

        if (preferVariety && remaining.length > maxPerSlide) {
            // Random size between min and max for variety
            groupSize = Math.floor(
                Math.random() * (maxPerSlide - minPerSlide + 1) + minPerSlide
            );
        } else {
            // Take all remaining if under max
            groupSize = Math.min(remaining.length, maxPerSlide);
        }

        // Ensure we don't leave orphan images
        // If the remaining after this group would be too small to form a valid slide (less than minPerSlide)
        // then just take everything now.
        if (remaining.length - groupSize < minPerSlide && remaining.length > groupSize) {
            groupSize = remaining.length;
        }

        groups.push(remaining.slice(0, groupSize));
        remaining = remaining.slice(groupSize);
    }

    // Post-process: Pad small groups (specifically the last one) with recycled images
    // to ensure better layouts (e.g., minimum 3 images for density).
    const MIN_DENSE_COUNT = 3;
    const TARGET_PAD_COUNT = 4; // Target size when padding (good for 2x2 grid)

    groups.forEach((group, index) => {
        // Only pad if:
        // 1. It's a small group (< 3)
        // 2. We have enough total images in the project to borrow from
        // 3. It's not the ONLY group (unless we really want to repeat images in a single slide? No, that's weird)
        if (group.length < MIN_DENSE_COUNT && images.length >= TARGET_PAD_COUNT) {
            const needed = TARGET_PAD_COUNT - group.length;

            // Pool of potential images to recycle (all images excluding current group members)
            const currentIds = new Set(group.map(img => img.id));
            const pool = images.filter(img => !currentIds.has(img.id));

            if (pool.length >= needed) {
                const shuffledPool = shuffleArray(pool);
                const paddingImages = shuffledPool.slice(0, needed);

                // Add padding images to the group
                // We modify the array in place (since it's a reference)
                // but let's be safer and reassign or push
                group.push(...paddingImages);
            }
        }
    });

    return groups;
}

// ============================================
// Duration Distribution (FR-011)
// ============================================

interface DurationOptions {
    totalDurationSeconds: number;
    fps: number;
    slides: SlideConfig[];
}

/**
 * Smart Duration Distribution
 * Allocates time based on slide complexity (more images = more time)
 */
export function distributeDurations(
    slides: SlideConfig[],
    totalDurationSeconds: number,
    fps: number
): SlideConfig[] {
    if (slides.length === 0) return [];

    const totalFrames = totalDurationSeconds * fps;

    // Calculate complexity weights (more images = higher weight)
    const weights = slides.map((slide) => {
        const imageCount = slide.layout.images.length;
        // Base weight + bonus for multi-image layouts
        return 1 + imageCount * 0.3;
    });

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    // Distribute frames proportionally
    return slides.map((slide, i) => ({
        ...slide,
        durationFrames: Math.round((weights[i] / totalWeight) * totalFrames),
    }));
}

// ============================================
// Main Layout Engine
// ============================================

export interface LayoutEngineOptions {
    gap?: number;
    minPerSlide?: number;
    maxPerSlide?: number;
    totalDurationSeconds?: number;
    fps?: number;
}

/**
 * Main export: Generate slides from images
 */
export function generateSlides(
    images: ImageAsset[],
    options: LayoutEngineOptions = {}
): SlideConfig[] {
    const {
        gap = 24,
        minPerSlide = 1,
        maxPerSlide = 6,
        totalDurationSeconds = 30,
        fps = 30,
    } = options;

    if (images.length === 0) return [];

    // 1. Group images into slides
    const groups = groupImagesIntoSlides(images, {
        minPerSlide,
        maxPerSlide,
        preferVariety: true,
    });

    // 2. Assign layouts to each group
    const slides: SlideConfig[] = groups.map((group) => {
        const layoutType = selectLayoutForCount(group.length);

        return {
            id: generateId(),
            layout: {
                type: layoutType,
                images: group,
                gap,
            },
            durationFrames: 0, // Will be calculated
        };
    });

    // 3. Distribute durations intelligently
    return distributeDurations(slides, totalDurationSeconds, fps);
}

// ============================================
// Layout Re-randomization
// ============================================

/**
 * Re-randomize layout for a single slide
 */
export function rerandomizeSlideLayout(slide: SlideConfig): SlideConfig {
    const imageCount = slide.layout.images.length;
    const newLayoutType = selectLayoutForCount(imageCount);

    return {
        ...slide,
        layout: {
            ...slide.layout,
            type: newLayoutType,
        },
    };
}

/**
 * Re-randomize all slide layouts
 */
export function rerandomizeAllLayouts(slides: SlideConfig[]): SlideConfig[] {
    return slides.map(rerandomizeSlideLayout);
}
```

### File: `src/features/composition/SlideLayout.tsx`
```tsx
"use client";

/**
 * Slide Layout Renderer
 * Renders images according to the selected layout template.
 * Implements layout visuals for Grid, Hero, Stacked, Scattered, etc.
 */

import { AbsoluteFill, Img, useCurrentFrame, interpolate } from "remotion";
import type { LayoutType, ImageAsset } from "@/lib/types";

// ============================================
// Layout Component Props
// ============================================

interface ImageWithFocalPoint {
    id: string;
    url: string;
    focalPoint?: { x: number; y: number };
}

interface SlideLayoutProps {
    images: ImageWithFocalPoint[];
    layoutType: LayoutType;
    gap: number;
    backgroundColor: string;
    durationInFrames: number;
}

// ============================================
// Internal Components
// ============================================

function FocalAwareImage({ image, className }: { image: ImageWithFocalPoint | { id?: string; url: string; focalPoint?: { x: number; y: number } }, className?: string }) {
    return (
        <div className={`relative overflow-hidden w-full h-full group ${className || ''}`}>
            <Img
                src={image.url}
                className="w-full h-full object-cover"
                style={{
                    objectPosition: image.focalPoint
                        ? `${image.focalPoint.x}% ${image.focalPoint.y}%`
                        : 'center',
                }}
            />
            {/* Visual Debug Indicator for Focal Point */}
            {image.focalPoint && (
                <div
                    className="absolute w-2 h-2 bg-red-500 rounded-full border border-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10"
                    style={{
                        left: `${image.focalPoint.x}%`,
                        top: `${image.focalPoint.y}%`,
                        transform: 'translate(-50%, -50%)',
                        boxShadow: '0 0 4px rgba(0,0,0,0.5)'
                    }}
                />
            )}
        </div>
    );
}

// ============================================
// Grid Layouts
// ============================================

function GridLayout({
    images,
    gap,
    cols
}: {
    images: ImageWithFocalPoint[];
    gap: number;
    cols: number;
}) {
    // Explicitly calculate rows to ensure they fill the height evenly
    // Otherwise, implicit rows might behave unexpectedly with h-full children
    const rowCount = Math.ceil(images.length / cols);

    return (
        <div
            className="w-full h-full grid"
            style={{
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                // Default to at least 1 row to prevent collapse if empty
                gridTemplateRows: `repeat(${Math.max(rowCount, 1)}, 1fr)`,
                gap: `${gap}px`,
                padding: `${gap}px`,
            }}
        >
            {images.map((img, i) => (
                <div key={i} className="relative overflow-hidden rounded-lg">
                    <FocalAwareImage image={img} />
                </div>
            ))}
        </div>
    );
}

// ============================================
// Hero Layout (Large image + smaller thumbnails)
// ============================================

function HeroLayout({
    images,
    gap,
    heroPosition,
}: {
    images: ImageWithFocalPoint[];
    gap: number;
    heroPosition: "left" | "right";
}) {
    if (images.length === 0) return null;

    const [hero, ...rest] = images;

    // We restrict the sidebar to at most 4 images
    const MAX_SIDEBAR_IMAGES = 4;
    const sidebarImages = rest.slice(0, MAX_SIDEBAR_IMAGES);
    const sidebarRowCount = Math.max(sidebarImages.length, 1);

    return (
        <div
            className="w-full h-full grid"
            style={{
                gridTemplateColumns: heroPosition === "left" ? "2fr 1fr" : "1fr 2fr",
                gap: `${gap}px`,
                padding: `${gap}px`,
            }}
        >
            {heroPosition === "left" && (
                <div className="relative overflow-hidden rounded-lg row-span-full">
                    <FocalAwareImage image={hero} />
                </div>
            )}

            <div
                className="grid h-full"
                style={{ 
                    gridTemplateRows: `repeat(${sidebarRowCount}, 1fr)`, 
                    gap: `${gap}px` 
                }}
            >
                {sidebarImages.map((img, i) => (
                    <div key={i} className="relative overflow-hidden rounded-lg">
                        <FocalAwareImage image={img} />
                    </div>
                ))}
            </div>

            {heroPosition === "right" && (
                <div className="relative overflow-hidden rounded-lg row-span-full">
                     <FocalAwareImage image={hero} />
                </div>
            )}
        </div>
    );
}

// ============================================
// Stacked Layout (FR-010: Z-index cycling)
// ============================================

function StackedLayout({
    images,
    durationInFrames,
}: {
    images: ImageWithFocalPoint[];
    durationInFrames: number;
}) {
    const frame = useCurrentFrame();
    const imageCount = images.length;

    if (imageCount === 0) return null;

    // Duration per image being "on top"
    const framesPerImage = durationInFrames / imageCount;

    return (
        <AbsoluteFill className="flex items-center justify-center">
            {images.map((img, i) => {
                // Calculate which image should be on top at current frame
                const cyclePosition = Math.floor(frame / framesPerImage) % imageCount;
                const relativeIndex = (i - cyclePosition + imageCount) % imageCount;

                // Animate position and scale based on z-index
                const baseOffsetX = (i - imageCount / 2) * 30;
                const baseOffsetY = (i - imageCount / 2) * 20;
                const baseRotation = (i - imageCount / 2) * 3;
                const baseScale = 1 - relativeIndex * 0.05;

                // Smooth transition when cycling
                const progress = (frame % framesPerImage) / framesPerImage;
                const scale = interpolate(progress, [0, 0.5, 1], [baseScale, baseScale * 1.02, baseScale]);

                return (
                    <div
                        key={i}
                        className="absolute"
                        style={{
                            width: "70%",
                            height: "70%",
                            transform: `
                translateX(${baseOffsetX}px) 
                translateY(${baseOffsetY}px) 
                rotate(${baseRotation}deg) 
                scale(${scale})
              `,
                            zIndex: imageCount - relativeIndex,
                            boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
                        }}
                    >
                        <div className="w-full h-full rounded-lg border-2 border-white/10 overflow-hidden">
                             <FocalAwareImage image={img} />
                        </div>
                    </div>
                );
            })}
        </AbsoluteFill>
    );
}

// ============================================
// Scattered Layout (Random positioning)
// ============================================

function ScatteredLayout({
    images,
    gap,
}: {
    images: ImageWithFocalPoint[];
    gap: number;
}) {
    // Pre-calculated positions for consistent renders
    const positions = [
        { x: 10, y: 10, w: 50, h: 50, z: 1 },
        { x: 45, y: 40, w: 40, h: 40, z: 2 },
        { x: 15, y: 55, w: 35, h: 35, z: 3 },
        { x: 60, y: 15, w: 30, h: 45, z: 4 },
        { x: 55, y: 60, w: 35, h: 30, z: 5 },
        ];

    return (
        <AbsoluteFill style={{ padding: gap }}>
            {images.slice(0, 5).map((img, i) => {
                const pos = positions[i % positions.length];
                return (
                    <div
                        key={i}
                        className="absolute rounded-lg overflow-hidden"
                        style={{
                            left: `${pos.x}%`,
                            top: `${pos.y}%`,
                            width: `${pos.w}%`,
                            height: `${pos.h}%`,
                            zIndex: pos.z,
                            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                        }}
                    >
                        <FocalAwareImage image={img} />
                    </div>
                );
            })}
        </AbsoluteFill>
    );
}

// ============================================
// Mosaic Layout (2-row asymmetric)
// ============================================

function MosaicLayout({
    images,
    gap,
}: {
    images: { url: string; focalPoint?: { x: number, y: number } }[];
    gap: number;
}) {
    if (images.length === 0) return null;

    return (
        <div
            className="w-full h-full grid"
            style={{
                gridTemplateColumns: "1fr 1fr",
                gridTemplateRows: "1fr 1fr",
                gap: `${gap}px`,
                padding: `${gap}px`,
            }}
        >
            {/* First image spans full width */}
            <div className="col-span-2 relative overflow-hidden rounded-lg">
                <FocalAwareImage image={images[0]} />
            </div>

            {/* Bottom two images */}
            {images.slice(1, 3).map((img, i) => (
                <div key={i} className="relative overflow-hidden rounded-lg">
                    <FocalAwareImage image={img} />
                </div>
            ))}
        </div>
    );
}

// ============================================
// Bento Layout (Mixed sizes)
// ============================================

function BentoLayout({
    images,
    gap,
}: {
    images: { url: string; focalPoint?: { x: number, y: number } }[];
    gap: number;
}) {
    return (
        <div
            className="w-full h-full grid"
            style={{
                gridTemplateColumns: "repeat(4, 1fr)",
                gridTemplateRows: "repeat(2, 1fr)",
                gap: `${gap}px`,
                padding: `${gap}px`,
            }}
        >
            {images[0] && (
                <div className="col-span-2 row-span-2 relative overflow-hidden rounded-lg">
                    <FocalAwareImage image={images[0]} />
                </div>
            )}
            {images[1] && (
                <div className="col-span-2 relative overflow-hidden rounded-lg">
                    <FocalAwareImage image={images[1]} />
                </div>
            )}
            {images.slice(2, 4).map((img, i) => (
                <div key={i} className="relative overflow-hidden rounded-lg">
                    <FocalAwareImage image={img} />
                </div>
            ))}
        </div>
    );
}

// ============================================
// Main Slide Layout Component
// ============================================

export function SlideLayout({
    images,
    layoutType,
    gap,
    backgroundColor,
    durationInFrames,
}: SlideLayoutProps) {
    return (
        <AbsoluteFill style={{ backgroundColor }}>
            {renderLayout(images, layoutType, gap, durationInFrames)}
        </AbsoluteFill>
    );
}

function renderLayout(
    images: ImageWithFocalPoint[],
    layoutType: LayoutType,
    gap: number,
    durationInFrames: number
) {
    switch (layoutType) {
        case "grid-2x2":
            return <GridLayout images={images} gap={gap} cols={2} />;
        case "grid-3x2":
            return <GridLayout images={images} gap={gap} cols={3} />;
        case "grid-3x3":
            return <GridLayout images={images} gap={gap} cols={3} />;
        case "hero-left":
            return <HeroLayout images={images} gap={gap} heroPosition="left" />;
        case "hero-right":
            return <HeroLayout images={images} gap={gap} heroPosition="right" />;
        case "bento":
            return <BentoLayout images={images} gap={gap} />;
        case "mosaic":
            return <MosaicLayout images={images} gap={gap} />;
        case "split-vertical":
            return <GridLayout images={images} gap={gap} cols={2} />;
        case "stacked":
            return <StackedLayout images={images} durationInFrames={durationInFrames} />;
        case "scattered":
            return <ScatteredLayout images={images} gap={gap} />;
        default:
            return <GridLayout images={images} gap={gap} cols={2} />;
    }
}

```

---

## PART 3: DIRECTIVE FOR ORCHESTRATOR

**Attention: Senior AI Orchestrator**

You have received this Escalation Handoff Report. A local agent has failed to solve this problem.

**Your Directive:**
1.  **Analyze the Failure:** Focus on the `groupImagesIntoSlides` function. It likely pushes identical image references into the array for recycling. When React renders this list, duplicate identities/references might be causing rendering issues (blanks).
2.  **Formulate a New Plan:**
    -   **Fix Recycling:** Modify the padding logic to deep-clone the image object and assign a *new specific ID* (e.g., `recycled-uuid`).
    -   **Fix Rows:** Double check `minmax` usage in CSS grid.
3.  **Execute:** Implement these fixes immediately.

**Begin your analysis now.**
