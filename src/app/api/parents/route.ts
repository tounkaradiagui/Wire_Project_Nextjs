import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("q") || "";

  const parents = await prisma.parent.findMany({
    where: {
      OR: [
        { username: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { surname: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ],
    },
    take: 15,
    select: {
      id: true,
      username: true,
      name: true,
      surname: true,
    },
  });

  return NextResponse.json(parents);
}
