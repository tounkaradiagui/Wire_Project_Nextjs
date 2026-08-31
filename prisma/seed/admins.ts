import { PrismaClient } from "@prisma/client";

export async function seedAdmins(schoolId: string, prisma: PrismaClient) {
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
        schoolId: schoolId,
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
        schoolId: schoolId,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.admin.createMany({
    data: [
      {
        id: "admin1",
        username: "admin.principal",
        userProfileId: "admin1",
        schoolId: schoolId,
      },
      {
        id: "admin2",
        username: "admin.secondaire",
        userProfileId: "admin2",
        schoolId: schoolId,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Admins seedés.");
}
