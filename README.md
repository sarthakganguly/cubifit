Cubifit 🏋️‍♂️
==============

Cubifit is a professional, **privacy-first**, local-centric fitness application built for high performance and offline-first workout management. It allows users to build, customize, and execute workouts directly in the browser with zero cloud dependencies.

🌟 Key Features
---------------

### 🧠 Intelligent Workout Generation

-   **Wizard Mode**: A multi-step guided experience to generate workouts based on equipment (Chair, Desk, Wall), noise constraints, energy levels, and time availability.

    -   **Smart Filtering**: Browse the exercise library with debounced search and deep filtering by muscle group, intensity, and sweat factor.

### ⚡ Professional Workout Execution

-   **High-Performance Timer**: A custom-engineered 60fps timer component designed to prevent unnecessary UI re-renders, ensuring smooth video playback and minimal battery drain on mobile devices.

    -   **Dynamic Queue**: Drag-and-drop reordering of exercises using @dnd-kit to build the perfect routine.

    -   **Workout Logs**: Automatic tracking of completed sessions, total duration, and pause times.

### 🎨 Advanced Personalization

-   **Local Media Manager**: Upload custom images or videos for any exercise. Files are stored natively as Blobs in IndexedDB for maximum performance and minimum memory footprint.

    -   **Dynamic Theming**: Full control over brand colors and UI text scaling with a built-in mechanism to prevent "White Flash" (FOUC) on page loads.

    -   **Advanced Mode**: Toggle experimental features and low-level media management.

### 🔒 Security & Privacy

-   **Zero-Cloud Architecture**: No data ever leaves your device. All workouts, logs, and credentials stay in your browser's IndexedDB.

    -   **Secure Local Auth**: Passwords are secured using industry-standard **SHA-256 hashing** via the Web Crypto API.

    -   **Data Portability**: Integrated JSON Export/Backup tools for manual device-to-device migration.

* * * * *

🛠 Tech Stack
-------------

-   **Framework**: [React 19](https://www.google.com/url?sa=E&q=https%3A%2F%2Freact.dev%2F)

    -   **Routing**: [React Router 6](https://www.google.com/url?sa=E&q=https%3A%2F%2Freactrouter.com%2F) (Native history and deep linking)

    -   **Styling**: [Tailwind CSS 4](https://www.google.com/url?sa=E&q=https%3A%2F%2Ftailwindcss.com%2F)

    -   **State**: [Zustand](https://www.google.com/url?sa=E&q=https%3A%2F%2Fgithub.com%2Fpmndrs%2Fzustand) (Atomic stores for UI, Auth, and Workouts)

    -   **Database**: [Dexie.js](https://www.google.com/url?sa=E&q=https%3A%2F%2Fdexie.org%2F) (High-level IndexedDB wrapper)

    -   **Animations**: [Motion](https://www.google.com/url?sa=E&q=https%3A%2F%2Fmotion.dev%2F)

    -   **Icons**: [Lucide React](https://www.google.com/url?sa=E&q=https%3A%2F%2Flucide.dev%2F)

* * * * *

🚀 Getting Started (Docker)
---------------------------

Cubifit is fully dockerized for a seamless development experience.

### Prerequisites

-   Docker and Docker Compose installed.

### Installation & Execution

-   **Clone and Start**:

    codeBash

    ```
    docker-compose up -d
    ```

    -   **Access the App**:\
    Open http://localhost:3000 in your browser.

    -   **Development Commands**:

    -   Install new packages: docker-compose exec deskfit-dev npm install <package>

        -   View logs: docker-compose logs -f deskfit-dev

* * * * *

🏗 Architectural Highlights
---------------------------

### Smart Database Synchronization

The application features a "Staff Engineer" grade database initialization strategy. When initialData.ts is updated in the source code, the app automatically:

-   Detects the version change.

    -   Updates text descriptions and metadata for existing exercises.

    -   **Protects user data** by ensuring custom-uploaded images and videos are never overwritten during a sync.

### Hybrid Persistence Strategy (Dexie + SQLite)

To achieve "production-grade" durability on mobile without sacrificing web development velocity, we employ a hybrid database architecture:

-   **Primary (UI/Reactivity)**: **Dexie.js (IndexedDB)** is used for all frontend operations. This allows us to leverage `useLiveQuery` for real-time UI updates across the app.
-   **Secondary (Durable Backup)**: **Capacitor SQLite** acts as a redundant persistence layer. Every change in IndexedDB is mirrored to a native SQLite database.
-   **Rationale**: Mobile operating systems (especially iOS) can aggressively purge WebView storage (IndexedDB) if disk space is low. Our hybrid approach detects these evictions on launch and automatically restores the user's state from the native SQLite backup, ensuring 100% data resilience while maintaining a blazing-fast React UI.

### Efficient Media Storage

Unlike prototypes that use Base64 strings (which bloat memory by 33% and crash browsers), Cubifit stores raw **Binary Large Objects (Blobs)**. We utilize a custom useMediaUrl hook that manages URL.createObjectURL lifecycles to prevent memory leaks.

### Clean Routing & State

The app uses a decoupled state architecture. Navigation is handled via a real URL router, allowing for a standard browser UX (Back/Forward buttons), while state is split into specialized stores to prevent the "God Object" anti-pattern.

* * * * *

🗺️ Mobile Roadmap (iOS & Android)
---------------------------------

To evolve Cubifit from a web-first experience to a production-grade native application, we follow this technical roadmap. **Note:** Development remains 90% browser-based; native devices are required only for hardware-specific testing (Haptics, Background Tasks, OS-level Sleep logic).

### 🏗️ Phase 1: Native Foundation (Capacitor)
- [x] **Capacitor Integration**: Initialize `@capacitor/core` and `@capacitor/cli`.
- [x] **Platform Setup**: Add iOS and Android native projects.
- [x] **App Assets**: Generate initial native structure.

### 💾 Phase 2: Native Persistence & Performance
- [x] **SQLite Adapter**: Implemented **Redundant Persistence Layer** with Capacitor SQLite (including detection & restoration).
    - *Risk Mitigation*: The app detects IndexedDB eviction and automatically restores user data from the durable SQLite backup.
- [x] **Simplified Media Handling**: Placeholder logic for media in SQLite sync.
- [ ] **Filesystem API**: Store user-uploaded exercise images directly in the native filesystem to keep memory usage lean.

### ⚡ Phase 3: Hardware & OS Integration
- [x] **Background Timer Logic**: Implemented native **Local Notifications** to mitigate background timer throttling.
- [x] **Haptic Feedback**: Integrated physical vibrations for interval completion.
- [x] **Keep Screen On**: Integrated `@capacitor-community/keep-awake` to prevent sleep during workouts.
- [ ] **Biometric Auth**: Add FaceID/TouchID support for seamless local login.

### 🎨 Phase 4: Native UI/UX Polish
- [x] **Safe Area Management**: Updated CSS and layout to handle device "Notches" and "Home Indicators" using `safe-area-inset`.
- [x] **Back-Button Support**: Implemented hardware back-button logic for Android using `@capacitor/app`.
- [ ] **Live Updates**: Future improvement: Configure a deployment pipeline for pushing UI fixes instantly via over-the-air updates.

* * * * *

📄 License
----------

This project is intended for internal use. All data is stored locally; clearing your browser cache/site data will delete your workout history unless you have performed a manual export.