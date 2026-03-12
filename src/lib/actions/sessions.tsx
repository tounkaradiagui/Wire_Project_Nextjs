// src/lib/actions.ts
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export const getAvailableSessions = async () => {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    const where: any = {};

    switch (role) {
        case "teacher":
            where.lesson = { teacherId: userId! };
            break;
        case "parent":
            where.student = { parentId: userId! };
            break;
        case "student":
            where.studentId = userId!;
            break;
    }

    const sessions = await prisma.session.findMany({
        where,
        include: {
            lesson: {
                include: { class: true, teacher: true },
            },
        },
        orderBy: { date: "desc" },
    });

    return sessions;
};