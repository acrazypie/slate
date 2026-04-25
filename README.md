# Slate

Pianificatore a blocchi orari per studenti, universitari e giovani lavoratori.

## Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

## Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready
3. Go to **Settings > API** to find your `URL` and `anon key`

### 2. Database Setup

In the Supabase Dashboard, go to **SQL Editor** and run:

```sql
-- Create blocks table
create table blocks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  category text not null default 'altro',
  color text not null default '#6366f1',
  day_of_week integer not null,
  start_hour integer not null,
  start_minute integer not null default 0,
  duration_minutes integer not null default 60,
  week_offset integer not null default 0,
  notes text,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table blocks enable row level security;

-- Create policy
create policy "Users can manage their own blocks"
  on blocks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

### 3. Auth Configuration

1. Go to **Authentication > Providers**
2. Enable **Email** (or configure Google/Apple OAuth)
3. Go to **Authentication > URL Configuration**
4. Add to **Redirect URLs**:
   - Local: `http://localhost:3000/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`

### 4. Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace the values with your Supabase credentials from Settings > API.

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy

### Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Add the environment variables in the Vercel dashboard
4. Deploy

## Features

- Weekly time block planning grid
- Categories: Studio, Lavoro, Lezione, Altro
- Custom colors for each block
- Week navigation (previous/next)
- Real-time current time indicator
- User authentication with Supabase
- Automatic data synchronization

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Supabase (Auth + Database)
- Tailwind CSS
- date-fns
- lucide-react