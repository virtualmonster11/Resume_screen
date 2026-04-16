# MatchAI PRO: Platform Architecture & Documentation

This document explains the architecture, the tools used, and the logical flow of the newly built Resume Screening platform. It serves as your guide to understanding the code, running the application, and extending it in the future.

## 1. System Overview

MatchAI PRO is designed to act as a bridge between candidates and job descriptions. Instead of relying on rigid keyword matching, it leverages Anthropic's Claude 3.5 Sonnet to semantically understand a candidate's experience and compare it structurally against a job description.

**Tech Stack:**
*   **Frontend**: React.js (Vite), Tailwind CSS (Premium Dark Mode), Framer Motion (Animations).
*   **Backend**: Python, FastAPI.
*   **AI Engine**: Google Gemini (via `google-generativeai` Free Tier).
*   **Cloud (Planned)**: Supabase (Auth + Storage).

---

## 2. Component Architecture

### The Frontend (`/frontend`)
The React app is responsible for the user interface and file handling.
*   **`App.jsx`**: The main Layout containing the premium frosted-glass design system and navigation placeholders.
*   **`ResumeAnalyzer.jsx`**: The core interactive module. It uses `react-dropzone` to handle PDF file uploads seamlessly. When the user pastes a JD and hits analyze, it bundles the file and text into a `FormData` object and fires it to the backend.
*   **`ResultsDisplay.jsx`**: A powerful visualization engine. Once the JSON comes back from the AI, it uses `react-circular-progressbar` for ATS scores, and distinct components for matches, missing variables, and critical suggestions.

### The Backend (`/backend`)
The backend acts as a secure, fast conduit.
*   **`main.py`**: A FastAPI application. It is heavily optimized for speed. It accepts the multipar/form-data upload, extracts the PDF bytes, and forwards them to the AI service.
*   **`services/ai_service.py`**: The "brain" of the platform. It takes the PDF bytes and utilizes Gemini's native `document` capability. This is infinitely better than pure text extraction because multimodal models natively understand the layout. We use a precise JSON-forcing prompt.

---

## 3. End-to-End Workflow Example

1.  **User Visits the Site**: The user sees the sleek dark UI.
2.  **Upload & Paste**: They drop `johndoe_resume.pdf` into the dropzone and paste a job description for a "Senior Frontend Engineer".
3.  **Submission**: They click "Analyze". The frontend shows a loading state.
4.  **Backend Processing**:
    *   FastAPI receives the PDF in memory.
    *   It passes the raw bytes to the AI service.
5.  **AI Analysis**:
    *   Gemini reads the PDF directly via binary processing.
    *   It applies our HR-expert prompt.
    *   It realizes Johndoe has 5 years of React experience but is missing "GraphQL" which was highlighted heavily in the JD.
6.  **Response Generation**:
    *   Gemini outputs a perfectly structured JSON object giving John a `78%` ATS score, listing `GraphQL` under missing skills, and suggesting he emphasizes his state management expertise in the summary.
7.  **Frontend Render**:
    *   The frontend receives the JSON.
    *   `ResultsDisplay` renders the 78% as an animated circular ring.
    *   The missing skills and actionable tips are shown in their respective grids.

---

## 4. How To Run & Test (Human Intervention Required)

Before starting the servers, ensure you complete these steps in your respective terminals.

### Step 1: Run the Backend
1. Open a terminal and navigate to the `backend` folder.
2. Activate the virtual environment: `source venv/bin/activate`
3. Set your API Key: `export GEMINI_API_KEY="AIzaSyYourKey..."`
4. Start the server: `uvicorn main:app --reload`
*The server will run on `http://localhost:8000`.*

### Step 2: Run the Frontend
1. Open a separate terminal and navigate to the `frontend` folder.
2. Install dependencies (if not already done): `npm install`
3. Start the dev server: `npm run dev`
*The site will be available on `http://localhost:5173`.*

### Step 3: Test the App
Open `http://localhost:5173` in your browser. Upload a sample PDF resume, paste a test description, and click Analyze!
