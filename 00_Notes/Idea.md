---
type: project
category: Code
client: None
status: active
created: 2025-12-23
tags: [creativeos]
---

# AutoMosaic
Yeah, hi Gemini. Um, so the the project I have in mind is very very simple. It's kind of complex, but it's simple basically it's like an a video an image slideshow application. Do you understand? So all I want to do is to be able to put in all the images maybe like in a folder and then the application randomly select images and put them like Slide by slide. So maybe we could do to make it better. Maybe I can have like an option of how many images I want past slide and then the then the application automatically just like create a green or something. I did to make him more complex stacked grid so like the image so it's not too repeated. Remember to configure the duration of each slide then maybe like a transition between its slide that kind of thing. So I'm thinking there are two options either. We just like basically just covered images. Do you understand saying, separately and then those images get saved like sliver slide and I can choose resolution of the output Slide by the way, or we actually my baby to make an application that stitches everything together. Do you understand what I'm saying? So if possible this will be really cool. Um something I could maybe even host online. So maybe like typescript really FM peg or something like that. So yeah, that's like what my vision is. So how how possible is it, please?

---

This is **100% possible**, and honestly, it’s a perfect project for the "vibecoder" stack because it sits right at the intersection of creative coding (layouts) and systems engineering (rendering pipelines).

Since you mentioned TypeScript and wanting to host it online, I have a specific architectural recommendation that will save you from reinventing the wheel (especially the "stitching" part).

Here is the blueprint for how we can build this.

### The "Secret Weapon": Remotion

Instead of manually calculating frames and feeding them into FFmpeg via a raw shell command (which is painful to debug), we should use **Remotion**.

It allows you to write videos using **React & TypeScript**.

* **Why it fits your vision:** You mentioned "grids," "slides," and "transitions." In Remotion, a "Slide" is just a React component. A "Grid" is just CSS Grid or Flexbox.
* **The "Complex" part made Simple:** Remotion handles the timeline (duration, FPS) and the stitching.

### The Architecture

**1. The Frontend (The Controller)**

* **Tech:** Next.js + Tailwind CSS.
* **User Action:** User drags and drops a folder of images.
* **Logic:**
* We read the file blobs.
* **The "Random Engine":** We write a function that takes the array of images and "chunks" them based on your settings (e.g., 4 images per slide).
* **The Layout Engine:** This is where we get fancy. We don't just do a boring 2x2 grid. We use a **Masonry layout** or a recursive partition algorithm (like a "Treemap") to size images dynamically so they look "stacked" and cool.



**2. The Previewer**

* Before processing anything, we show the user a preview using the **Remotion Player**.
* This renders the video in real-time in the browser using HTML/CSS. They can tweak the "Duration per slide" slider and see the result instantly.

**3. The Rendering (The Output)**
You mentioned two output options. We can support **both** with the same codebase:

* **Option A (Image Sequence):** Remotion can export the current frame as a PNG. We can loop through the timeline, capture the "Slide" moments, and zip them up.
* **Option B (Video Stitching):** This is the heavy lifting.
* *Client-Side Only:* We can use `@remotion/renderer` combined with a browser-based Lambda approach or just `ffmpeg.wasm` (slower, but runs in browser).
* *Server-Side (Pro Way):* You send the "configuration" (JSON of which images go where) to a server. The server runs a headless browser, renders the frames, stitches them with FFmpeg, and returns an MP4 link.



### The "Vibecoder" Challenge: The Auto-Grid

The most interesting logic to build here is the `generateLayout()` function.

If you want the "stacked grid" look you described, we avoid standard grid. Instead, we define a container (say, 1920x1080) and use a packing algorithm:

1. Take 5 random images.
2. Assign them "weights" (e.g., Image A is the "Hero" and takes 50% width, Image B/C/D stack on the right).
3. Randomize these templates so Slide 1 looks different from Slide 2.

### Feasibility Rating

* **Complexity:** 6/10 (The video rendering pipeline is the hardest part, UI is easy).
* **Stack:** TypeScript, React, Remotion, FFmpeg (optional if using Remotion cloud, mandatory if local).
* **Hosting:** Vercel (frontend) + AWS Lambda (for fast rendering) OR just a powerful client-side runner.

**Would you like me to whip up a prototype of the "Random Layout Engine" in TypeScript?** That’s the core logic that makes the slides look good.

---

hmm ok so now I want to handoof to my local agent to build it so pleae write all the details so it can start work on it 
like the name of the project etc...

