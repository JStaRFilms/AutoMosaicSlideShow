/**
 * Transition Utilities (FR-003)
 * Randomized transitions between slides using @remotion/transitions
 */

import type { TransitionType } from "@/lib/types";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import type { TransitionPresentation } from "@remotion/transitions";

// ============================================
// Transition Configurations
// ============================================

type TransitionFactory = () => TransitionPresentation<Record<string, unknown>>;

const TRANSITION_MAP: Record<TransitionType, TransitionFactory | null> = {
    fade: () => fade(),
    "slide-left": () => slide({ direction: "from-left" }),
    "slide-right": () => slide({ direction: "from-right" }),
    "slide-up": () => slide({ direction: "from-top" }),
    "slide-down": () => slide({ direction: "from-bottom" }),
    wipe: () => wipe({ direction: "from-left" }),
    "clock-wipe": () => wipe({ direction: "from-top" }), // Fallback to wipe
    none: null,
};

// ============================================
// Transition Selection
// ============================================

function randomChoice<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function getRandomTransition(
    enabledTransitions: TransitionType[]
): TransitionPresentation<Record<string, unknown>> | null {
    const validTransitions = enabledTransitions.filter(
        (t) => t !== "none" && TRANSITION_MAP[t]
    );

    if (validTransitions.length === 0) {
        return null;
    }

    const selectedType = randomChoice(validTransitions);
    const factory = TRANSITION_MAP[selectedType];

    return factory ? factory() : null;
}

/**
 * Generate transition sequence for all slides
 */
export function generateTransitionSequence(
    slideCount: number,
    enabledTransitions: TransitionType[],
    randomize: boolean = true
): (TransitionPresentation<Record<string, unknown>> | null)[] {
    if (slideCount <= 1) return [];

    const transitions: (TransitionPresentation<Record<string, unknown>> | null)[] = [];

    for (let i = 0; i < slideCount - 1; i++) {
        if (randomize) {
            transitions.push(getRandomTransition(enabledTransitions));
        } else {
            // Cycle through enabled transitions sequentially
            const index = i % enabledTransitions.length;
            const type = enabledTransitions[index];
            const factory = TRANSITION_MAP[type];
            transitions.push(factory ? factory() : null);
        }
    }

    return transitions;
}

// ============================================
// Default Transition Duration
// ============================================

export const DEFAULT_TRANSITION_FRAMES = 15; // 0.5s at 30fps
