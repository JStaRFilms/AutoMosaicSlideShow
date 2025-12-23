"use client";

/**
 * Drag-and-Drop Image Uploader (FR-001)
 * Accepts files and folders via drag-and-drop or file picker.
 */

import { useCallback } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import { Upload, ImagePlus } from "lucide-react";
import { useEditorStore } from "@/stores/editor-store";

interface UploaderProps {
    className?: string;
    compact?: boolean;
}

export function Uploader({ className = "", compact = false }: UploaderProps) {
    const addImages = useEditorStore((s) => s.addImages);
    const imageCount = useEditorStore((s) => s.images.length);

    const onDrop = useCallback(
        (acceptedFiles: File[], _rejections: FileRejection[]) => {
            if (acceptedFiles.length > 0) {
                addImages(acceptedFiles);
            }
        },
        [addImages]
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
