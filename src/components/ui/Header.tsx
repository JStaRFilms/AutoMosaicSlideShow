"use client";

/**
 * Header Navigation
 * Logo, mode toggle, export button.
 */

import { Download, FileJson, Save, FolderOpen } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
    onExport?: () => void;
    onSave?: () => void;
}

export function Header({ onExport, onSave }: HeaderProps) {
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
                    <Link href="/projects" className="px-3 py-1 text-xs font-medium text-secondary hover:text-primary transition-colors flex items-center gap-1">
                        <FolderOpen className="w-3 h-3" />
                        Projects
                    </Link>
                    <div className="w-px bg-border my-0.5 mx-1" />
                    <button className="px-3 py-1 text-xs font-medium text-primary bg-background rounded shadow-sm">
                        Editor
                    </button>
                </div>

                <span className="w-px h-4 bg-border mx-2" />

                {/* Save Button */}
                {onSave && (
                    <button
                        onClick={onSave}
                        className="flex items-center gap-2 text-primary px-3 py-1.5 rounded text-xs font-semibold hover:bg-surface-highlight transition-colors border border-surface-highlight"
                    >
                        <Save className="w-3.5 h-3.5" />
                        Save
                    </button>
                )}

                {/* Export Button */}
                <button
                    onClick={onExport}
                    className="flex items-center gap-2 bg-primary text-black px-3 py-1.5 rounded text-xs font-semibold hover:bg-white transition-colors"
                >
                    <Download className="w-3.5 h-3.5" />
                    Export
                </button>
            </div>
        </header>
    );
}
