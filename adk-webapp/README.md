# Alpha Delta Kennel — Full Stack Web App

Login → admin-gated account creation → dashboard → dog CRUD, backed by
Express + PostgreSQL, deployed on Railway (backend + DB) and Vercel/Netlify
(frontend).

## ⚠️ First: rotate your database password

The Postgres password you pasted (`PAlvig...UStk`) was shared in a document.
Before going further:
1. In Railway, open your Postgres service → **Variables**.
2. You can't edit `POSTGRES_PASSWORD` directly on a running plugin, so the
   simplest fix is: create a **new Postgres service**, run the migration
   below against it, and point your backend at the new `DATABASE_URL`. Then
   delete the old service.
3. Never commit real credentials to git — this project reads them from
   environment variables only (see `.env.example`).

## 1. Backend — deploy to Railway

1. Push the `backend/` folder to a GitHub repo (or a subfolder of one).
2. In Railway: **New Project → Deploy from GitHub repo**, select the repo,
   set the **root directory** to `backend` if it's a subfolder.
3. Add these Variables in Railway (Settings → Variables):
   - `DATABASE_URL` → Railway sets this automatically when you attach your
     Postgres plugin to this service (use "Add Reference Variable").
   - `JWT_SECRET` → a long random string (Railway lets you generate one).
   - `ADMIN_PASSWORD` → your new admin password for the "Create Account" gate.
   - `CORS_ORIGIN` → your frontend's URL once deployed, e.g.
     `https://your-app.vercel.app` (comma-separate multiple origins).
4. Deploy. Railway gives you a public URL like `https://your-app.up.railway.app`.
5. Run the migration once to create the tables. From your local machine with
   the `DATABASE_PUBLIC_URL` set in a local `.env`:
   ```
   cd backend
   npm install
   npm run migrate
   ```
   (Or run `node migrate.js` via Railway's one-off shell/CLI if you prefer
   not to expose the public URL locally.)
6. Create your first admin account by calling the register endpoint directly
   once (Postman/curl), since the UI requires an existing admin flow:
   ```
   curl -X POST https://your-app.up.railway.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"adminPassword":"YOUR_ADMIN_PASSWORD","fullname":"Jim Justin M. Poso","nickname":"Jim","username":"admin","password":"choose-a-strong-password","adminrights":true}'
   ```

## 2. Frontend — deploy to Vercel or Netlify

1. In Vercel or Netlify: **New Project**, select the repo.
2. Set **Root Directory** to `frontend`.
3. Set **Framework Preset** to **Vite** (Build command: `npm run build`, Output directory: `dist`).
4. (Optional) Set environment variable `VITE_API_BASE_URL` to your backend API URL, e.g. `https://adk-webapp-production.up.railway.app/api`.
5. Deploy. You'll get your public frontend URL (e.g. `https://your-app.vercel.app`).
6. Set `CORS_ORIGIN` in your Railway backend variables to include your frontend URL.

## Local testing

### Backend:
```bash
cd backend
cp .env.example .env   # fill in local values
npm install
npm run migrate
npm start               # API on http://localhost:3000
```

### Frontend:
```bash
cd frontend
npm install
npm run dev             # Frontend on http://localhost:5173
```

## What's implemented

- **Login** — checks bcrypt-hashed password, issues a JWT.
- **Create-account gate** — checks `ADMIN_PASSWORD` before letting anyone
  reach the registration form; the register endpoint re-checks it
  server-side too, so the gate can't be skipped by calling the API directly.
- **Create account** — full name, nickname, designation, admin-rights
  checkbox, username, password (hashed with bcrypt before storage).
- **Dashboard** — total dogs, active dogs, dogs by breed, male vs female,
  deceased dogs, dogs with missing info — all computed live from the DB.
- **Dogs table (Home)** — search, Add New Dog modal; Edit/Delete buttons
  only render and only work for admins (non-admins can add but not
  edit/delete, matching your spec).
- **Add Dog page** — same modal/flow, reachable from the sidebar.

## Notes / things you may want to adjust

- I added a `status` column (`active`/`deceased`) to `dogtb` — it wasn't in
  your original table screenshot but the dashboard needs it for two of the
  six cards.
- "Dogs With Missing Information" currently means any dog missing breed,
  name, gender, DOB, microchip, father, or mother — adjust the query in
  `backend/routes/dashboard.js` if you want a different definition.
- The UI is clean/modern CSS rather than a photorealistic rendered image —
  since this is a real working app (not a static mockup), the interface is
  built with actual HTML/CSS so every button and form genuinely functions.
