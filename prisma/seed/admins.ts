import { PrismaClient } from "@prisma/client";

export async function seedAdmins(prisma: PrismaClient) {
  // Créer les profiles
  await prisma.userProfile.createMany({
    data: [
      {
        id: "admin1",
        clerkId: "admin1",
        username: "admin.principal",
        firstName: "Admin",
        lastName: "Principal",
        role: "ADMIN",
        isActive: true,
        isBanned: false,
      },
      {
        id: "admin2",
         clerkId: "admin2",
        username: "admin.secondaire",
        firstName: "Admin",
        lastName: "Secondaire",
        role: "ADMIN",
        isActive: true,
        isBanned: false,
      },
    ],
  });

  // Créer les admins liés
  await prisma.admin.createMany({
    data: [
      {
        id: "admin1",
        username: "admin.principal",
        userProfileId: "admin1",
      },
      {
        id: "admin2",
        username: "admin.secondaire",
        userProfileId: "admin2",
      },
    ],
  });
}