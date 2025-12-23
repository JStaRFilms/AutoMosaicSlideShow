# AutoMosaic: Roadmap & Issues

## [Issue #1] Project Scaffolding
- **Labels**: `MUS`, `infrastructure`
- **User Story**: As a developer, I want a clean Next.js/Remotion project, so that I can start building features.
- **Solution**: Run `npx create-remotion@latest`, setup Prisma, and Tailwind.
- **Acceptance Criteria**:
  - [x] App runs with `npm run dev`.
  - [x] Placeholder Remotion composition renders in browser.
  - [x] Prisma connected to `dev.db`.

## [Issue #2] The Layout Engine
- **Labels**: `MUS`, `logic`
- **User Story**: As a creator, I want images to be automatically arranged, so I don't have to design slides.
- **Solution**: Create `src/features/layout/LayoutEngine.ts` with template logic.
- **Acceptance Criteria**:
  - [x] Supports 1-6 images per slide.
  - [x] Randomly selects between 4 layout types.
  - [x] Stacked layouts implement a "z-index cycle" animation.

## [Issue #3] Drag-and-Drop Uploader
- **Labels**: `MUS`, `UI`
- **User Story**: As a creator, I want to quickly import my images.
- **Solution**: Implement `src/features/upload/Uploader.tsx` using `react-dropzone`.
- **Acceptance Criteria**:
  - [x] Accepts files and folders.
  - [x] Generates object URLs for preview.

## [Issue #4] Video Composition & Transitions
- **Labels**: `MUS`, `Remotion`
- **User Story**: As a creator, I want my slides to animate together beautifully.
- **Solution**: Use `<TransitionSeries>` to link layout components. Implement `calculateSlideDurations(totalTime, slides)` helper.
- **Acceptance Criteria**:
  - [x] Randomized transitions between every slide.
  - [x] Global "Duration" setting respected.
  - [x] "Total Duration" mode distributes time unevenly (complex slides get more time).

## [Issue #5] Export Pipeline
- **Labels**: `MUS`, `feature`
- **User Story**: As a creator, I want to download my video.
- **Solution**: Implement browser-based export using `@remotion/renderer`.
- **Acceptance Criteria**:
  - [x] Renders MP4 file.
  - [x] Renders PNG zip (Stills).

## [Issue #6] Smart Face Detection
- **Labels**: `enhancement`, `AI`
- **User Story**: As a creator, I want the app to automatically detect faces and set focal points, so that compositions look good without manual work.
- **Solution**: Integrate `face-api.js` (or similar) to detect faces in uploaded images. Calculate the center of the bounding box and store it as `focalPoint` in the ImageAsset.
- **Acceptance Criteria**:
  - [ ] Detects faces in uploaded images client-side.
  - [ ] Fallback to center (50% 50%) if no face found.
  - [ ] Visual indicator in Editor showing detected face center.

## [Issue #7] Project History
- **Labels**: `feature`, `persistence`
- **User Story**: As a creator, I want to see my past generated projects, so that I can revisit or re-render them.
- **Solution**: Use Prisma with SQLite to save `EditorState` snapshots. Add a "Projects" dashboard page.
- **Acceptance Criteria**:
  - [ ] Auto-save project definition to DB.
  - [ ] Dashboard listing past projects.
  - [ ] "Load" button restores state.

## [Issue #8] Cloud Hosting Preparation
- **Labels**: `infrastructure`, `deploy`
- **User Story**: As a creator, I want to host this online, so that I can access it from anywhere.
- **Solution**: Ensure no fs-dependent code runs in the browser path. Configure Vercel build settings.
- **Acceptance Criteria**:
  - [ ] `npm run build` passes.
  - [ ] Environment variables configured for production.
