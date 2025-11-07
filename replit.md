# ChronoTransit - Time Travel Idle Game

## Overview

ChronoTransit is an idle/incremental game where players operate a time machine business, transporting customers to various historical periods. The game features a 3D visualization using React Three Fiber, progression mechanics through upgrades and unlockables, and a prestige system for long-term engagement. Built with React for the frontend and Express.js for the backend, the application follows a full-stack TypeScript architecture with potential for future multiplayer or persistent features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**React + TypeScript SPA**: The client uses a modern React setup with TypeScript, providing type safety throughout the component hierarchy.

**3D Rendering with React Three Fiber**: The game scene is rendered using `@react-three/fiber`, which wraps Three.js in a React-friendly API. This choice enables declarative 3D scene composition and integrates seamlessly with React's component model. The 3D scene includes:
- An animated time machine centerpiece that responds to game state
- Customer entities positioned in a circular queue
- Visual feedback through color changes and animations based on selected destinations

**State Management with Zustand**: Multiple Zustand stores handle different aspects of game state:
- `useIdleGame`: Core game mechanics (currency, upgrades, customers, progression)
- `useAudio`: Sound effects and music management
- `useGame`: General game phase control (ready, playing, ended)

This separation of concerns allows independent updates and easier testing. Zustand was chosen over Redux for its simpler API and smaller bundle size, appropriate for a game with focused state requirements.

**UI Component Library**: Radix UI primitives provide accessible, unstyled components that are then styled with Tailwind CSS. This approach balances customization flexibility with accessibility best practices.

**Animation and Effects**: The application uses `@react-three/postprocessing` for visual effects in the 3D scene, enhancing the "time travel" aesthetic with bloom and other shader effects.

**Game Loop Pattern**: A custom `GameLoop` component runs on `requestAnimationFrame`, calling an update function with delta time. This pattern decouples rendering from game logic updates and ensures consistent behavior across different frame rates.

### Backend Architecture

**Express.js Server**: A minimal Express server handles API routes and serves the production build. The server is structured to:
- Register routes with a `/api` prefix convention
- Provide middleware for JSON parsing and request logging
- Support custom error handling

**Storage Layer Abstraction**: The `IStorage` interface defines CRUD operations for game entities (currently users). A `MemStorage` implementation provides in-memory storage for development. This abstraction enables easy swapping to database-backed storage without changing route handlers.

**Development vs Production Modes**: Vite's development server integrates with Express in middleware mode during development, enabling HMR. Production mode serves a pre-built static bundle from the `dist` directory.

### Data Storage Solutions

**PostgreSQL with Drizzle ORM**: The application is configured to use PostgreSQL via Neon's serverless driver for production database needs. Drizzle provides:
- Type-safe schema definitions in TypeScript
- Migration generation and management
- A lightweight query builder that compiles to SQL

The schema currently defines a basic users table with username/password fields. The ORM choice balances developer experience (TypeScript-first) with performance (minimal runtime overhead).

**In-Memory Fallback**: The `MemStorage` class provides local state persistence during development or for stateless deployments, allowing the game to function without database connectivity.

### External Dependencies

**Neon Serverless PostgreSQL**: Database hosting with serverless architecture, chosen for:
- Automatic scaling based on demand
- Branching capabilities for development workflows
- PostgreSQL compatibility with modern connection pooling

**Radix UI Component Primitives**: Provides 30+ accessible component primitives (`accordion`, `dialog`, `dropdown-menu`, `tabs`, etc.) that serve as the foundation for the game's UI. These components handle complex interaction patterns and accessibility requirements out of the box.

**React Three Fiber Ecosystem**:
- `@react-three/fiber`: React renderer for Three.js
- `@react-three/drei`: Helper components and abstractions for common 3D patterns
- `@react-three/postprocessing`: Post-processing effects for visual polish

**TanStack Query**: HTTP request management with caching, background refetching, and optimistic updates. Configured with custom query functions that handle authentication and error states.

**Tailwind CSS**: Utility-first CSS framework for styling, integrated with:
- Custom design tokens for colors, spacing, and typography
- Dark mode support via class strategy
- PostCSS for processing

**Build Tooling**:
- **Vite**: Fast development server and optimized production builds with HMR
- **esbuild**: Bundles the server code for production deployment
- **TypeScript**: Type checking across client, server, and shared code

**Audio Assets**: The game expects audio files (background music, hit sounds, success sounds) in the public directory, supporting formats like MP3, OGG, and WAV.

**Font Loading**: Uses `@fontsource/inter` for self-hosted font files, eliminating external font service dependencies and improving load performance.