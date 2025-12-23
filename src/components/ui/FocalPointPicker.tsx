"use client";

/**
 * Focal Point Picker (FR-012)
 * Click on an image to set where the focal point should be for cropping.
 */

import { useState, useRef, useCallback } from "react";
import { X, Check, Move } from "lucide-react";
import type { FocalPoint } from "@/lib/types";

interface FocalPointPickerProps {
    imageUrl: string;
    currentFocalPoint?: FocalPoint;
    onSave: (focalPoint: FocalPoint) => void;
    onCancel: () => void;
}

export function FocalPointPicker({
    imageUrl,
    currentFocalPoint,
    onSave,
    onCancel,
}: FocalPointPickerProps) {
    const [focalPoint, setFocalPoint] = useState<FocalPoint>(
        currentFocalPoint || { x: 50, y: 50 }
    );
    const containerRef = useRef<HTMLDivElement>(null);

    const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const container = containerRef.current;
        if (!container) return;

        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        setFocalPoint({
            x: Math.max(0, Math.min(100, x)),
            y: Math.max(0, Math.min(100, y)),
        });
    }, []);

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8">
            <div className="bg-surface rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-border flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-primary">Set Focal Point</h2>
                        <p className="text-xs text-secondary mt-1">
                            Click on the image to set where the focus should be when cropping
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onCancel}
                            className="p-2 text-secondary hover:text-primary rounded-lg hover:bg-surface-highlight"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Image Area */}
                <div className="flex-1 p-4 overflow-auto">
                    <div
                        ref={containerRef}
                        onClick={handleClick}
                        className="relative cursor-crosshair mx-auto"
                        style={{ maxWidth: "100%", maxHeight: "60vh" }}
                    >
                        <img
                            src={imageUrl}
                            alt="Set focal point"
                            className="w-full h-full object-contain rounded-lg"
                            draggable={false}
                        />

                        {/* Focal Point Marker */}
                        <div
                            className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ left: `${focalPoint.x}%`, top: `${focalPoint.y}%` }}
                        >
                            {/* Crosshair */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-full h-0.5 bg-accent" />
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-0.5 h-full bg-accent" />
                            </div>
                            {/* Center dot */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-3 h-3 bg-accent rounded-full ring-2 ring-white shadow-lg" />
                            </div>
                        </div>

                        {/* Grid overlay */}
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                                {[...Array(9)].map((_, i) => (
                                    <div key={i} className="border border-white/10" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-secondary">
                        <Move className="w-4 h-4" />
                        <span>
                            Position: {focalPoint.x.toFixed(0)}%, {focalPoint.y.toFixed(0)}%
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 text-sm text-secondary hover:text-primary"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onSave(focalPoint)}
                            className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-accent-hover"
                        >
                            <Check className="w-4 h-4" />
                            Save Focal Point
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
