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
    return (
        <div
            className="w-full h-full grid"
            style={{
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gap: `${gap}px`,
                padding: `${gap}px`,
            }}
        >
            {images.map((img, i) => (
                <div key={i} className="relative overflow-hidden rounded-lg">
                    <Img
                        src={img.url}
                        className="w-full h-full object-cover"
                        style={{
                            objectPosition: img.focalPoint
                                ? `${img.focalPoint.x}% ${img.focalPoint.y}%`
                                : 'center',
                        }}
                    />
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
                    <Img
                        src={hero.url}
                        className="w-full h-full object-cover"
                        style={{
                            objectPosition: hero.focalPoint
                                ? `${hero.focalPoint.x}% ${hero.focalPoint.y}%`
                                : 'center',
                        }}
                    />
                </div>
            )}

            <div
                className="grid"
                style={{ gridTemplateRows: `repeat(${Math.max(rest.length, 1)}, 1fr)`, gap: `${gap}px` }}
            >
                {rest.slice(0, 4).map((img, i) => (
                    <div key={i} className="relative overflow-hidden rounded-lg">
                        <Img
                            src={img.url}
                            className="w-full h-full object-cover"
                            style={{
                                objectPosition: img.focalPoint
                                    ? `${img.focalPoint.x}% ${img.focalPoint.y}%`
                                    : 'center',
                            }}
                        />
                    </div>
                ))}
            </div>

            {heroPosition === "right" && (
                <div className="relative overflow-hidden rounded-lg row-span-full">
                    <Img
                        src={hero.url}
                        className="w-full h-full object-cover"
                        style={{
                            objectPosition: hero.focalPoint
                                ? `${hero.focalPoint.x}% ${hero.focalPoint.y}%`
                                : 'center',
                        }}
                    />
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
                        <Img
                            src={img.url}
                            className="w-full h-full object-cover rounded-lg border-2 border-white/10"
                        />
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
                        <Img src={img.url} className="w-full h-full object-cover" />
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
    images: { url: string }[];
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
                <Img src={images[0].url} className="w-full h-full object-cover" />
            </div>

            {/* Bottom two images */}
            {images.slice(1, 3).map((img, i) => (
                <div key={i} className="relative overflow-hidden rounded-lg">
                    <Img src={img.url} className="w-full h-full object-cover" />
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
    images: { url: string }[];
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
                    <Img src={images[0].url} className="w-full h-full object-cover" />
                </div>
            )}
            {images[1] && (
                <div className="col-span-2 relative overflow-hidden rounded-lg">
                    <Img src={images[1].url} className="w-full h-full object-cover" />
                </div>
            )}
            {images.slice(2, 4).map((img, i) => (
                <div key={i} className="relative overflow-hidden rounded-lg">
                    <Img src={img.url} className="w-full h-full object-cover" />
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

