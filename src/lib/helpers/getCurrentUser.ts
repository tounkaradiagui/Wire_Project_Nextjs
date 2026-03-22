import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"

export async function getCurrentUser() {
  const { userId, sessionClaims } = await auth()

  if (!userId) return null

  const userProfile = await prisma.userProfile.findUnique({
    where: { clerkId: userId },
  })

  if (!userProfile) return null

  const role = (sessionClaims?.metadata as { role?: string })?.role

  return {
    userProfile,
    role,
  }
}