import { z } from "zod";

// ============================================
// Image Types
// ============================================

export interface FocalPoint {
  x: number; // 0-100 percentage from left
  y: number; // 0-100 percentage from top
}

export interface ImageAsset {
  id: string;
  url: string; // Object URL from blob
  file: File;
  width?: number;
  height?: number;
  focalPoint?: FocalPoint; // Manual focal point for cropping
}

// ============================================
// Layout Types
// ============================================

export type LayoutType =
  | "grid-2x2"
  | "grid-3x2"
  | "grid-3x3"
  | "hero-left"
  | "hero-right"
  | "bento"
  | "mosaic"
  | "split-vertical"
  | "stacked"
  | "scattered";

export interface LayoutConfig {
  type: LayoutType;
  images: ImageAsset[];
  gap: number; // in pixels
}

export interface SlideConfig {
  id: string;
  layout: LayoutConfig;
  durationFrames: number;
}

// ============================================
// Transition Types
// ============================================

export type TransitionType =
  | "fade"
  | "slide-left"
  | "slide-right"
  | "slide-up"
  | "slide-down"
  | "wipe"
  | "clock-wipe"
  | "none";

// ============================================
// Composition Types
// ============================================

export type ResolutionPreset =
  | "1080p-landscape"
  | "4k-landscape"
  | "1080p-vertical"
  | "1080p-square";

export interface ResolutionConfig {
  width: number;
  height: number;
  label: string;
}

export const RESOLUTION_PRESETS: Record<ResolutionPreset, ResolutionConfig> = {
  "1080p-landscape": { width: 1920, height: 1080, label: "1080p Landscape (1920x1080)" },
  "4k-landscape": { width: 3840, height: 2160, label: "4K Landscape (3840x2160)" },
  "1080p-vertical": { width: 1080, height: 1920, label: "Vertical Story (1080x1920)" },
  "1080p-square": { width: 1080, height: 1080, label: "Square Post (1080x1080)" },
};

// ============================================
// Project Config Types
// ============================================

export interface ProjectConfig {
  name: string;
  resolution: ResolutionPreset;
  backgroundColor: string;
  gapSize: number; // 0-100
  fps: number; // 30 or 60
  totalDurationSeconds: number; // Total video duration
  enabledTransitions: TransitionType[];
  randomizeTransitions: boolean;
  allowedStyles: string[]; // "grid", "hero", "stacked", "scattered"
}

export const DEFAULT_PROJECT_CONFIG: ProjectConfig = {
  name: "Untitled Project",
  resolution: "1080p-landscape",
  backgroundColor: "#000000",
  gapSize: 24,
  fps: 30,
  totalDurationSeconds: 30,
  enabledTransitions: ["fade", "slide-left", "slide-right"],
  randomizeTransitions: true,
  allowedStyles: ["grid", "hero", "stacked", "scattered"],
};

// ============================================
// Zod Schemas for Remotion Props
// ============================================

// Image & Layout Schemas
export const focalPointSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export const imageAssetSchema = z.object({
  id: z.string(),
  url: z.string(),
  file: z.any(), // File object not serializable in all contexts, use any
  width: z.number().optional(),
  height: z.number().optional(),
  focalPoint: focalPointSchema.optional(),
});

export const layoutConfigSchema = z.object({
  type: z.string() as z.Schema<LayoutType>,
  images: z.array(imageAssetSchema),
  gap: z.number(),
});

export const slideConfigSchema = z.object({
  id: z.string(),
  layout: layoutConfigSchema,
  durationFrames: z.number(),
});

// Main Composition Schema
export const compositionPropsSchema = z.object({
  slides: z.array(slideConfigSchema),
  width: z.number(),
  height: z.number(),
  fps: z.number(),
  backgroundColor: z.string(),
  enabledTransitions: z.array(z.string() as z.Schema<TransitionType>),
  randomizeTransitions: z.boolean(),
});

export type CompositionProps = z.infer<typeof compositionPropsSchema>;
