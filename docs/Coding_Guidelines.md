# AutoMosaic: Coding Guidelines

## The Blueprint and Build Protocol (Mandatory)

This protocol governs the entire lifecycle of creating any non-trivial feature.

### Phase 1: The Blueprint (Planning & Documentation)
Before writing code, a plan MUST be created in `docs/features/FeatureName.md`. This plan must detail:
- High-Level Goal
- Component Breakdown (label "Server" or "Client")
- Logic & Data Breakdown (hooks, API routes)
- Database Schema Changes (if any)
- Step-by-Step Implementation Plan

**This plan requires human approval before proceeding.**

### Phase 2: The Build (Iterative Implementation)
Execute the plan one step at a time. Present code AND updated documentation after each step.
Wait for "proceed" signal before continuing.

### Phase 3: Finalization
Announce completion. Present final documentation. Provide integration instructions.

---

## Technical Standards

### Next.js & React
- **Server First**: Components are Server Components by default.
- **Client Sparingly**: Only use `'use client'` for Remotion Player, forms, and drag-and-drop.
- **Styles**: Pure Tailwind CSS. No external component libraries unless approved.

### Remotion
- Use `@remotion/transitions` for sequence transitions.
- Prefer `AbsoluteFill` for composition layouts.
- Props must be validated with `zod` schema.

### Database (Prisma)
- Use SQLite for local development.
- All database queries must be wrapped in a Service layer (e.g., `src/services/project.service.ts`).

### State Management
- Use **Zustand** for image asset management and global settings.
- Avoid prop-drilling beyond 2 levels.
