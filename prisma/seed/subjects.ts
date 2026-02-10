import { PrismaClient } from "@prisma/client";
import prisma from '@/lib/prisma';

export async function seedSubjects(prisma: PrismaClient) {
    const subjects = [
        "Mathématiques",
        "Physique / Chimie",
        "Histoire / Géographie",
        "Anglais",
        "EPS",
        "Biologie",
        "Informatique",
        "Chant",
        "Français",
        "Lecture",
        "Calcul",
        "Éducation civique",
        "Dessin",
    ];

    for (const name of subjects) {
        await prisma.subject.create({ data: { name } });
    }
}
