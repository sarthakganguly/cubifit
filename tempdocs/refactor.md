Here is the updated prompt. I have explicitly added a directive in The Goal section instructing the AI to drop all Docker and Nginx files so it doesn't try to containerize the native mobile app.

Copy and paste everything below this line into Gemini App Builder:

System Role & Context:
You are an Expert React Native and Expo Mobile Architect. I am migrating my existing React Single Page Application (currently in your workspace context, built with Vite, Tailwind CSS, Zustand, and Dexie) into a native Android and iOS application using Expo.

The Goal:
Refactor this codebase into a production-ready Expo application.

Do not use web DOM elements (div, span, header, img) in the new code. Everything must be translated to React Native primitives (View, Text, SafeAreaView, Image, TouchableOpacity).

Drop all Docker and Server configurations: Completely ignore and discard Dockerfile.dev, docker-compose.yml, .dockerignore, and nginx.conf. We are not using Docker for the mobile app; it will run locally via the Expo CLI.

Target Tech Stack Requirements:

Framework: React Native with Expo.

Styling: NativeWind (to maintain the Tailwind CSS workflow).

State Management: Zustand. You must migrate the persistence layer from localStorage to @react-native-async-storage/async-storage.

Database: Migrate all Dexie (IndexedDB) logic in src/db.ts to expo-sqlite.

Routing: Migrate the custom currentView state machine in App.tsx to React Navigation (@react-navigation/native-stack and @react-navigation/bottom-tabs).

Animations: Migrate motion to Moti (which uses react-native-reanimated under the hood for excellent performance while keeping an API similar to Framer Motion).

Icons: Swap lucide-react for lucide-react-native.

Execution Plan (Strict Step-by-Step):
Because this is a large refactor, we will do this incrementally to ensure quality and avoid token limits.

For your very first response, ONLY execute Step 1 and Step 2:

Step 1: Architecture & Dependencies: Provide a brief summary of the new file structure. Then, provide the exact npx expo install and npm install commands I need to run to add the new native dependencies and remove the web ones (vite, dexie, motion).

Step 2: Core Logic Migration (Database & State): Rewrite src/db.ts to use expo-sqlite and rewrite src/store.ts to use Zustand with async storage persistence.

Stop after Step 2. Do not attempt to rewrite App.tsx or the UI components yet. Ask me to review the database and state logic, and instruct me to reply with "Proceed to Step 3" when I am ready for the React Navigation setup.

================================================
Proceed to Step 3.

Step 3: Routing and Entry Point (App.tsx)
I am ready for the React Navigation setup. Please rewrite src/App.tsx.

Requirements for App.tsx:

Completely remove the currentView state machine.

Implement @react-navigation/native.

Create a Bottom Tab Navigator (@react-navigation/bottom-tabs) for the main sections: Home, History, and Settings.

Create a Native Stack Navigator (@react-navigation/native-stack) to handle the flows that should sit on top of the tabs or hide the tabs (e.g., Library/Selection, Wizard, Queue, and the active Workout screen).

Remember our strict UI rules: Use View, Text, SafeAreaView, and NativeWind classes. Do NOT use standard HTML tags. Use lucide-react-native for the tab icons.

Stop after rewriting App.tsx. Ask me if I am ready to proceed to the UI Components, and instruct me to reply with "Proceed to Step 4".
================================================
Proceed to Step 4.

Step 4: Core UI Component Translation
Please rewrite the following screen components to be React Native compatible:

src/components/HomeScreen.tsx

src/components/SettingsScreen.tsx

src/components/HistoryScreen.tsx

Requirements:

Replace all web primitives (div, button, img, span, p) with React Native primitives (View, TouchableOpacity, Image, Text).

Convert all Tailwind classes to work with NativeWind.

Ensure these components receive and use the React Navigation navigation prop correctly to navigate between screens (e.g., replacing the old onGoToLibrary callback props).

Stop after rewriting these three files. Instruct me to reply with "Proceed to Step 5".
==================================================
Proceed to Step 5.

Step 5: Complex UI and Animations
Please rewrite the remaining complex screens:

src/components/SelectionScreen.tsx (Library)

src/components/QueueScreen.tsx

src/components/WorkoutScreen.tsx

src/components/WizardScreen.tsx

Requirements:

Follow the same strict translation rules to React Native primitives and NativeWind.

Animations: Replace motion.div from the motion library with MotiView from moti. Ensure the animation props (animate, initial, transition) are properly adapted to Moti's API.

Drag and Drop: The web app used @dnd-kit. For the native QueueScreen, please implement list reordering using react-native-draggable-flatlist or a similar highly performant native alternative.

Ensure the Zustand queue state hooks up correctly to the native UI.

This is the final step. Once complete, summarize the manual steps I need to take to download this codebase and run it locally via Expo Go.
==================================================