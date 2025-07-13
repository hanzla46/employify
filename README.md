# Employify

Employify is a full-stack web application designed to streamline the job hunting process. It provides features for job
seekers like AI-powered interview preparation, resume analysis, career roadmaps, and more.

## Features

- **User Authentication**: Secure login and signup with JWT and cookies.
- **Profile Management**: Create and update user profiles, including resumes and skills.
- **Job Listings**: Browse, search, and apply for jobs.
- **Company Profiles**: View and manage company information.
- **AI Interview Preparation**: Practice interviews and receive feedback using AI.
- **Career Roadmaps**: Personalized career path suggestions and skill evaluations.
- **Feedback System**: Submit and view feedback for interviews and companies.
- **Market Analysis**: Insights into job market trends.
- **Connect & Networking**: Connect with other users and companies.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express, MongoDB (Mongoose)
- **AI Services**: Google Generative AI
- **Deployment**: Vercel

## Project Structure

```
backend/
  index.js                # Express server entry point
  controllers/            # Route controllers
  middlewares/            # Express middlewares
  models/                 # Mongoose models
  routes/                 # API route definitions
  scripts/                # Utility scripts
  Services/               # AI and business logic services
frontend/
  src/
    components/           # React UI components
    pages/                # React page components
    Context/              # React context providers
    lib/                  # Shared utilities
    assets/               # Images, fonts, etc.
    utils/                # Helper functions
  index.html              # Main HTML file
  main.jsx                # React entry point
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm
- MongoDB instance (local or cloud)

### Backend Setup

1. Navigate to the backend folder:
   ```sh
   cd backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```env
   PORT=8000
   FRONTEND_URL=http://localhost:5173
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ...other required variables
   ```
4. Start the backend server:
   ```sh
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend folder:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the frontend development server:
   ```sh
   npm run dev
   ```

The frontend will be available at `http://localhost:5173` by default.

## Deployment

Both frontend and backend are configured for deployment on Vercel. See the `vercel.json` files in each directory for
routing and build settings.

## License

This project is licensed under the ISC License.

## Acknowledgements

- [Express](https://expressjs.com/)
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [MongoDB](https://www.mongodb.com/)
- [Google Generative AI](https://ai.google/)
