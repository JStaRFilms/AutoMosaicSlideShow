"use client";

/**
 * Video Preview Canvas
 * Wraps Remotion Player for real-time preview with timeline scrubber.
 */

import { Player, PlayerRef } from "@remotion/player";
import { useRef, useEffect, useMemo, useState, useCallback } from "react";
import { ZoomIn, ZoomOut, Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { useEditorStore } from "@/stores/editor-store";
import { MosaicComposition, calculateTotalFrames } from "@/features/composition/MosaicComposition";
import { RESOLUTION_PRESETS } from "@/lib/types";

export function PreviewCanvas() {
    const playerRef = useRef<PlayerRef>(null);

    const slides = useEditorStore((s) => s.slides);
    const config = useEditorStore((s) => s.config);
    const isPlaying = useEditorStore((s) => s.isPlaying);
    const setIsPlaying = useEditorStore((s) => s.setIsPlaying);

    const [currentFrame, setCurrentFrame] = useState(0);

    const resolution = RESOLUTION_PRESETS[config.resolution];
    const totalFrames = useMemo(
        () => Math.max(calculateTotalFrames(slides), config.fps * 2), // Min 2 seconds
        [slides, config.fps]
    );

    // Track current frame from player
    useEffect(() => {
        const player = playerRef.current;
        if (!player) return;

        const handleFrameUpdate = () => {
            const frame = player.getCurrentFrame();
            setCurrentFrame(frame);
        };

        // Poll for frame updates
        const interval = setInterval(handleFrameUpdate, 100);
        return () => clearInterval(interval);
    }, [slides]);

    // Sync playback state
    useEffect(() => {
        const player = playerRef.current;
        if (player) {
            if (isPlaying) {
                player.play();
            } else {
                player.pause();
            }
        }
    }, [isPlaying]);

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const handleSeekStart = () => {
        playerRef.current?.seekTo(0);
        setCurrentFrame(0);
    };

    const handleSeekEnd = () => {
        playerRef.current?.seekTo(totalFrames - 1);
        setCurrentFrame(totalFrames - 1);
    };

    const handleScrub = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const frame = parseInt(e.target.value, 10);
        playerRef.current?.seekTo(frame);
        setCurrentFrame(frame);
    }, []);

    const formatTime = (frames: number) => {
        const seconds = Math.floor(frames / config.fps);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const progress = totalFrames > 0 ? (currentFrame / totalFrames) * 100 : 0;

    return (
        <section className="flex-1 bg-surface relative flex flex-col">
            {/* Toolbar */}
            <div className="h-10 border-b border-border flex items-center justify-center gap-4 px-4 bg-background/50 backdrop-blur shrink-0">
                <button className="text-secondary hover:text-primary">
                    <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs text-secondary font-mono">50%</span>
                <button className="text-secondary hover:text-primary">
                    <ZoomIn className="w-4 h-4" />
                </button>
            </div>

            {/* Viewport */}
            <div className="flex-1 flex items-center justify-center p-4 overflow-hidden relative">
                {/* Checkered background pattern */}
                <div
                    className="absolute inset-0 opacity-5 pointer-events-none"
                    style={{
                        backgroundImage: "radial-gradient(#444 1px, transparent 0)",
                        backgroundSize: "20px 20px",
                    }}
                />

                {/* Player Container */}
                <div className="aspect-video w-full max-w-4xl bg-black shadow-2xl ring-1 ring-white/10 rounded-lg overflow-hidden relative group">
                    {slides.length > 0 ? (
                        <Player
                            ref={playerRef}
                            component={MosaicComposition}
                            inputProps={{
                                slides,
                                width: resolution.width,
                                height: resolution.height,
                                fps: config.fps,
                                backgroundColor: config.backgroundColor,
                                enabledTransitions: config.enabledTransitions,
                                randomizeTransitions: config.randomizeTransitions,
                            }}
                            durationInFrames={totalFrames}
                            fps={config.fps}
                            compositionWidth={resolution.width}
                            compositionHeight={resolution.height}
                            style={{
                                width: "100%",
                                height: "100%",
                            }}
                            controls={false}
                            loop
                        />
                    ) : (
                        // Empty state placeholder
                        <div className="absolute inset-4 grid grid-cols-3 gap-4 p-4 opacity-80">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div
                                    key={i}
                                    className="bg-zinc-800 rounded animate-pulse"
                                    style={{ animationDelay: `${i * 100}ms` }}
                                />
                            ))}
                        </div>
                    )}

                    {/* Overlay Controls */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="z-10 bg-black/50 backdrop-blur-sm rounded-full p-4 flex items-center gap-6 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                            <button
                                onClick={handleSeekStart}
                                className="text-white hover:text-accent"
                            >
                                <SkipBack className="w-6 h-6" />
                            </button>
                            <button
                                onClick={handlePlayPause}
                                className="bg-white text-black rounded-full p-2 hover:scale-105 transition-transform"
                            >
                                {isPlaying ? (
                                    <Pause className="w-8 h-8" />
                                ) : (
                                    <Play className="w-8 h-8 translate-x-0.5" />
                                )}
                            </button>
                            <button
                                onClick={handleSeekEnd}
                                className="text-white hover:text-accent"
                            >
                                <SkipForward className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline Scrubber */}
            {slides.length > 0 && (
                <div className="h-14 border-t border-border bg-background px-4 py-2 flex flex-col justify-center shrink-0">
                    {/* Progress bar */}
                    <div className="relative mb-2">
                        <input
                            type="range"
                            min={0}
                            max={totalFrames - 1}
                            value={currentFrame}
                            onChange={handleScrub}
                            className="w-full h-2 bg-surface-highlight rounded-lg appearance-none cursor-pointer accent-accent"
                            style={{
                                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${progress}%, #27272a ${progress}%, #27272a 100%)`,
                            }}
                        />
                    </div>

                    {/* Time display */}
                    <div className="flex items-center justify-between text-xs text-secondary font-mono">
                        <span>{formatTime(currentFrame)}</span>
                        <div className="flex items-center gap-4">
                            <span className="text-accent">Frame {currentFrame + 1} / {totalFrames}</span>
                            <span>Slide {Math.min(Math.floor(currentFrame / (totalFrames / slides.length)) + 1, slides.length)} / {slides.length}</span>
                        </div>
                        <span>{formatTime(totalFrames)}</span>
                    </div>
                </div>
            )}
        </section>
    );
}
