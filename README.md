# Flavor Fusion

Flavor Fusion is a full-stack recipe and culinary exploration web application built with React, Vite, Node.js, Express, and MongoDB.

---

## 🚀 Quick Start (Running on Any Device)

When you clone or pull this repository onto a new device, dependencies are not included in Git. Follow these simple steps:

### 1. Install Dependencies
Run the following in the project root directory:
```bash
npm install
```
> **Note:** The `postinstall` script will automatically install both frontend and backend dependencies (`backend/node_modules`).

### 2. Configure Environment Variables
If not already configured, copy the example environment files:

- Backend environment:
```bash
cp backend/.env.example backend/.env
# On Windows CMD:
copy backend\.env.example backend\.env
```
Ensure your MongoDB connection string and JWT secret are set in `backend/.env`.

### 3. Start the Development Server
Run the full-stack development server (starts both backend and frontend):
```bash
npm run dev
```

You will see:
```text
[backend]  Flavor Fusion backend server listening on port: 5000
[frontend] ➜  Local:   http://localhost:5173/
[frontend] ➜  Network: http://192.168.x.x:5173/
```

- **On your current machine:** Open [http://localhost:5173](http://localhost:5173) in your browser.
- **On other devices (phone, tablet, other PCs on the same Wi-Fi):** Open the `Network` URL (e.g., `http://192.168.x.x:5173`).

---

## 🛠 Available Scripts

- `npm run dev` - Runs both backend Express server and Vite frontend concurrently.
- `npm run dev:frontend` - Runs only the Vite frontend dev server.
- `npm run server` - Runs only the Express backend server.
- `npm run build` - Builds the React frontend for production.
- `npm run lint` - Runs ESLint code quality checks.
- `npm run install:all` - Explicitly installs all root and backend dependencies.
