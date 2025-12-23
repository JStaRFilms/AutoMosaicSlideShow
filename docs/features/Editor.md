# Feature: Editor (State Management)

The Editor is the central hub of AutoMosaic, managing the application state, user configuration, and image assets. It relies heavily on **Zustand** for global state management.

## 📦 Core Components

### `useEditorStore`
Located in `src/stores/editor-store.ts`, this store manages:

1.  **Image Assets**: Raw file data, URLs, and dimensions.
2.  **Slides**: Generated slide configurations (layout type, images per slide).
3.  **Project Config**: Global settings like resolution, duration, and style preferences.
4.  **Playback State**: Current frame, playing status.

## 🏗️ State Structure

```typescript
interface EditorStore {
  images: ImageAsset[];       // Uploaded images
  slides: SlideConfig[];      // Generated slides for timeline
  config: ProjectConfig;      // User settings (fps, width, height)
  
  // Playback
  isPlaying: boolean;
  currentFrame: number;
  
  // Export
  isExporting: boolean;
  exportProgress: number;
}
```

## ⚙️ Configuration (`ProjectConfig`)

The `config` object persists to local storage (via `zustand/middleware/persist`).

-   **`durationPerSlide`**: Length of each slide in seconds.
-   **`aspectRatio`**: "16:9", "9:16", or "1:1".
-   **`resolution`**: "720p", "1080p", "4k".
-   **`enabledTransitions`**: List of allowed transition types (e.g., "fade", "wipe").
-   **`allowedStyles`**: List of allowed layout styles (e.g., "grid", "collage").

## 🔄 Key Actions

-   **`addImages(files: File[])`**: Processes uploaded files, extracts dimensions, and creates blob URLs.
-   **`setSlides(slides: SlideConfig[])`**: Updates the timeline (usually called by the Layout Engine).
-   **`updateConfig(key, value)`**: Updates a specific configuration setting.
-   **`toggleTransition(type)`**: Toggles a specific transition on/off.

## 🔌 Integration

The Editor store is consumed by:
-   **`ControlSidebar`**: To update settings.
-   **`Timeline`**: To display slides.
-   **`Player`**: To sync playback state.
-   **`Uploader`**: To add new images.
