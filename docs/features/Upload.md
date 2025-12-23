# Feature: Upload (Asset Management)

The Upload feature handles ingesting user media into the application. Since AutoMosaic handles large media files entirely in the browser (for privacy and speed), efficient asset management is critical.

## 📤 Core Component: `Uploader`

Located in `src/features/upload/Uploader.tsx`.

-   **Library**: Uses `react-dropzone` for drag-and-drop interactions.
-   **Supported Types**: `image/png`, `image/jpeg`, `image/webp`, `image/gif`, `image/avif`.
-   **Modes**:
    -   **Full Screen**: Initial state when no images exist.
    -   **Compact**: Sidebar/Timeline integration for adding more images.

## 🔄 Data Flow

1.  **User Drop**: User drops a folder or selects files.
2.  **Validation**: Filters for valid image MIME types.
3.  **Blob Creation**: `URL.createObjectURL(file)` allows instant preview without uploading to a server.
4.  **Dimension Extraction**: An invisible `Image` object is instantiated to read `naturalWidth` and `naturalHeight`. This is **crucial** for the Layout Engine to calculate aspect ratios.
5.  **Store Update**: The processed `ImageAsset` object is dispatched to the `EditorStore`.

## ⚠️ Known Limitations

-   **Memory**: Since we use Blob URLs, reloading the page clears the images (unless we implement IndexedDB persistence, which is not yet done).
-   **File Size**: extremely large files (e.g., 50MB+ raw photos) may cause browser stuttering if many are loaded at once.

## 🔮 Future Improvements

-   [ ] **IndexedDB Support**: Persist images across reloads.
-   [ ] **Image Optimization**: Downscale massive images before processing to save RAM.