---

Here is the comprehensive Project Handoff Document designed for your local AI agent. Save this as `PROJECT_SPEC.md` or paste it directly into your agent's context window.

I have named the project **"AutoMosaic"** to reflect the automated stitching and grid layouts.

---

# Project Specification: AutoMosaic

## 1. Project Overview

**Goal:** Build a web-based TypeScript application that accepts a collection of images, automatically groups them into random "slides" using complex/aesthetic grid layouts (not just uniform grids), and renders them into a video slideshow or exports them as individual high-res slide images.

**Core Vibe:** "Controlled Chaos." The layout should feel dynamic and designed, not basic.

## 2. Tech Stack

* **Framework:** Next.js (App Router)
* **Language:** TypeScript
* **Video Engine:** [Remotion](https://www.remotion.dev/)
* **Styling:** Tailwind CSS
* **Icons:** Lucide React
* **State Management:** React Context or Zustand (for managing the image file blobs and global settings)

## 3. Core Features & Requirements

### A. Input Module

* **Drag & Drop:** Allow users to drop a folder or multiple image files.
* **Processing:** Store images as Object URLs (Blobs) locally in the browser memory for immediate preview.

### B. The "Layout Engine" (Crucial Logic)

* Instead of a fixed 2x2 grid, implement a **Weighted Partitioning** or **Bento Grid** algorithm.
* **Logic:**
1. User defines `imagesPerSlide` (e.g., range 1-5).
2. Engine iterates through the image list.
3. For each slide, it picks a "Layout Template" based on the count.
4. *Example Template (4 images):* One large image on the left (50% width), three small stacked on the right.


* **Randomization:** Shuffle the templates so Slide 1 differs from Slide 2.

### C. Configuration UI

* **Sliders/Inputs:**
* Images per Slide (Min/Max).
* Slide Duration (in seconds).
* Background Color (for gaps/padding).
* Gap Size (padding between images).


* **Transition Selector:** Use `@remotion/transitions` (Fade, Slide, Wipe) between slides.

### D. Preview & Render

* **Player:** Embed the `<Player />` component from Remotion to show the slideshow in real-time.
* **Export Option A (Video):** Use `@remotion/renderer` (or browser-based rendering) to output an MP4.
* **Export Option B (Stills):** A button to "Capture All Slides" which iterates the timeline and saves each slide layout as a high-res PNG.

## 4. Implementation Steps for Agent

### Phase 1: Setup

1. Initialize a new Remotion project using the Next.js template:
`npx create-remotion@latest --template next`
2. Install Tailwind CSS.
3. Install `@remotion/transitions`.

### Phase 2: Data Structure (TypeScript Interfaces)

Create a file `types.ts`:

```typescript
export interface ImageAsset {
  id: string;
  src: string; // Object URL
  width: number;
  height: number;
}

export interface SlideSchema {
  id: string;
  images: ImageAsset[];
  layoutType: 'hero-left' | 'hero-right' | 'uniform-grid' | 'mosaic';
  durationInFrames: number;
}

export interface ProjectConfig {
  fps: number;
  minImagesPerSlide: number;
  maxImagesPerSlide: number;
  slideDurationSeconds: number;
  gapSize: number;
}

```

### Phase 3: The Layout Components

Create a generic `SlideContainer` component that accepts `SlideSchema`.

* Implement CSS Grid/Flexbox logic that changes based on `layoutType`.
* *Prompt for Agent:* "Create a React component that takes an array of images and renders them in a CSS Grid. If the layout is 'hero-left', the first child spans 2 rows."

### Phase 4: The Composition

* Create the main `Composition.tsx`.
* Calculate total frames: `(Total Slides * DurationPerSlide * FPS) + TransitionFrames`.
* Use `<Series>` from Remotion to sequence the slides.
* Wrap slides in `<TransitionSeries>` for the effects.

### Phase 5: The UI Wrapper

* Build the Next.js page with a sidebar for settings and a main area for the Remotion Player.

## 5. Specific Directives for the Agent

* **DO NOT** use FFmpeg directly via shell commands yet. Stick to Remotion's React ecosystem for the logic.
* **DO** ensure the aspect ratio of the composition is configurable (16:9 Landscape vs 9:16 Vertical for TikTok/Shorts).
* **DO** use `zod` schema for prop validation if using Remotion Studio.

## 6. Execution Command

*Agent, please start by initializing the project structure and creating the `types.ts` file defined above, then implement the basic "Layout Engine" logic.*