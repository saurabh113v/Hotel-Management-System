# 🏨 Hotel Booking App

A modern, full-stack web application for hotel room booking and management built using the MERN stack (MongoDB, Express, React, Node.js).

---

## 🚀 Features

- **User Authentication**: Secure user registration and login with JWT and password hashing (bcryptjs).
- **Interactive Booking**: Easy booking flow with real-time room availability status.
- **Modern User Interfaces**: Beautiful landing page, comprehensive rooms catalog, room details, and user-friendly auth and payment modals.
- **Admin Dashboard**: Comprehensive panel to manage rooms, monitor bookings, and handle users.
- **User Dashboard**: Track active and historical bookings, request cancellations, and view/print invoices.
- **Invoice & Email Notifications**: Generates printable booking invoices and supports automated email confirmations via Nodemailer.

---

## 🛠️ Tech Stack

### Frontend
- **React.js** (built with Vite)
- **CSS3 / Responsive Styling**
- **React Router** for routing
- **Lucide Icons** for icons

### Backend
- **Node.js** & **Express.js**
- **MongoDB** (with Mongoose ODM)
- **JWT** (JSON Web Tokens) for authentication
- **Nodemailer** for sending transactional emails

---

## 📦 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) (locally installed or MongoDB Atlas URI)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/saurabh113v/Hotel-Management-System.git
   cd Hotel-Management-System
   ```

2. **Install all dependencies:**
   A root-level command is provided to install dependencies for the root, frontend, and backend packages:
   ```bash
   npm run install-all
   ```

---

## ⚙️ Environment Variables Setup

Configure the backend environment variables. Create a `.env` file in the `backend/` directory using the provided template:

```bash
cp backend/.env.example backend/.env
```

Open `backend/.env` and update the values:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/hotel-booking
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=30d
NODE_ENV=development
```

---

## 🖥️ Running the Application

You can run both the frontend and backend concurrently with a single command from the root directory:

```bash
npm run dev
```

Alternatively, you can run them individually:

- **Run Backend only:**
  ```bash
  npm run backend
  ```

- **Run Frontend only:**
  ```bash
  npm run frontend
  ```

The application will be accessible at:
- **Frontend**: [http://localhost:5173](http://localhost:5173) (or your Vite configured local port)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

---

## 📁 Project Structure

```text
├── backend/
│   ├── middleware/      # Express authorization middlewares
│   ├── models/          # Mongoose schemas (User, Room, Booking)
│   ├── routes/          # API route definitions
│   ├── utils/           # Utility helpers (like sendEmail)
│   ├── server.js        # Main server entrypoint
│   └── .env.example     # Environment template
│
├── frontend/
│   ├── public/          # Static public assets
│   ├── src/
│   │   ├── assets/      # Image/vector assets
│   │   ├── components/  # Reusable UI components (Modals, Panels)
│   │   ├── pages/       # Route pages (Home, Rooms, Dashboard, Admin)
│   │   ├── App.jsx      # Main Application component
│   │   └── main.jsx     # Frontend entrypoint
│   └── vite.config.js   # Vite configuration
│
├── package.json         # Workspace/Root configuration scripts
└── README.md            # Project documentation
```

---

## ⚡ Deployment to Vercel

This full-stack application is configured to deploy directly to Vercel as a single project using the [vercel.json](file:///c:/Users/saura/OneDrive/Desktop/Hotel%20Booking%20App/vercel.json) configuration.

### Steps to Deploy:

1. **Push your code to GitHub** (already done!).
2. Go to the [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New > Project**.
3. **Import** your repository `saurabh113v/Hotel-Management-System`.
4. In the **Configure Project** step:
   - Keep the default settings (Vercel automatically detects the `vercel.json` and configures the builds).
5. Open the **Environment Variables** accordion and add the backend variables:
   - `MONGO_URI`: Your production MongoDB connection string (e.g. MongoDB Atlas).
   - `JWT_SECRET`: A secure random string for JWT authentication.
   - `JWT_EXPIRE`: `30d`
   - `NODE_ENV`: `production`
6. Click **Deploy**. Vercel will build the Vite frontend static files and compile the Express backend into serverless functions.