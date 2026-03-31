CubiFit 🏋️‍♂️
==============

CubiFit is a modern, responsive frontend web application designed for fitness tracking, workout management, and exercise queuing. Built with a robust React and TypeScript architecture, it offers a seamless local-first experience with multi-language support and an integrated premium feature system.

✨ Features
----------

-   **Personalized Workouts:** Intuitive workout selection, queuing, and tracking screens (`WorkoutScreen`, `QueueScreen`).

-   **History & Analytics:** Track your past workouts and fitness journey (`HistoryScreen`).

-   **Local-First Architecture:** Fast, reliable data storage using a local database layer (`db.ts`).

-   **Internationalization (i18n):** Multi-language support out-of-the-box (`en.json` included).

-   **Premium Tier Ready:** Built-in screens for premium lockouts and feature gating (`PremiumLockoutScreen`).

-   **User Onboarding:** Step-by-step wizard for new users to set up their profiles (`WizardScreen`).

-   **Dockerized:** Developer-friendly containerization for rapid local development and production-ready Nginx serving.

🛠 Tech Stack
-------------

-   **Core:** [React](https://www.google.com/search?q=https://reactjs.org/ "null") + [TypeScript](https://www.google.com/search?q=https://www.typescriptlang.org/ "null")

-   **Build Tool:** [Vite](https://vitejs.dev/ "null")

-   **State Management:** Custom Store (`store.ts`)

-   **Database:** Local DB wrapper (`db.ts` / IndexedDB)

-   **i18n:** `i18next` (`i18n.ts`)

-   **Infrastructure:** Docker, Docker Compose, Nginx

📂 Project Structure
--------------------

```
cubifit/
├── src/
│   ├── components/      # React UI Components (Auth, Home, Workouts, etc.)
│   ├── locales/         # i18n language files (e.g., en.json)
│   ├── lib/             # Utility functions
│   ├── App.tsx          # Main Application component
│   ├── main.tsx         # React entry point
│   ├── store.ts         # Global state management
│   ├── db.ts            # Local database configuration
│   ├── theme.ts         # Application theme definitions
│   └── i18n.ts          # Internationalization setup
├── tempdocs/            # Project documentation (PRD, Docker setup, etc.)
├── Dockerfile.dev       # Docker configuration for development
├── docker-compose.yml   # Multi-container Docker setup
├── nginx.conf           # Nginx configuration for production
└── package.json         # Project dependencies and scripts

```

🚀 Getting Started
------------------

### Prerequisites

Ensure you have the following installed on your local machine:

-   [Node.js](https://nodejs.org/ "null") (v18 or higher recommended)

-   [npm](https://www.google.com/search?q=https://www.npmjs.com/ "null") or [yarn](https://www.google.com/search?q=https://yarnpkg.com/ "null")

-   [Docker](https://www.google.com/search?q=https://www.docker.com/ "null") (Optional, for containerized environments)

### Local Development (Without Docker)

1.  **Clone the repository:**

    ```
    git clone [https://github.com/sarthakganguly/cubifit.git](https://github.com/sarthakganguly/cubifit.git)
    cd cubifit

    ```

2.  **Install dependencies:**

    ```
    npm install

    ```

3.  **Set up Environment Variables:** Copy the example environment file and update variables if necessary.

    ```
    cp .env.example .env

    ```

4.  **Start the development server:**

    ```
    npm run dev

    ```

    The application will be available at `http://localhost:5173`.

### 🐳 Docker Development

To run the application inside a Docker container (useful for standardized environments):

1.  **Build and start the container:**

    ```
    docker-compose up --build

    ```

2.  **Access the application:** Open your browser and navigate to `http://localhost:5173`.

*(Note: Hot-reloading is configured to work out-of-the-box with `Dockerfile.dev`)*

📖 Documentation
----------------

Additional project documentation can be found in the `/tempdocs` directory:

-   [Product Requirements Document (PRD)](https://www.google.com/search?q=./tempdocs/PRD.md "null")

-   [Docker Setup Guide](https://www.google.com/search?q=./tempdocs/dockersetup.md "null")

-   [Color Palette & Theming](https://www.google.com/search?q=./tempdocs/color.md "null")

-   [Refactor Planning](https://www.google.com/search?q=./tempdocs/refactor.md "null")

🤝 Contributing
---------------

1.  Fork the Project

2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)

3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)

4.  Push to the Branch (`git push origin feature/AmazingFeature`)

5.  Open a Pull Request

📄 License
----------

This project is proprietary. All rights reserved.

*Maintained by Sarthak Ganguly.*