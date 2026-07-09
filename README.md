# Champions of Champions — Employee Engagement Microsite

A Next.js microsite with a Memory Match game, employee ID login via Supabase, and result storage.

## Games

1. **Memory Match** — Flip tiles and find matching pairs. Tracks actions and time to complete. One attempt per employee.

Employees with `can_play_games = true` see the game on the dashboard. Others see a stay-tuned message.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL in `supabase/schema.sql` in the Supabase SQL Editor
3. Copy `.env.local.example` to `.env.local` and fill in your keys:

```bash
cp .env.local.example .env.local
```

### 3. Add your employee IDs

Insert your employee IDs into the `employee_ids` table:

```sql
INSERT INTO employee_ids (employee_id, name, can_play_games) VALUES
  ('YOUR_ID_1', 'Employee Name 1', true),
  ('YOUR_ID_2', 'Employee Name 2', false);
```

Demo IDs `EMP001`, `EMP002`, `EMP003` are included in the schema with `can_play_games = true`.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Next.js 16** (App Router)
- **React 19**
- **Tailwind CSS 4**
- **Supabase** (PostgreSQL)

## Project Structure

```
src/
├── app/
│   ├── api/          # Auth & game submission APIs
│   ├── dashboard/    # Game selection dashboard
│   ├── games/        # Memory game page
│   └── login/        # Employee ID login
├── components/
│   ├── games/        # Game components
│   └── ui/           # Shared UI components
└── lib/
    ├── game-data/    # Game configuration & content
    └── supabase/     # Supabase clients
```

## Customization

- **Memory tiles**: Edit `src/lib/game-data/memory-tiles.ts`
- **Event schedule message**: Edit `EVENT_SCHEDULE_MESSAGE` in `src/lib/games/config.ts`
