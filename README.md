# Restaurant Menu Engineering Tool

AI-powered menu design and analytics: import menus via SQL, generate descriptions and food photography, analyze profitability, and export PDFs.

## Stack

- **Frontend:** Next.js 15 (App Router), React, Tailwind CSS
- **Backend:** Next.js API routes, SQLite (better-sqlite3)
- **AI:** OpenAI or Anthropic (descriptions, pricing), WaveSpeed AI (food images), OpenAI Vision (OCR, competitor analysis)
- **Storage:** Local `public/uploads` or Cloudinary
- **Deploy:** Zeabur (one-click from GitHub)

## Setup

1. **Clone and install**
   ```bash
   npm install
   ```

2. **Database**
   - SQLite database is automatically created when you start the application.
   - Set `DATABASE_URL=file:./dev.db` in `.env.local` (this is the default)
   - No manual database setup required

3. **Environment (`.env.local`)**
   - `DATABASE_URL` – SQLite database file (default: `file:./dev.db`)
   - `WAVESPEED_API_KEY` – for AI-generated food images
   - `CLOUDINARY_URL` (optional) – e.g. `cloudinary://API_KEY:API_SECRET@CLOUD_NAME` for image uploads
   - `NEXT_PUBLIC_APP_URL` – e.g. `http://localhost:3000` for local dev

4. **Run**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000). Use **Dashboard** to create menus and import SQL.

## SQL import format

Provide an `INSERT` statement with columns mapping to menu items. Supported column names (case-insensitive): `name`, `description`, `price`, `popularity` (or `sales_count`), `category`.

Example:

```sql
INSERT INTO menu (name, description, price, popularity, category) VALUES
('Margherita Pizza', 'Fresh basil and mozzarella', 14.99, 85, 'Mains'),
('Tiramisu', NULL, 8.50, 120, 'Desserts');
```

## Deploy on Zeabur

1. Push the repo to GitHub.
2. In [Zeabur](https://zeabur.com), create a project and add a service: **Deploy from GitHub**. Select this repo.
3. **Add PostgreSQL:** In the same project, click **+ Add Service** → **Database** → **PostgreSQL**. Zeabur will create a database and expose `DATABASE_URL`.
4. **Link the database to your app:** Open your app service → **Variables** (or **Settings**). Click **Link** next to the PostgreSQL service so `DATABASE_URL` is injected automatically. The app runs migrations on every start when `DATABASE_URL` is set, so the database will be set up with no extra steps.
5. Set other env vars as needed: `OPENAI_API_KEY` or `ANTHROPIC_API_KEY`, `WAVESPEED_API_KEY`, `NEXT_PUBLIC_APP_URL` (your app’s public URL).
6. Redeploy if you added the database after the first deploy. The next start will run migrations and create tables.

## Features

- **Dashboard** – Menus list; create menu, import SQL.
- **Menu design** – Edit items (name, description, price, category, image); **AI-enrich menu** (batch-generates descriptions from restaurant cuisine/theme and sets recommended badges from popularity); per-item AI description and pricing; “Generate with AI” for food images (WaveSpeed); live preview with popularity-based font tiers.
- **Analytics** – Per-item profitability (margin, margin %) and popularity; recommended flag.
- **OCR** – `POST /api/ocr` with image file to extract text from a menu photo.
- **Vision** – `POST /api/vision/analyze` with image file for competitor menu analysis (items, prices, layout).
- **PDF export** – From the design page, “Export PDF” generates and downloads the engineered menu.

## License

MIT
