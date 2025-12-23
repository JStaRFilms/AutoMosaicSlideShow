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
    5: ["bento", "grid-3x2"],
    6: ["grid-3x2", "grid-3x3", "bento"],
};

// Fallback for 7+ images
const LARGE_GROUP_LAYOUTS: LayoutType[] = ["grid-3x3", "grid-3x2", "bento"];

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
        if (remaining.length - groupSize < minPerSlide && remaining.length > groupSize) {
            groupSize = remaining.length;
        }

        groups.push(remaining.slice(0, groupSize));
        remaining = remaining.slice(groupSize);
    }

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
