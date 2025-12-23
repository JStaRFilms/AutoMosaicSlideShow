# AutoMosaic: Project Requirements Document (PRD)

## Functional Requirements

| Requirement ID | Description | User Story | Expected Behavior / Outcome | Status |
| :--- | :--- | :--- | :--- | :--- |
| FR-001 | Image Import | As a creator, I want to drag and drop a folder of images, so that I don't have to select them one by one. | Images are stored in local browser state (Blobs) for processing. | MUS |
| FR-002 | Random Layout Engine | As a creator, I want the app to automatically group images into aesthetic layouts, so that the slideshow looks professionally designed. | Layouts cycle between "Grid", "Hero", "Stacked", and "Scattered" styles. | MUS |
| FR-003 | Randomized Transitions | As a creator, I want transitions between slides to be randomized, so that the video feels dynamic. | System picks from a set of approved transitions (Fade, Slide, Morph, etc.) with exclusions. | MUS |
| FR-004 | Configuration UI | As a creator, I want to tweak duration, gap size, and background colors, so that I have creative control. | Real-time sliders update the Remotion Player preview. | MUS |
| FR-005 | Video Export (MP4) | As a creator, I want to export the final result as an MP4, so that I can share it on social media. | Uses Remotion Renderer to stitch frames into a video. | MUS |
| FR-006 | Image Export (PNG) | As a creator, I want to capture each slide as a high-res image, so that I can use them as static content. | Iterates timeline and saves frames as individual files. | MUS |
| FR-007 | Resolution Presets | As a creator, I want to choose between 1080p, 4K, and 9:16 Vertical, so that my content fits different platforms. | Composition restarts with new dimensions/padding. | MUS |
| FR-010 | Stacked Image Cycle | As a creator, I want stacked images to cycle their z-index, so that every image in the stack is eventually shown in front. | Within a single slide duration, images at the back are animated to the front. | MUS |
| FR-011 | Smart Duration Distribution | As a creator, I want to set a total video duration and have the system calculate slide timings with variance, so that the video hits the target time dynamically. | User inputs "Total Time" (e.g., 60s). System assigns durations based on slide complexity (more images = longer time). | MUS |
| FR-008 | Project History | As a creator, I want to see my past generated projects, so that I can revisit or re-render them. | Uses Prisma/SQLite to store configuration "blueprints". | Future |
| FR-009 | Cloud Hosting | As a creator, I want to host this online, so that I can access it from anywhere. | Deployable to Vercel/AWS Lambda. | Future |

## Technical Constraints
- No heavy server-side processing for MUS (Browser-based Remotion rendering).
- Must support **Light and Dark Mode**.
- Prisma for future-proofing database migration.
