"use client";

/**
 * Main Editor Page
 * Assembles all components into the workspace layout.
 */

import { useEffect, useState } from "react";
import { Header } from "@/components/ui/Header";
import { ControlsSidebar } from "@/components/ui/ControlsSidebar";
import { PreviewCanvas } from "@/components/ui/PreviewCanvas";
import { TimelinePanel } from "@/components/ui/TimelinePanel";
import { ExportDialog } from "@/components/ui/ExportDialog";
import { Uploader } from "@/features/upload/Uploader";
import { useEditorStore } from "@/stores/editor-store";
import { generateSlides } from "@/features/layout/LayoutEngine";

export function EditorPage() {
    const images = useEditorStore((s) => s.images);
    const config = useEditorStore((s) => s.config);
    const setSlides = useEditorStore((s) => s.setSlides);
    const [isExportOpen, setIsExportOpen] = useState(false);

    // Regenerate slides when images or config changes
    useEffect(() => {
        if (images.length > 0) {
            const newSlides = generateSlides(images, {
                gap: config.gapSize,
                totalDurationSeconds: config.totalDurationSeconds,
                fps: config.fps,
            });
            setSlides(newSlides);
        } else {
            setSlides([]);
        }
    }, [
        images,
        config.gapSize,
        config.totalDurationSeconds,
        config.fps,
        setSlides
    ]);

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-background text-primary">
            <Header onExport={() => setIsExportOpen(true)} />

            <main className="flex-1 flex overflow-hidden">
                <ControlsSidebar />

                {/* Center Workspace */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {images.length === 0 ? (
                        // Empty State: Full-screen uploader
                        <div className="flex-1 flex items-center justify-center p-12">
                            <Uploader className="max-w-2xl w-full" />
                        </div>
                    ) : (
                        // Active State: Preview + Timeline
                        <>
                            <PreviewCanvas />
                            <TimelinePanel />
                        </>
                    )}
                </div>
            </main>

            <ExportDialog
                isOpen={isExportOpen}
                onClose={() => setIsExportOpen(false)}
            />
        </div>
    );
}
