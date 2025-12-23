/**
 * Layout Engine
 * Automatically groups images into aesthetic slide layouts.
 * 
 * Supports: Grid, Hero, Stacked, Scattered, Bento, Mosaic layouts
 * Randomizes layout selection per slide for visual variety.
 */

import type { ImageAsset, LayoutType, SlideConfig, LayoutConfig } from "@/lib/types";

// Maps "Style Categories" (UI) to specific "Layout Types" (Engine)
const STYLE_TO_LAYOUTS: Record<string, LayoutType[]> = {
    grid: ["grid-2x2", "grid-3x2", "grid-3x3", "bento", "mosaic", "split-vertical"],
    hero: ["hero-left", "hero-right"],
    stacked: ["stacked"],
    scattered: ["scattered"],
};

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

function selectLayoutForCount(count: number, allowedStyles: string[] = []): LayoutType {
    if (count <= 0) return "grid-2x2";

    // 1. Get all technically possible layouts for this image count
    const possibleLayouts = LAYOUTS_BY_COUNT[count] || LARGE_GROUP_LAYOUTS;

    // 2. If no styles specified (or all empty), default to all possible
    if (!allowedStyles || allowedStyles.length === 0) {
        return randomChoice(possibleLayouts);
    }

    // 3. Flatten allowed styles into a Set of allowed LayoutTypes
    const allowedLayoutTypes = new Set<LayoutType>();
    allowedStyles.forEach(style => {
        const types = STYLE_TO_LAYOUTS[style];
        if (types) {
            types.forEach(t => allowedLayoutTypes.add(t));
        }
    });

    // 4. Filter possible layouts against permitted types
    const candidates = possibleLayouts.filter(l => allowedLayoutTypes.has(l));

    // 5. Fallback: If filtering leaves nothing (e.g. user selected "Stacked" but we have 6 images),
    // revert to Grid basics to ensure we show *something*.
    if (candidates.length === 0) {
        // Prefer grid if available in possible list, otherwise just take anything possible
        const fallback = possibleLayouts.find(l => l.startsWith("grid")) || possibleLayouts[0];
        return fallback;
    }

    return randomChoice(candidates);
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
                const paddingImages = shuffledPool.slice(0, needed).map(img => ({
                    ...img,
                    id: `${img.id}_recycled_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`
                }));

                // Add padding images to the group
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
    allowedStyles?: string[];
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
        allowedStyles = ["grid", "hero", "stacked", "scattered"],
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
        const layoutType = selectLayoutForCount(group.length, allowedStyles);

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
export function rerandomizeSlideLayout(slide: SlideConfig, allowedStyles: string[] = []): SlideConfig {
    const imageCount = slide.layout.images.length;
    const newLayoutType = selectLayoutForCount(imageCount, allowedStyles);

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
export function rerandomizeAllLayouts(slides: SlideConfig[], allowedStyles: string[] = []): SlideConfig[] {
    return slides.map(s => rerandomizeSlideLayout(s, allowedStyles));
}
