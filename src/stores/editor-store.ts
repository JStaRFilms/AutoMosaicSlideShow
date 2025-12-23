import { create } from "zustand";
import type {
    ImageAsset,
    SlideConfig,
    ProjectConfig,
    TransitionType,
    FocalPoint
} from "@/lib/types";
import { DEFAULT_PROJECT_CONFIG } from "@/lib/types";

// ============================================
// Store Interface
// ============================================

interface EditorStore {
    // Image Assets
    images: ImageAsset[];
    addImages: (files: File[]) => void;
    addImageAssets: (assets: ImageAsset[]) => void;
    removeImage: (id: string) => void;
    clearImages: () => void;
    setImageFocalPoint: (imageId: string, focalPoint: FocalPoint) => void;
    reorderImages: (fromIndex: number, toIndex: number) => void;

    // Slides (generated from images)
    slides: SlideConfig[];
    setSlides: (slides: SlideConfig[]) => void;

    // Project Configuration
    config: ProjectConfig;
    updateConfig: <K extends keyof ProjectConfig>(
        key: K,
        value: ProjectConfig[K]
    ) => void;

    // Transition Settings
    toggleTransition: (transition: TransitionType) => void;

    // Layout Style Settings
    toggleLayoutStyle: (style: string) => void;

    // Playback State
    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;
    currentFrame: number;
    setCurrentFrame: (frame: number) => void;

    // Export State
    isExporting: boolean;
    exportProgress: number;
    setExportProgress: (progress: number) => void;
    setIsExporting: (exporting: boolean) => void;
}

// ============================================
// Utility Functions
// ============================================

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

async function createImageAsset(file: File): Promise<ImageAsset> {
    const url = URL.createObjectURL(file);

    // Get image dimensions
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = url;
    });

    return {
        id: generateId(),
        url,
        file,
        width: img.naturalWidth,
        height: img.naturalHeight,
    };
}

// ============================================
// Store Implementation
// ============================================

import { persist } from "zustand/middleware";

export const useEditorStore = create<EditorStore>()(
    persist(
        (set, get) => ({
            // Image Assets
            images: [],

            addImages: async (files: File[]) => {
                const imageFiles = files.filter((f) => f.type.startsWith("image/"));
                const newAssets = await Promise.all(imageFiles.map(createImageAsset));
                set((state) => ({ images: [...state.images, ...newAssets] }));
            },

            addImageAssets: (assets: ImageAsset[]) => {
                set((state) => ({ images: [...state.images, ...assets] }));
            },

            removeImage: (id: string) => {
                const image = get().images.find((img) => img.id === id);
                if (image) {
                    URL.revokeObjectURL(image.url);
                }
                set((state) => ({
                    images: state.images.filter((img) => img.id !== id),
                }));
            },

            clearImages: () => {
                get().images.forEach((img) => URL.revokeObjectURL(img.url));
                set({ images: [], slides: [] });
            },

            setImageFocalPoint: (imageId: string, focalPoint: FocalPoint) => {
                set((state) => ({
                    images: state.images.map((img) =>
                        img.id === imageId ? { ...img, focalPoint } : img
                    ),
                }));
            },

            reorderImages: (fromIndex: number, toIndex: number) => {
                set((state) => {
                    const newImages = [...state.images];
                    const [removed] = newImages.splice(fromIndex, 1);
                    newImages.splice(toIndex, 0, removed);
                    return { images: newImages };
                });
            },

            // Slides
            slides: [],
            setSlides: (slides) => set({ slides }),

            // Config
            config: DEFAULT_PROJECT_CONFIG,

            updateConfig: (key, value) =>
                set((state) => ({
                    config: { ...state.config, [key]: value },
                })),

            // Transitions
            toggleTransition: (transition) =>
                set((state) => {
                    const enabled = state.config.enabledTransitions;
                    const isEnabled = enabled.includes(transition);
                    return {
                        config: {
                            ...state.config,
                            enabledTransitions: isEnabled
                                ? enabled.filter((t) => t !== transition)
                                : [...enabled, transition],
                        },
                    };
                }),

            // Layout Styles
            toggleLayoutStyle: (style) =>
                set((state) => {
                    const allowed = state.config.allowedStyles || [];
                    const isAllowed = allowed.includes(style);
                    let newAllowed;

                    if (isAllowed) {
                        newAllowed = allowed.filter((s) => s !== style);
                    } else {
                        newAllowed = [...allowed, style];
                    }

                    // Enforce at least one style is selected (fallback to grid if empty)
                    if (newAllowed.length === 0) newAllowed = ["grid"];

                    return {
                        config: {
                            ...state.config,
                            allowedStyles: newAllowed,
                        },
                    };
                }),

            // Playback
            isPlaying: false,
            setIsPlaying: (playing) => set({ isPlaying: playing }),
            currentFrame: 0,
            setCurrentFrame: (frame) => set({ currentFrame: frame }),

            // Export
            isExporting: false,
            exportProgress: 0,
            setExportProgress: (progress) => set({ exportProgress: progress }),
            setIsExporting: (exporting) => set({ isExporting: exporting }),
        }),
        {
            name: "automosaic-storage",
            partialize: (state) => ({ config: state.config }), // Only persist config
        }
    )
);
