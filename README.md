# AutoMosaic

> A browser-based slideshow generator built with Next.js 16, Remotion, and Tailwind CSS.

AutoMosaic allows users to upload images, configure slide duration and styles, and export high-quality video slideshows completely in the browser (or via a local layout engine).

## 🚀 Features

-   **Drag & Drop Upload**: Easily upload multiple images at once.
-   **Smart Layout Engine**: Automatically arranges images into aesthetically pleasing grids.
-   **Real-time Preview**: See your slideshow changes instantly.
-   **Customizable**: Adjust duration, aspect ratio, and transitions.
-   **Local Export**: High-quality video export powered by Remotion.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
-   **Video Engine**: [Remotion](https://www.remotion.dev/)
-   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
-   **State Management**: [Zustand](https://github.com/pmndrs/zustand)
-   **Validation**: [Zod](https://zod.dev/)

## 📂 Project Structure

This project follows a **Feature-Sliced Design** approach:

```
src/
├── app/                  # Next.js App Router pages & API routes
├── features/             # Vertical feature slices
│   ├── composition/      # Remotion compositions & video logic
│   ├── editor/           # Editor state & UI logic
│   ├── layout/           # The "Brain" (Smart Layout Engine)
│   └── upload/           # File upload & handling
├── components/           # Shared UI components (Buttons, Inputs)
├── styles/               # Global styles & Tailwind config
└── stores/               # Global Zustand stores
```

## 📖 Documentation

Detailed documentation for key features:

-   [**Layout Engine**](/docs/features/Layout_Engine.md): How the smart grid generation works.
-   [**Editor & State**](/docs/features/Editor.md): Managing app state with Zustand.
-   [**Composition**](/docs/features/Composition.md): Remotion video structure and transitions.
-   [**Upload**](/docs/features/Upload.md): Handling file uploads and assets.

## 🏁 Getting Started

1.  **Install dependencies**:
    ```bash
    pnpm install
    ```

2.  **Start the development server**:
    ```bash
    pnpm dev
    ```

3.  **Open the app**:
    Navigate to [http://localhost:3000](http://localhost:3000).

## 🎥 Video Export

To export a video:

1.  Configure your slideshow in the editor.
2.  Click the **Export** button.
3.  Choose your format (Video or Stills).
4.  Choose your render speed:
    - **⚡ Fast** - Uses all CPU cores for faster rendering
    - **🛡️ Stable** - Uses single core (`--concurrency=1`), slower but avoids "socket hang up" errors
5.  Copy and run the generated command in your terminal.

> **Tip**: If you experience crashes or "socket hang up" errors during export, switch to **Stable** mode.

---

*Built with ❤️ by VibeCode*
