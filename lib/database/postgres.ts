import { sql } from '@vercel/postgres';

export async function initDatabase() {
  try {
    await sql`SELECT 1`;
    console.log('✅ Database connected');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

export { sql };
