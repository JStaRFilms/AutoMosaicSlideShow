"use client";

/**
 * Timeline / Asset Panel (Updated for FR-012)
 * Shows imported images with focal point editing and reordering.
 */

import { useState } from "react";
import { PlusCircle, Trash2, Focus, GripVertical } from "lucide-react";
import { useEditorStore } from "@/stores/editor-store";
import { Uploader } from "@/features/upload/Uploader";
import { FocalPointPicker } from "./FocalPointPicker";
import type { ImageAsset, FocalPoint } from "@/lib/types";

export function TimelinePanel() {
    const images = useEditorStore((s) => s.images);
    const removeImage = useEditorStore((s) => s.removeImage);
    const clearImages = useEditorStore((s) => s.clearImages);
    const setImageFocalPoint = useEditorStore((s) => s.setImageFocalPoint);
    const reorderImages = useEditorStore((s) => s.reorderImages);

    const [editingImage, setEditingImage] = useState<ImageAsset | null>(null);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const handleFocalPointSave = (focalPoint: FocalPoint) => {
        if (editingImage) {
            setImageFocalPoint(editingImage.id, focalPoint);
            setEditingImage(null);
        }
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent, toIndex: number) => {
        e.preventDefault();
        if (draggedIndex !== null && draggedIndex !== toIndex) {
            reorderImages(draggedIndex, toIndex);
        }
        setDraggedIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
    };

    return (
        <>
            <div className="h-48 bg-background border-t border-border flex flex-col shrink-0">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                    <h3 className="text-xs font-bold text-secondary uppercase tracking-wider">
                        Timeline / Assets
                    </h3>
                    <div className="flex items-center gap-2">
                        {images.length > 0 && (
                            <button
                                onClick={clearImages}
                                className="text-xs text-danger flex items-center gap-1 hover:text-red-400"
                            >
                                <Trash2 className="w-3 h-3" />
                                Clear All
                            </button>
                        )}
                        <label className="text-xs text-accent flex items-center gap-1 hover:text-accent-hover cursor-pointer">
                            <PlusCircle className="w-3 h-3" />
                            Add Images
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const files = Array.from(e.target.files || []);
                                    if (files.length > 0) {
                                        useEditorStore.getState().addImages(files);
                                    }
                                }}
                            />
                        </label>
                    </div>
                </div>

                {/* Timeline Content */}
                <div className="flex-1 overflow-x-auto p-4 flex gap-2 items-center">
                    {/* Drop Zone */}
                    <Uploader compact />

                    {/* Asset Thumbnails */}
                    {images.map((img, i) => (
                        <div
                            key={img.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, i)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, i)}
                            onDragEnd={handleDragEnd}
                            className={`
                h-24 w-16 bg-surface-highlight rounded border relative shrink-0 group overflow-hidden cursor-grab
                ${draggedIndex === i ? "opacity-50 border-accent" : "border-white/5"}
                ${img.focalPoint ? "ring-2 ring-accent/30" : ""}
              `}
                        >
                            {/* Focal point indicator */}
                            {img.focalPoint && (
                                <div className="absolute top-1 left-1 w-2 h-2 bg-accent rounded-full" />
                            )}

                            {/* Drag handle */}
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <GripVertical className="w-3 h-3 text-white/70" />
                            </div>

                            <img
                                src={img.url}
                                alt={`Image ${i + 1}`}
                                className="w-full h-full object-cover rounded opacity-70 group-hover:opacity-100 transition-opacity"
                                style={{
                                    objectPosition: img.focalPoint
                                        ? `${img.focalPoint.x}% ${img.focalPoint.y}%`
                                        : "center",
                                }}
                            />

                            {/* Hover overlay with actions */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                                <button
                                    onClick={() => setEditingImage(img)}
                                    className="p-1.5 bg-accent/20 rounded hover:bg-accent/40 transition-colors"
                                    title="Set focal point"
                                >
                                    <Focus className="w-3 h-3 text-accent" />
                                </button>
                                <button
                                    onClick={() => removeImage(img.id)}
                                    className="p-1.5 bg-danger/20 rounded hover:bg-danger/40 transition-colors"
                                    title="Remove image"
                                >
                                    <Trash2 className="w-3 h-3 text-danger" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Empty state message */}
                    {images.length === 0 && (
                        <p className="text-xs text-secondary ml-4">
                            Import images to get started
                        </p>
                    )}
                </div>
            </div>

            {/* Focal Point Picker Modal */}
            {editingImage && (
                <FocalPointPicker
                    imageUrl={editingImage.url}
                    currentFocalPoint={editingImage.focalPoint}
                    onSave={handleFocalPointSave}
                    onCancel={() => setEditingImage(null)}
                />
            )}
        </>
    );
}
