"use client";

/**
 * Controls Sidebar (FR-004)
 * Layout style selection, canvas settings, transition options.
 * Matches editor.html mockup exactly.
 */

import {
    LayoutGrid,
    Layout,
    Layers,
    Shuffle,
    Settings,
} from "lucide-react";
import { useEditorStore } from "@/stores/editor-store";
import { RESOLUTION_PRESETS, type ResolutionPreset, type TransitionType } from "@/lib/types";

// ============================================
// Layout Style Section
// ============================================

const LAYOUT_OPTIONS = [
    { id: "grid", icon: LayoutGrid, label: "Grid" },
    { id: "hero", icon: Layout, label: "Hero" },
    { id: "stacked", icon: Layers, label: "Stacked" },
    { id: "scattered", icon: Shuffle, label: "Scatter" },
] as const;

function LayoutStyleSection() {
    return (
        <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-secondary uppercase tracking-wider">
                    Layout Style
                </h3>
                <LayoutGrid className="w-4 h-4 text-secondary" />
            </div>
            <div className="grid grid-cols-2 gap-2">
                {LAYOUT_OPTIONS.map((option, i) => {
                    const Icon = option.icon;
                    const isActive = i === 0; // Default to first option
                    return (
                        <button
                            key={option.id}
                            className={`
                flex flex-col items-center justify-center p-3 rounded-lg border transition-colors
                ${isActive
                                    ? "border-accent bg-accent/5 text-accent"
                                    : "border-surface-highlight bg-surface hover:border-secondary text-secondary hover:text-primary"
                                }
              `}
                        >
                            <Icon className="w-5 h-5 mb-2" />
                            <span className="text-xs font-medium">{option.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ============================================
// Canvas Settings Section
// ============================================

function CanvasSettingsSection() {
    const config = useEditorStore((s) => s.config);
    const updateConfig = useEditorStore((s) => s.updateConfig);

    return (
        <div className="p-4 border-b border-border space-y-5">
            <h3 className="text-xs font-bold text-secondary uppercase tracking-wider">
                Canvas
            </h3>

            {/* Resolution */}
            <div>
                <label className="text-xs text-secondary block mb-2">Resolution</label>
                <select
                    value={config.resolution}
                    onChange={(e) => updateConfig("resolution", e.target.value as ResolutionPreset)}
                    className="w-full bg-surface border border-surface-highlight rounded px-2 py-1.5 text-xs text-primary focus:border-accent outline-none"
                >
                    {Object.entries(RESOLUTION_PRESETS).map(([key, preset]) => (
                        <option key={key} value={key}>
                            {preset.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Background Color */}
            <div>
                <label className="text-xs text-secondary block mb-2">Background</label>
                <div className="flex items-center gap-2">
                    <input
                        type="color"
                        value={config.backgroundColor}
                        onChange={(e) => updateConfig("backgroundColor", e.target.value)}
                        className="w-8 h-8 rounded border-none bg-transparent cursor-pointer"
                    />
                    <span className="text-xs font-mono text-secondary">
                        {config.backgroundColor}
                    </span>
                </div>
            </div>

            {/* Gap Size */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-secondary">Gap Size</label>
                    <span className="text-xs font-mono text-accent">{config.gapSize}px</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={config.gapSize}
                    onChange={(e) => updateConfig("gapSize", Number(e.target.value))}
                    className="w-full h-1 bg-surface-highlight rounded-lg appearance-none cursor-pointer accent-accent"
                />
            </div>

            {/* Total Duration */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="text-xs text-secondary">Total Duration</label>
                    <span className="text-xs font-mono text-accent">{config.totalDurationSeconds}s</span>
                </div>
                <input
                    type="range"
                    min="5"
                    max="120"
                    value={config.totalDurationSeconds}
                    onChange={(e) => updateConfig("totalDurationSeconds", Number(e.target.value))}
                    className="w-full h-1 bg-surface-highlight rounded-lg appearance-none cursor-pointer accent-accent"
                />
            </div>
        </div>
    );
}

// ============================================
// Transitions Section
// ============================================

const TRANSITION_OPTIONS: { id: TransitionType; label: string }[] = [
    { id: "fade", label: "Fade" },
    { id: "slide-left", label: "Slide" },
    { id: "wipe", label: "Wipe" },
    { id: "clock-wipe", label: "Clock Wipe" },
];

function TransitionsSection() {
    const config = useEditorStore((s) => s.config);
    const updateConfig = useEditorStore((s) => s.updateConfig);
    const toggleTransition = useEditorStore((s) => s.toggleTransition);

    return (
        <div className="p-4 border-b border-border space-y-4">
            <h3 className="text-xs font-bold text-secondary uppercase tracking-wider">
                Transitions
            </h3>
            <div className="space-y-2">
                {/* Randomize toggle */}
                <label className="flex items-center gap-2 text-xs text-primary cursor-pointer">
                    <input
                        type="checkbox"
                        checked={config.randomizeTransitions}
                        onChange={(e) => updateConfig("randomizeTransitions", e.target.checked)}
                        className="rounded border-surface-highlight bg-surface text-accent focus:ring-0"
                    />
                    <span>Randomize Order</span>
                </label>

                {/* Transition toggles */}
                {TRANSITION_OPTIONS.map((t) => (
                    <label
                        key={t.id}
                        className="flex items-center gap-2 text-xs text-primary cursor-pointer"
                    >
                        <input
                            type="checkbox"
                            checked={config.enabledTransitions.includes(t.id)}
                            onChange={() => toggleTransition(t.id)}
                            className="rounded border-surface-highlight bg-surface text-accent focus:ring-0"
                        />
                        <span>Include &quot;{t.label}&quot;</span>
                    </label>
                ))}
            </div>
        </div>
    );
}

// ============================================
// Main Sidebar Component
// ============================================

export function ControlsSidebar() {
    return (
        <aside className="w-80 border-r border-border bg-background flex flex-col overflow-y-auto shrink-0">
            <LayoutStyleSection />
            <CanvasSettingsSection />
            <TransitionsSection />
        </aside>
    );
}
