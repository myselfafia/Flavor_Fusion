# Flavor Fusion authentication API

This backend currently implements registration, login, and the protected current-user endpoint.

## First-time MongoDB Atlas setup

1. Create a free account at MongoDB Atlas, then create a free **M0** cluster.
2. In **Database Access**, create a database user with a password.
3. In **Network Access**, add your current IP address (or temporarily allow `0.0.0.0/0` only for local development).
4. Click **Connect** → **Drivers** and copy the Node.js connection string. Replace `<password>` with the database-user password and append `/flavor-fusion` before the query string.
5. Copy `.env.example` to `.env` in this `backend` directory. Paste the MongoDB connection string and set a long, random `JWT_SECRET`.

## Run locally

```powershell
cd backend
npm install
npm run dev
```

In another terminal:

```powershell
npm run dev
```

The frontend uses `http://localhost:5000/api` by default. To change it, copy the root `.env.example` to `.env` and set `VITE_API_URL`.

## Auth routes

- `POST /api/auth/register` — `{ "name", "email", "password" }`
- `POST /api/auth/login` — `{ "email", "password" }`
- `GET /api/auth/me` — requires `Authorization: Bearer <token>`

Tokens are kept in browser local storage so the existing Vite client can attach them to API calls. For a later production deployment, httpOnly secure cookies reduce exposure to XSS and are generally the stronger choice, but need CSRF protection and a compatible frontend/backend cookie setup.
