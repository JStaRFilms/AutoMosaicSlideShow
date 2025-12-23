"use client";

import { X, Copy, Check, Terminal, UploadCloud, Loader2 } from "lucide-react";
import { useState } from "react";
import { useEditorStore } from "@/stores/editor-store";
import { RESOLUTION_PRESETS } from "@/lib/types";

interface ExportDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ExportDialog({ isOpen, onClose }: ExportDialogProps) {
    const [status, setStatus] = useState<"idle" | "uploading" | "ready" | "error">("idle");
    const [copied, setCopied] = useState(false);
    const [exportMode, setExportMode] = useState<"video" | "stills">("video");

    const config = useEditorStore((s) => s.config);
    const slides = useEditorStore((s) => s.slides);
    const images = useEditorStore((s) => s.images);

    const resolution = RESOLUTION_PRESETS[config.resolution];

    // Logic to sync assets to local disk
    const handleSync = async () => {
        setStatus("uploading");

        try {
            // 2. Prepare FormData with Images
            const formData = new FormData();
            images.forEach((img) => {
                formData.append("files", img.file);
            });

            const res = await fetch("/api/save-assets", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            const data = await res.json();
            // data.paths contains mapping of filename -> absolute system path

            // 1. Prepare Props with HTTP paths (http://localhost:port/...)
            const origin = window.location.origin; // e.g., http://localhost:3000

            const syncProps = {
                slides: slides.map((s) => ({
                    ...s,
                    layout: {
                        ...s.layout,
                        images: s.layout.images.map((img) => ({
                            ...img,
                            // Use HTTP URL pointing to the Next.js public folder
                            // The API now returns relative paths like "/uploads/img.jpg"
                            url: `${origin}${data.paths[img.file.name]}`,
                        })),
                    },
                })),
                width: resolution.width,
                height: resolution.height,
                fps: config.fps,
                backgroundColor: config.backgroundColor,
                enabledTransitions: config.enabledTransitions,
                randomizeTransitions: config.randomizeTransitions,
            };

            // 2. Save Props JSON as a file
            const propsFormData = new FormData();
            const jsonBlob = new Blob([JSON.stringify(syncProps, null, 2)], {
                type: "application/json",
            });
            // We reuse the save-assets endpoint to save the json file too
            // Note: The API route logic I just wrote expects "props" as a string or "files".
            // Let's stick to the "files" approach for the JSON blob to ensure it gets written to disk.
            propsFormData.append("files", jsonBlob, "render-props.json");

            await fetch("/api/save-assets", {
                method: "POST",
                body: propsFormData,
            });

            setStatus("ready");
        } catch (e) {
            console.error(e);
            setStatus("error");
        }
    };

    // We removed --concurrency=1 to allow multi-core rendering (much faster).
    // If you experience "socket hang up" errors with many images, try adding --concurrency=1 back manually.
    const safeName = config.name.replace(/\s+/g, "_");
    const command = exportMode === "video"
        ? `pnpm exec remotion render src/index.ts AutoMosaic out/${safeName}.mp4 --props=./public/uploads/render-props.json`
        : `pnpm exec remotion render src/index.ts AutoMosaic out/${safeName}_stills --image-format=png --sequence --props=./public/uploads/render-props.json`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(command);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-surface border border-border rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden">
                {/* Header */}
                <div className="border-b border-border p-4 flex items-center justify-between bg-surface-highlight">
                    <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-accent" />
                        <h3 className="font-semibold text-primary">Export Video</h3>
                    </div>
                    <button onClick={onClose} className="text-secondary hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {status === "idle" || status === "error" ? (
                        <div className="text-center py-8">
                            <p className="text-secondary mb-6">
                                To export a high-quality MP4, we need to sync your images to the local <code>public/uploads</code> folder first.
                            </p>

                            {status === "error" && (
                                <p className="text-danger mb-4 text-sm">Sync failed. Please try again.</p>
                            )}

                            <button
                                onClick={handleSync}
                                className="bg-primary text-black px-6 py-3 rounded-lg font-bold hover:bg-white transition-colors inline-flex items-center gap-2"
                            >
                                <UploadCloud className="w-5 h-5" />
                                Sync Assets & Generate Command
                            </button>
                        </div>
                    ) : status === "uploading" ? (
                        <div className="text-center py-12">
                            <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto mb-4" />
                            <p className="text-secondary">Syncing assets to disk...</p>
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm text-secondary mb-4 leading-relaxed">
                                Assets synced!
                                <span className="block mt-2 font-medium text-primary">
                                    1. Choose Format:
                                </span>
                            </p>

                            <div className="flex gap-2 mb-4 bg-black/20 p-1 rounded-lg border border-white/10 w-fit">
                                <button
                                    onClick={() => setExportMode("video")}
                                    className={`px-4 py-1.5 rounded text-sm transition-colors ${exportMode === "video"
                                            ? "bg-primary text-black font-semibold"
                                            : "text-secondary hover:text-white"
                                        }`}
                                >
                                    Video (MP4)
                                </button>
                                <button
                                    onClick={() => setExportMode("stills")}
                                    className={`px-4 py-1.5 rounded text-sm transition-colors ${exportMode === "stills"
                                            ? "bg-primary text-black font-semibold"
                                            : "text-secondary hover:text-white"
                                        }`}
                                >
                                    Stills (PNG Sequence)
                                </button>
                            </div>

                            <p className="text-sm text-secondary mb-2 leading-relaxed">
                                <span className="font-medium text-primary">2. Run Command:</span>
                                {exportMode === "video"
                                    ? " Generates a single MP4 video file."
                                    : " Generates a folder containing a PNG image for every frame."}
                            </p>

                            <div className="bg-black rounded-lg border border-border p-4 relative group">
                                <code className="text-xs font-mono text-green-400 break-all block pr-8 max-h-32 overflow-y-auto custom-scrollbar">
                                    {command}
                                </code>

                                <button
                                    onClick={copyToClipboard}
                                    className="absolute top-2 right-2 p-2 rounded hover:bg-surface-highlight text-secondary hover:text-white transition-colors"
                                    title="Copy to clipboard"
                                >
                                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>

                            <div className="mt-6 bg-surface-highlight/50 rounded p-4 text-xs text-secondary flex gap-3 items-start">
                                <Terminal className="w-4 h-4 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-primary mb-1">Why do I need to run a command?</p>
                                    <p>Browser-based rendering is limited. For professional quality, we use the local Remotion engine directly. This ensures smooth playback and perfect frame accuracy.</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
