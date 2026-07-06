# Champions of Champions — Employee Engagement Microsite

A Next.js microsite with four Bollywood-themed engagement games, employee ID login via Supabase, and result storage.

## Games

1. **Retro Posters** — Upload your photo and star in classic Bollywood poster templates. Save & download your creation.
2. **Guess The Star** — Identify 9 Bollywood actors from their smiles within 3 minutes. Results saved for winner list.
3. **Memory Match** — 3×3 grid with 4 matching pairs. Tracks actions and time to complete.
4. **Dubsmash** — Pick a dialogue, record yourself enacting it, save & download your video.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL in `supabase/schema.sql` in the Supabase SQL Editor
3. Create two storage buckets in Supabase Dashboard → Storage:
   - `retro-posters` (public)
   - `dubsmash-videos` (public)
4. Copy `.env.local.example` to `.env.local` and fill in your keys:

```bash
cp .env.local.example .env.local
```

### 3. Add your employee IDs

Insert your employee IDs into the `employee_ids` table:

```sql
INSERT INTO employee_ids (employee_id, name) VALUES
  ('YOUR_ID_1', 'Employee Name 1'),
  ('YOUR_ID_2', 'Employee Name 2');
```

Demo IDs `EMP001`, `EMP002`, `EMP003` are included in the schema.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **Tailwind CSS 4**
- **Supabase** (PostgreSQL + Storage)
- **Canvas API** (poster face replacement)
- **MediaRecorder API** (dubsmash video recording)

## Project Structure

```
src/
├── app/
│   ├── api/          # Auth & game submission APIs
│   ├── dashboard/    # Game selection dashboard
│   ├── games/        # Individual game pages
│   └── login/        # Employee ID login
├── components/
│   ├── games/        # Game components
│   └── ui/           # Shared UI components
└── lib/
    ├── game-data/    # Game configuration & content
    └── supabase/     # Supabase clients
```

## Customization

- **Poster templates**: Edit `src/lib/game-data/posters.ts`
- **Actor quiz answers**: Edit `src/lib/game-data/actors.ts` and replace SVG images in `public/games/actors/`
- **Memory tiles**: Edit `src/lib/game-data/memory-tiles.ts`
- **Dubsmash dialogues**: Edit `src/lib/game-data/dubsmash-clips.ts`
- **Quiz timer**: Change `GUESS_TIME_SECONDS` in `src/lib/game-data/actors.ts`
