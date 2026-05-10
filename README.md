# BitFit Frontend

React + Vite frontend for the BitFit fitness coaching app.

## Stack

- React 19
- Vite
- React Router
- React Bootstrap
- Recharts
- Socket.IO client
- Google OAuth client

## Local Setup

Install dependencies:

```bash
npm install
```

Create a `.env` file in the frontend repo root:

```env
VITE_BACKEND_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

Run locally:

```bash
npm run dev
```

Build locally:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Vercel Deployment

The frontend is deployed on Vercel. Vercel hosts the React app only. The Flask backend should run on Railway because Socket.IO/WebSockets need a persistent server.

Set these Vercel environment variables:

```env
VITE_BACKEND_URL=https://your-railway-backend.up.railway.app
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

`VITE_BACKEND_URL` is used by `src/pages/MessagingPage.jsx` for Socket.IO.

Most REST calls use relative `/api/...` URLs. These are proxied by `vercel.json`:

```json
{
  "source": "/api/:path*",
  "destination": "https://your-railway-backend.up.railway.app/api/:path*"
}
```

When deploying a new backend URL, update the `destination` in `vercel.json`.

## Important Routing Notes

- `/` redirects to `/RegistrationPage`.
- Client dashboard: `/LandingPage/:clientId`
- Coach dashboard: `/CoachLanding/:clientId`
- Admin dashboard: `/AdminAnalytics/:clientId`
- Admin exercise bank: `/AdminExercises/:clientId`
- Messaging: `/MessagingPage/:clientId`

## Authentication Notes

Login stores these localStorage values:

```text
authenticatedClientId
userRole
coachSpecialty
adminId
```

The shared sidebar uses those values to show client, coach, and admin routes.

## Socket.IO Notes

Live messaging connects directly to:

```js
import.meta.env.VITE_BACKEND_URL
```

Do not point Socket.IO at a Vercel serverless backend. Use the Railway backend URL.

## Google OAuth Notes

The frontend requires:

```env
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

The same Google OAuth client ID must also be configured on the backend as `GOOGLE_CLIENT_ID`.

In Google Cloud Console, include the deployed Vercel frontend URL in allowed JavaScript origins.

## Common Commands

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Deployment Checklist

Before deploying:

- Confirm `vercel.json` points `/api/:path*` to the Railway backend.
- Confirm Vercel has `VITE_BACKEND_URL`.
- Confirm Vercel has `VITE_GOOGLE_CLIENT_ID`.
- Confirm Railway backend has database, Google, and Resend variables.
- Run `npm run build`.
