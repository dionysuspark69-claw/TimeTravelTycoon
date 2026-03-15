import { neon } from '@neondatabase/serverless';

const sql = neon('postgresql://neondb_owner:npg_wi8Hlpn4Bdcj@ep-late-forest-anqvtj83-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require');

await sql`
  CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
    username TEXT NOT NULL,
    total_earned TEXT NOT NULL DEFAULT '0',
    total_trips_completed INTEGER NOT NULL DEFAULT 0,
    total_customers_served INTEGER NOT NULL DEFAULT 0,
    prestige_level INTEGER NOT NULL DEFAULT 0,
    time_machine_count INTEGER NOT NULL DEFAULT 1,
    unlocked_destinations_count INTEGER NOT NULL DEFAULT 1,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
  )
`;

console.log('leaderboard_entries table created!');
