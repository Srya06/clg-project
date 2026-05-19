# Code-D-F Frontend Project Documentation

This document provides a comprehensive, high-fidelity breakdown of the current state of the **Code-D-F** frontend platform. It covers everything from the core architecture to the minute implementation details of the interactive engine.

---

## 1. Core Architecture & Tech Stack

### **Foundational Frameworks**
- **Next.js 14.2 (App Router)**: The project uses the latest Next.js architecture, leveraging Server Components and the file-based App Router system located in `src/app`.
- **TypeScript**: Strictly typed throughout, ensuring architectural integrity and preventing runtime regressions.
- **Tailwind CSS**: The primary styling engine, utilizing custom configuration for premium animations and design tokens.

### **Design System & UI Components**
- **ShadCN UI**: Integrated as the base component library. Components are located in `src/components/ui/` and have been customized for a premium dark-themed aesthetic.
  - **Customized Components**: `Button`, `Card`, `Form`, `Input`, `Label`, `Toast`, and `Toaster`.
- **Lucide React**: For sleek, consistent iconography.

---

## 2. Directory Structure (The "Minute" Details)

The project follows a modular "Clean Architecture" pattern for scalability:

- **`src/app/`**: Contains the routing logic and page definitions.
  - **`(auth)/`**: Route group containing the login and registration flows.
  - **`(dashboard)/`**: Route group containing the `hod` and `student` specialized views.
  - **`api/`**: Server-side API route handlers.
- **`src/components/`**: Divided into `ui` (primitives) and `shared` (complex cross-page components).
- **`src/lib/`**: Contains core utilities (`api.ts`, `auth.ts`, `utils.ts`) and global constants.
- **`src/stores/`**: Client-side state management (e.g., `authStore.ts` for session persistence).
- **`src/validations/`**: Zod schemas for rigorous client-side form validation (e.g., `auth.schema.ts`).
- **`src/services/`**: Abstracted logic for communicating with external APIs or backend services.

---

## 3. Key Feature: The Interactive Intro Engine

The most technically complex part of the frontend is the **Geometric Intro Background**.

### **The WebGL Engine (`geometric-blur-mesh.tsx`)**
Located in `src/components/ui/`, this is a high-performance WebGL implementation using a custom fragment shader.
- **Ghostly Morphing Logic**:
  - The shader interpolates between 8 unique 3D wireframe geometries (Cube, Tetrahedron, Octahedron, Icosahedron, etc.).
  - **Unpredictability**: Upon cursor hover, a target shape is selected randomly.
  - **Camouflage Effect**: Uses `u_morphProgress` to slowly cross-fade between shapes over 2.5s, creating a spectral, fluid transition.
- **The "Splash Reveal" UX (Option A)**:
  - **Initial State**: The landing page UI is completely hidden (`opacity-0`) on load.
  - **Interaction Trigger**: As soon as the WebGL canvas detects the first cursor interaction, it fires an `onHoverTrigger` callback to `page.tsx`.
  - **Coordinated Reveal**: The Hero content (Title, Buttons) then performs a smooth upward fade-in animation using Tailwind `animate-fade-in-up`.

---

## 4. Current Module Status

| Module | Status | Details |
| :--- | :--- | :--- |
| **Landing Page** | ✅ Complete | Full Splash Reveal logic and interactive mesh background. |
| **Authentication** | 🏗️ Scaffolding | Login/Register pages created with Zod validations. |
| **HOD Dashboard** | 🏗️ Initial Build | Multi-card layout with analytics placeholders implemented. |
| **Student Dashboard** | 🏗️ Placeholder | Initial structure for roadmap visualization. |
| **State Management** | ✅ Foundation | `authStore` established for session management. |
| **API Integration**| 🏗️ Drafting | `lib/api.ts` configured for backend communication. |

---

## 5. Minute Implementation Highlights

- **Culling and Buffers**: Fixed the WebGL Screen Quad buffer to ensure 100% viewport coverage, resolving previous clipping bugs.
- **Icosahedron Topology**: The icosahedron shader logic has been manually refined to include all 30 unique edges for a solid, high-fidelity wireframe look.
- **Performance**: The animation loop uses `requestAnimationFrame` and `useRef` for shader uniforms to maintain a consistent 60FPS without React re-render overhead.
- **SEO**: Implemented semantic HTML5 tags and descriptive heading hierarchies on the landing page.

---

## 6. Development Workflow

- **Dev Server**: `npm run dev` (running on custom ports if conflicts occur).
- **Type Checking**: Proactive checking via `npx tsc --noEmit`.
- **Build System**: Next.js production builds optimized for static page generation and server-side traces.

---

## 7. Backend Integration Architecture

The frontend is formally linked to the backend service via a secure API bridge.

### **Networking & Endpoints**
- **Base URL**: `http://localhost:5000/api/v1` (configured via `NEXT_PUBLIC_API_URL` in `.env.local`).
- **Development Port**: Backend on `5000`, Frontend typically on `3000-3002`.
- **CORS Policy**: The backend uses dynamic origin detection, allowing the frontend's local development ports while maintaining strict origin checking in production.

### **Authentication Flow**
- **Transport**: Every request is made using a custom Axios instance (`api.ts`) configured with `withCredentials: true`.
- **Strategy**: 
  - The backend issues secure **HTTP-Only Cookies** for session management.
  - The frontend automatically sends these cookies with every API request.
  - Session state is mirrored in the client-side `useAuthStore` (powered by Zustand) to handle UI-level access control.

### **Environment Configuration**
Frontend environment variables are managed through:
1. **`.env.local`**: For local development override.
2. **`src/lib/constants.ts`**: For global fallback values.

---

*This `description.md` serves as the current source of truth for the Code-D-F frontend architecture.*
