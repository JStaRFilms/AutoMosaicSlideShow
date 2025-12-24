"use client";

/**
 * Draft Recovery Dialog
 * Shows on page load if there's an unsaved draft with images.
 * Prompts user to Resume or Discard their work.
 */

import { useEffect, useState } from "react";
import { AlertTriangle, Play, Trash2 } from "lucide-react";
import { useEditorStore } from "@/stores/editor-store";

export function DraftRecoveryDialog() {
    const images = useEditorStore((s) => s.images);
    const isDirty = useEditorStore((s) => s.isDirty);
    const currentProjectId = useEditorStore((s) => s.currentProjectId);
    const resetEditor = useEditorStore((s) => s.resetEditor);
    const setIsDirty = useEditorStore((s) => s.setIsDirty);

    const [showDialog, setShowDialog] = useState(false);
    const [isHydrated, setIsHydrated] = useState(false);

    // Wait for Zustand to hydrate from localStorage
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    // Show dialog if there's unsaved work (images but no saved project)
    useEffect(() => {
        if (isHydrated && isDirty && images.length > 0 && !currentProjectId) {
            setShowDialog(true);
        }
    }, [isHydrated, isDirty, images.length, currentProjectId]);

    const handleResume = () => {
        setShowDialog(false);
        // Keep the state as-is, user continues working
    };

    const handleDiscard = () => {
        resetEditor();
        setShowDialog(false);
    };

    if (!showDialog) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
                <div className="border-b border-border p-4 flex items-center gap-3 bg-surface-highlight">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-primary">Unsaved Work Found</h3>
                        <p className="text-xs text-secondary">You have an unsaved draft from a previous session</p>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <div className="bg-black/20 rounded-lg p-4 border border-surface-highlight">
                        <p className="text-sm text-secondary mb-2">Draft contains:</p>
                        <p className="text-primary font-medium">{images.length} image{images.length !== 1 ? 's' : ''}</p>
                    </div>

                    <p className="text-sm text-secondary">
                        Would you like to resume working on this draft or start fresh?
                    </p>

                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={handleDiscard}
                            className="flex-1 px-4 py-3 rounded-lg text-secondary hover:text-danger border border-surface-highlight hover:border-danger transition-colors flex items-center justify-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Discard Draft
                        </button>
                        <button
                            onClick={handleResume}
                            className="flex-1 px-4 py-3 rounded-lg bg-primary text-black font-medium hover:bg-white transition-colors flex items-center justify-center gap-2"
                        >
                            <Play className="w-4 h-4" />
                            Resume Draft
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
