"use client";

/**
 * Main Remotion Composition
 * Stitches slides together with transitions.
 */

import { AbsoluteFill, Sequence } from "remotion";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { SlideLayout } from "./SlideLayout";
import {
    getRandomTransition,
    DEFAULT_TRANSITION_FRAMES
} from "./transitions";
import type { SlideConfig, TransitionType } from "@/lib/types";
import React from "react";

// ============================================
// Props
// ============================================

interface MosaicCompositionProps {
    slides: SlideConfig[];
    width: number;
    height: number;
    fps: number;
    backgroundColor: string;
    enabledTransitions: TransitionType[];
    randomizeTransitions: boolean;
}

// ============================================
// Composition
// ============================================

export function MosaicComposition({
    slides,
    backgroundColor,
    enabledTransitions,
}: MosaicCompositionProps) {
    if (slides.length === 0) {
        return (
            <AbsoluteFill
                className="flex items-center justify-center"
                style={{ backgroundColor }}
            >
                <p className="text-white/50 text-lg">No slides to display</p>
            </AbsoluteFill>
        );
    }

    // For single slide, no transitions needed
    if (slides.length === 1) {
        const slide = slides[0];
        return (
            <Sequence durationInFrames={slide.durationFrames}>
                <SlideLayout
                    images={slide.layout.images.map((img) => ({
                        id: img.id,
                        url: img.url,
                        focalPoint: img.focalPoint,
                    }))}
                    layoutType={slide.layout.type}
                    gap={slide.layout.gap}
                    backgroundColor={backgroundColor}
                    durationInFrames={slide.durationFrames}
                />
            </Sequence>
        );
    }

    // Build interleaved sequences and transitions
    const elements: React.ReactNode[] = [];

    slides.forEach((slide, index) => {
        const isLast = index === slides.length - 1;

        // Add the slide sequence
        elements.push(
            <TransitionSeries.Sequence
                key={`slide-${slide.id}`}
                durationInFrames={slide.durationFrames}
            >
                <SlideLayout
                    images={slide.layout.images.map((img) => ({
                        id: img.id,
                        url: img.url,
                        focalPoint: img.focalPoint,
                    }))}
                    layoutType={slide.layout.type}
                    gap={slide.layout.gap}
                    backgroundColor={backgroundColor}
                    durationInFrames={slide.durationFrames}
                />
            </TransitionSeries.Sequence>
        );

        // Add transition after each slide except the last
        if (!isLast && enabledTransitions.length > 0) {
            const transition = getRandomTransition(enabledTransitions);
            if (transition) {
                elements.push(
                    <TransitionSeries.Transition
                        key={`transition-${slide.id}`}
                        presentation={transition}
                        timing={linearTiming({ durationInFrames: DEFAULT_TRANSITION_FRAMES })}
                    />
                );
            }
        }
    });

    return <TransitionSeries>{elements}</TransitionSeries>;
}

// ============================================
// Calculate total frames
// ============================================

export function calculateTotalFrames(
    slides: SlideConfig[],
    transitionFrames: number = DEFAULT_TRANSITION_FRAMES
): number {
    if (slides.length === 0) return 0;

    const slideDuration = slides.reduce((sum, s) => sum + s.durationFrames, 0);
    const transitionDuration = Math.max(0, slides.length - 1) * transitionFrames;

    // Transitions overlap, so subtract half
    return slideDuration - Math.floor(transitionDuration / 2);
}
