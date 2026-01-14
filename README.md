# Geosocial - Location-Based Social Media

> A modern social media platform where users can share location-based posts, interact on an interactive map, and chat in real-time.

![Project Banner](./assets/banner.png)
*(Tip: Replace this image with a screenshot of your main map view)*

## 🚀 Features

-   **📍 Interactive Map:** Visualize posts and users on a dynamic map using MapLibre.
-   **💬 Real-time Chat:** Instant messaging powered by Socket.io.
-   **📷 Media Sharing:** Create posts with images and descriptions.
-   **🔐 Authentication:** Secure user authentication with JWT.
-   **🎨 Modern UI:** Built with React, TailwindCSS, and glassmorphism design effects.

## 🛠️ Tech Stack

-   **Frontend:** React, Vite, TailwindCSS, Zustand, MapLibre GL
-   **Backend:** Node.js, Express, MongoDB, Socket.io
-   **Database:** MongoDB

## 📸 Screenshots

| Post Feed | Map View |
|-----------|----------|
| ![Feed](./assets/feed.png) | ![Map](./assets/map.png) |

*(Tip: Add your screenshots to the `assets` folder and update the filenames above)*

## 🎥 Demo

Check out how it works:

[![Watch the video](https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg)](https://youtu.be/VIDEO_ID)

*(Tip: Upload your video to YouTube and replace `VIDEO_ID` with your actual video ID. Or, upload a GIF to the assets folder)*

---

## ⚙️ Getting Started

Follow these steps to set up the project locally.

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/geosocial.git
cd geosocial
```

### 2. Backend Setup

```bash
cd backend
npm install
```

**Configuration:**
Create a `.env` file in the `backend` folder:
```bash
cp .env.example .env
```
Open `.env` and configure your `MONGO_URI` and `JWT_SECRET`.

**Seed Data (Optional):**
Populate the database with sample users and posts:
```bash
npm run seed
```

**Start Server:**
```bash
npm run dev
```

### 3. Frontend Setup

Open a new terminal:
```bash
cd frontend
npm install
```

**Configuration:**
Create a `.env` file in the `frontend` folder:
```bash
cp .env.example .env
```
Ensure `VITE_API_URL` points to your backend (default: `http://localhost:5000/api`).

**Start App:**
```bash
npm run dev
```

Visit `http://localhost:5173` to view the app.

---
