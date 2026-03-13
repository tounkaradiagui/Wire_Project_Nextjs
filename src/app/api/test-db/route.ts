
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
  const result = await sql`SELECT NOW() as time`;

  return Response.json(result);
}