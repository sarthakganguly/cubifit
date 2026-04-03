# Cubifit 🏋️‍♂️

Cubifit is a professional, privacy-first fitness application designed for high performance and local-centric data management. Built with a modern tech stack, it prioritizes user privacy, offline functionality, and a fluid user experience through rich animations.

## 🌟 Key Features

- **Privacy-First Architecture**: No cloud syncing or external data storage. All your workout data stays on your device using Dexie.js (IndexedDB).
- **Offline-First**: Fully functional without an internet connection. Perfect for gym environments with poor connectivity.
- **Fluid Animations**: High-performance transitions and feedback powered by `motion` for a premium, 60fps feel.
- **Queue-Based Selection**: Browse exercise cards and build your workout draft dynamically.
- **Localization**: Full multi-language support via `i18next`.
- **Responsive Design**: Optimized for both mobile and desktop browsers using Tailwind CSS.

## 🛠 Tech Stack

- **Framework**: [React 19](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Local Database**: [Dexie.js](https://dexie.org/)
- **Animations**: [Motion](https://motion.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Localization**: [i18next](https://www.i18next.com/)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd cubifit
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## 📂 Project Structure

- `src/components/`: Reusable UI components.
- `src/db.ts`: Dexie.js database configuration and schema.
- `src/store.ts`: Zustand state management for application logic.
- `src/i18n.ts`: Localization configuration.
- `src/locales/`: Translation files for different languages.
- `src/theme.ts`: Theme configuration and custom color palettes.

## 📱 Roadmap

While the current version is a high-performance web application, the roadmap includes:
- **Expo Migration**: Transitioning to a unified codebase for Android and iOS.
- **Native Hardware Integration**: Utilizing camera for QR code scanning and haptics for timer feedback.
- **Data Portability**: JSON Import/Export for device-to-device migration.

## 📄 License

This project is private and for internal use only.
