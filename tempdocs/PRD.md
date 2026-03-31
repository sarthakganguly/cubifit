PRD: Privacy-First Exercise Queue App
=====================================

1\. Executive Summary
---------------------

A cross-platform (Android, iOS, Web) application designed for privacy-conscious users. The app provides a library of 50 office-friendly movements that users can browse and assemble into custom "Exercise Lists." The app is strictly local-only, utilizing on-device storage for all user data, preferences, and workout logs.

* * * * *

2\. Product Objectives
----------------------

-   **Total Privacy:** No cloud database, no tracking, and no user accounts.

-   **Modular Selection:** A "DIY" mode that uses a search-and-queue system to build custom routines.

-   **Frictionless Execution:** A smooth, card-based workout interface with automated timers and transitions.

-   **Global Readiness:** A translation-key-based architecture allowing instant language switching.

* * * * *

3\. User Experience & Application Flow
--------------------------------------

### Phase 1: DIY Selection (The Drafting Phase)

1.  **Selection Screen:** Users choose from a variety of filters (Difficulty, Tools, Noise Level, etc.). For Muscles and Tags, the app uses **Inclusive OR** logic (e.g., selecting "Quads" and "Abs" shows exercises for either or both).

2.  **Search Result Stack:** Clicking "Search" displays a swipable stack of cards.

    -   Users swipe left/right to browse.

    -   Each card features a description, a video placeholder, and an **"Add" button**.

3.  **Queue Building:** Tapping "Add" places the exercise into a temporary queue in the order they were selected.

4.  **Autosave/Drafts:** If the user exits before finishing, the queue is autosaved as a **Draft** labeled with the current date/time.

5.  **Finalizing:** The user names the list and saves it to their library.

### Phase 2: Exercise Execution (The Workout Phase)

1.  **List Overview:** Upon opening a saved list, users see the full sequence.

2.  **Order Confirmation:** If starting for the first time, the user is prompted to confirm the sequence using a **Drag-and-Drop** interface (with up/down arrow fallbacks).

3.  **Active Session:**

    -   A single exercise card is shown with a countdown timer (`duration_sec`).

    -   User clicks **Start** to begin; **Pause** to stop.

    -   **Auto-Advance:** When the timer hits zero, the card automatically swipes away to the left, and the next card slides in.

4.  **Completion:** After the final card, a congratulatory screen appears, and the session is logged to the history.

* * * * *

4\. Feature Requirements
------------------------

### Localization & Theme

-   **Language:** The app starts in English but is built using a translation-key system for instant multi-language support (Localization).

-   **Theming:** A user-configurable toggle between **Light Mode** and **Dark Mode**, integrated into a global settings screen.

### Logging & Analytics

-   The app logs every completed session with the following metrics:

    -   List Name and Exercises performed.

    -   Start/End timestamps and total duration.

    -   Total "Pause" time accumulated during the session.

### Data Portability

-   **Import/Export:** Users can export their lists and history as a JSON file.

-   **Migration:** A manual import function allows users to move this JSON file to another device or browser to restore their data.

* * * * *

5\. UI/UX Design Principles
---------------------------

-   **Mobile-First:** Prioritize gestures and touch-targets for Android/iOS, with mouse-click fallbacks for Web.

-   **Smooth Transitions:** Use high-performance animations (60fps) for card entry/exit and list reordering.

-   **Instructional Clarity:** Every card must clearly show the video link placeholder and description to guide the user through the movement.

* * * * *

6\. Technical Stack Recommendation
----------------------------------

-   **Framework:** React Native + Expo (Single codebase for iOS, Android, and Web).

-   **State Management:** Zustand (with persistence for Drafts and Theme settings).

-   **Animation Library:** React Native Reanimated.

-   **Localization:** i18next.