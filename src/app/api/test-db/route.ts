import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export async function GET() {
    const data = await sql`SELECT 1`;

    return Response.json(data);
}