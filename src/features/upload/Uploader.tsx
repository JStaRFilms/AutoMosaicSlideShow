"use client";

/**
 * Drag-and-Drop Image Uploader (FR-001)
 * Accepts files and folders via drag-and-drop or file picker.
 */

import { useCallback, useState } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { Upload, ImagePlus, Loader2, ScanFace } from "lucide-react";
import { useEditorStore } from "@/stores/editor-store";
import { useFaceDetection } from "@/hooks/useFaceDetection";
import type { ImageAsset } from "@/lib/types";

interface UploaderProps {
    className?: string;
    compact?: boolean;
}

export function Uploader({ className = "", compact = false }: UploaderProps) {
    const addImageAssets = useEditorStore((s) => s.addImageAssets);
    const imageCount = useEditorStore((s) => s.images.length);
    const [isProcessing, setIsProcessing] = useState(false);
    const { detectProminentFace, isModelLoaded } = useFaceDetection();

    const onDrop = useCallback(
        async (acceptedFiles: File[], _rejections: FileRejection[]) => {
            if (acceptedFiles.length === 0) return;

            setIsProcessing(true);
            const newImages: ImageAsset[] = [];

            // Process sequentially to allow face detection logic
            for (const file of acceptedFiles) {
                if (!file.type.startsWith("image/")) continue;

                const url = URL.createObjectURL(file);

                // Load image to get dimensions and detect faces
                try {
                    const img = new Image();
                    img.src = url;

                    await new Promise<void>((resolve) => {
                        img.onload = async () => {
                            let focalPoint = { x: 50, y: 50 };

                            if (isModelLoaded) {
                                focalPoint = await detectProminentFace(img);
                            }

                            newImages.push({
                                id: crypto.randomUUID(),
                                url,
                                file,
                                width: img.naturalWidth,
                                height: img.naturalHeight,
                                focalPoint,
                            });
                            resolve();
                        };
                        img.onerror = () => resolve();
                    });
                } catch (e) {
                    console.error("Error processing image", e);
                }
            }

            addImageAssets(newImages);
            setIsProcessing(false);
        },
        [addImageAssets, detectProminentFace, isModelLoaded]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif", ".avif"],
        },
        multiple: true,
    });

    // Compact mode for timeline/sidebar
    if (compact) {
        return (
            <div
                {...getRootProps()}
                className={`
          h-24 w-24 rounded border-2 border-dashed 
          flex flex-col items-center justify-center cursor-pointer shrink-0
          transition-colors
          ${isDragActive
                        ? "border-accent text-accent bg-accent/5"
                        : "border-surface-highlight text-secondary hover:border-accent hover:text-accent"
                    }
          ${className}
        `}
            >
                <input {...getInputProps()} />
                <Upload className="w-5 h-5 mb-1" />
                <span className="text-[10px]">Import</span>
            </div>
        );
    }

    // Full-screen drop zone (empty state)
    return (
        <div
            {...getRootProps()}
            className={`
        flex flex-col items-center justify-center
        border-2 border-dashed rounded-xl
        transition-all duration-200 cursor-pointer
        min-h-[300px] p-8
        ${isDragActive
                    ? "border-accent bg-accent/5 scale-[1.02]"
                    : "border-surface-highlight hover:border-accent/50 hover:bg-surface/50"
                }
        ${className}
      `}
        >
            <input {...getInputProps()} />

            <div className="w-16 h-16 rounded-full bg-surface-highlight flex items-center justify-center mb-6">
                <ImagePlus className="w-8 h-8 text-secondary" />
            </div>

            {isDragActive ? (
                <p className="text-xl font-medium text-accent">Drop images here...</p>
            ) : (
                <>
                    <p className="text-xl font-medium text-primary mb-2">
                        Drag & Drop Images
                    </p>
                    <p className="text-sm text-secondary text-center max-w-md">
                        Drop a folder of images or click to browse.
                        <br />
                        Supports PNG, JPG, WebP, GIF, AVIF
                    </p>
                    {isProcessing ? (
                        <div className="flex items-center gap-1.5 mt-4 text-xs text-accent">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Processing images...</span>
                        </div>
                    ) : isModelLoaded ? (
                        <div className="flex items-center gap-1.5 mt-4 text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
                            <ScanFace className="w-3 h-3" />
                            <span>Smart Face Detection Active</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 mt-4 text-xs text-secondary bg-surface-highlight px-2 py-1 rounded-full">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span>Loading AI Models...</span>
                        </div>
                    )}
                </>
            )}

            {imageCount > 0 && (
                <p className="mt-4 text-xs text-accent">
                    {imageCount} image{imageCount !== 1 ? "s" : ""} loaded
                </p>
            )}
        </div>
    );
}
