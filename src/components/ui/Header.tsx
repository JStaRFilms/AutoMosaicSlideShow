"use client";

/**
 * Header Navigation
 * Logo, mode toggle, export button.
 */

import { Download, FileJson } from "lucide-react";

interface HeaderProps {
    onExport?: () => void;
}

export function Header({ onExport }: HeaderProps) {
    return (
        <header className="h-14 border-b border-border bg-surface flex items-center justify-between px-4 shrink-0 z-20">
            {/* Left: Logo */}
            <div className="flex items-center gap-3">
                <div className="font-bold text-lg tracking-tight flex items-center gap-2">
                    <div className="w-6 h-6 bg-primary text-black rounded flex items-center justify-center font-serif italic font-black">
                        A
                    </div>
                    AutoMosaic
                </div>
                <span className="w-px h-4 bg-border mx-2" />
                <span className="text-xs text-secondary bg-surface-highlight px-2 py-0.5 rounded">
                    v0.1.0-alpha
                </span>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                {/* View Toggle */}
                <div className="flex bg-surface-highlight p-0.5 rounded-lg">
                    <button className="px-3 py-1 text-xs font-medium text-primary bg-background rounded shadow-sm">
                        Editor
                    </button>
                    <button className="px-3 py-1 text-xs font-medium text-secondary hover:text-primary transition-colors">
                        JSON
                    </button>
                </div>

                <span className="w-px h-4 bg-border mx-2" />

                {/* Export Button */}
                <button
                    onClick={onExport}
                    className="flex items-center gap-2 bg-primary text-black px-3 py-1.5 rounded text-xs font-semibold hover:bg-white transition-colors"
                >
                    <Download className="w-3.5 h-3.5" />
                    Export MP4
                </button>
            </div>
        </header>
    );
}
