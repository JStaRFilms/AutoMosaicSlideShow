# Feature: Export Pipeline

The Export Pipeline enables users to generate high-quality video (MP4) or image sequences (PNG) from their compositions. Due to the resource-intensive nature of rendering 4K content, we utilize a **Hybrid Browser-to-CLI** approach.

## 🏗️ Architecture

### Challenge
Pure browser-based rendering (via `Wasm` or strictly client-side) can run out of memory with large image sets or 4K resolutions. Server-side rendering requires expensive infrastructure.

### Solution: Local Command Generation
We leverage the user's local machine power (the "Pro Dev" vibe) by syncing assets to disk and generating a standardized `remotion render` command.

## 🔄 The Flow

1.  **Asset Sync** (`ExportDialog` -> `/api/save-assets`):
    - User clicks Export.
    - Browser uploads all `File` objects (images) to `public/uploads/`.
    - Server returns a map of filenames to absolute paths.
    - Browser generates a `render-props.json` file containing the full state, but with image URLs replaced by local HTTP paths (e.g., `http://localhost:3000/uploads/image.jpg`).

2.  **Command Generation**:
    - The UI constructs the exact command string needed to render the project.
    - **Video Mode (FR-005)**: `pnpm exec remotion render src/index.ts ...`
    - **Stills Mode (FR-006)**: `... --image-format=png --sequence ...`

3.  **Execution**:
    - User copies the command.
    - User pastes it into their terminal.
    - Remotion engine runs locally, using the synced `render-props.json` and served assets.

## 📦 Components

-   **`src/components/ui/ExportDialog.tsx`**: Main UI. Handles file sync logic and command string generation.
-   **`src/app/api/save-assets/route.ts`**: Helper API to write blobs to disk during the sync phase.
-   **`public/uploads/`**: Ephemeral storage for export assets.

## 🛠️ Configuration Options

-   **Format**: MP4 Video or PNG Sequence.
-   **Concurrency**:
    -   **Fast**: Uses all cores (default).
    -   **Stable**: Single core (`--concurrency=1`) for heavy memory loads.
