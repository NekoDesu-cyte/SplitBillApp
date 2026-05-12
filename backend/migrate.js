import { neon } from '@neondatabase/serverless';
import 'dotenv/config';
const sql = neon(process.env.DATABASE_URL);

async function main() {
  await sql`ALTER TABLE rooms ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
  console.log('Successfully added last_activity_at column to rooms table.');
}

main().catch(console.error);
