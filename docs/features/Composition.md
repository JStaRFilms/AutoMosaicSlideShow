# Feature: Composition (Remotion)

The Composition module is responsible for rendering the actual video output using **Remotion**. It takes the logical slide structure and turns it into a frame-based video sequence.

## 🎬 Core Components

### `MosaicComposition`
Located in `src/features/composition/MosaicComposition.tsx`.

This is the root component registered in `remotion.index.ts`. It orchestrates:
1.  **Slide Sequencing**: Iterates through `slides` configuration.
2.  **Transitions**: Inserts transitions between slides using `@remotion/transitions`.
3.  **Layout Rendering**: Delegates content rendering to `SlideLayout`.

### `SlideLayout`
Located in `src/features/composition/SlideLayout.tsx`.

Renders a single slide based on its layout type. It uses the grid system to position images.
-   **Input**: List of images, layout type (e.g., "grid-2x2"), gap size.
-   **Output**: Absolute positioned `Img` elements tailored to the composition resolution.

## 🎞️ Transition Architecture

We use `TransitionSeries` from `@remotion/transitions` to handle complex timeline logic.

```tsx
<TransitionSeries>
  {slides.map((slide, i) => (
    <React.Fragment key={slide.id}>
      {/* The Slide Content */}
      <TransitionSeries.Sequence durationInFrames={slide.durationFrames}>
        <SlideLayout ... />
      </TransitionSeries.Sequence>

      {/* The Transition (if not last slide) */}
      <TransitionSeries.Transition
         presentation={getRandomTransition()}
         timing={linearTiming({ durationInFrames: 30 })}
      />
    </React.Fragment>
  ))}
</TransitionSeries>
```

## 🧮 Frame Calculation

Use `calculateTotalFrames` helper to determine the composition duration.
*   **Formula**: `Sum(Slide Durations) - Sum(Transition Overlaps)`
*   Transitions consume frames from *both* the incoming and outgoing slides, creating an overlap.

## 🎨 Supported Transitions

Defined in `src/features/composition/transitions.ts`:
-   `fade`
-   `slide-left` / `slide-right` / `slide-up` / `slide-down`
-   `wipe`
-   `flip`
