import { neon } from '@neondatabase/serverless';
import 'dotenv/config';
const sql = neon(process.env.DATABASE_URL);

async function main() {
  const rooms = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'rooms'`;
  console.log('ROOMS:', rooms);
  
  const participants = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'participants'`;
  console.log('PARTICIPANTS:', participants);
  
  const items = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'items'`;
  console.log('ITEMS:', items);
}

main().catch(console.error);
