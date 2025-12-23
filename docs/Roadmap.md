# AutoMosaic: Roadmap & Issues

## [Issue #1] Project Scaffolding
- **Labels**: `MUS`, `infrastructure`
- **User Story**: As a developer, I want a clean Next.js/Remotion project, so that I can start building features.
- **Solution**: Run `npx create-remotion@latest`, setup Prisma, and Tailwind.
- **Acceptance Criteria**:
  - [ ] App runs with `npm run dev`.
  - [ ] Placeholder Remotion composition renders in browser.
  - [ ] Prisma connected to `dev.db`.

## [Issue #2] The Layout Engine
- **Labels**: `MUS`, `logic`
- **User Story**: As a creator, I want images to be automatically arranged, so I don't have to design slides.
- **Solution**: Create `src/features/layout/LayoutEngine.ts` with template logic.
- **Acceptance Criteria**:
  - [ ] Supports 1-6 images per slide.
  - [ ] Randomly selects between 4 layout types.
  - [ ] Stacked layouts implement a "z-index cycle" animation.

## [Issue #3] Drag-and-Drop Uploader
- **Labels**: `MUS`, `UI`
- **User Story**: As a creator, I want to quickly import my images.
- **Solution**: Implement `src/features/upload/Uploader.tsx` using `react-dropzone`.
- **Acceptance Criteria**:
  - [ ] Accepts files and folders.
  - [ ] Generates object URLs for preview.

## [Issue #4] Video Composition & Transitions
- **Labels**: `MUS`, `Remotion`
- **User Story**: As a creator, I want my slides to animate together beautifully.
- **Solution**: Use `<TransitionSeries>` to link layout components. Implement `calculateSlideDurations(totalTime, slides)` helper.
- **Acceptance Criteria**:
  - [ ] Randomized transitions between every slide.
  - [ ] Global "Duration" setting respected.
  - [ ] "Total Duration" mode distributes time unevenly (complex slides get more time).

## [Issue #5] Export Pipeline
- **Labels**: `MUS`, `feature`
- **User Story**: As a creator, I want to download my video.
- **Solution**: Implement browser-based export using `@remotion/renderer`.
- **Acceptance Criteria**:
  - [ ] Renders MP4 file.
  - [ ] Renders PNG zip (Stills).
