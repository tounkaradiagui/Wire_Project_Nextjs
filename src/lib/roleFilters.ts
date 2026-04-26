import { Prisma } from "@prisma/client";

// Ce fichier contient des fonctions de filtrage basées sur les rôles pour les différentes entités de l'application
//  (étudiants, résultats, devoirs, présences, parents). Ces fonctions génèrent des conditions de requête Prisma pour limiter l'accès aux données
//  en fonction du rôle de l'utilisateur connecté. Par exemple, un enseignant ne verra que les étudiants de ses classes, tandis qu'un parent ne 
// verra que ses enfants. Les administrateurs ont accès à toutes les données.
export const studentRoleFilter = (
    role?: string,
    userId?: string | null
): Prisma.StudentWhereInput => {
    if (!role || !userId) {
        return { id: "__no_access__" };
    }

    switch (role) {
        case "admin":
            return {};

        case "teacher":
            return {
                class: {
                    lessons: {
                        some: {
                            teacherId: userId,
                        },
                    },
                },
            };

        case "parent":
            return {
                parentId: userId,
            };

        case "student":
            return {
                id: userId,
            };

        default:
            return { id: "__no_access__" };
    }
};



/**
 * Filtre des résultats selon l'enseignant
 */
export const resultRoleFilter = (
    role: string | undefined,
    userId: string | null
): Prisma.ResultWhereInput => {
    if (role === "teacher" && userId) {
        return {
            OR: [
                {
                    exam: {
                        lesson: {
                            teacherId: userId,
                        },
                    },
                },
                {
                    assignment: {
                        lesson: {
                            teacherId: userId,
                        },
                    },
                },
            ],
        };
    }

    return {};
};

/**
 * Filtre des devoirs selon l'enseignant
 */
export const assignmentRoleFilter = (
    role: string | undefined,
    userId: string | null
): Prisma.AssignmentWhereInput => {
    if (role === "teacher" && userId) {
        return {
            lesson: {
                teacherId: userId,
            },
        };
    }

    return {};
};

/**
 * Filtre des présences
 */
export const attendanceRoleFilter = (
    role: string | undefined,
    userId: string | null
): Prisma.AttendanceWhereInput => {
    if (role === "teacher" && userId) {
        return {
            session: {
                lesson: {
                    teacherId: userId,
                },
            },
        };
    }

    return {};
};

export const parentRoleFilter = (
    role: string | undefined,
    userId: string | null
): Prisma.ParentWhereInput => {
    if (role === "teacher" && userId) {
        return {
            students: {
                some: {
                    class: {
                        lessons: {
                            some: {
                                teacherId: userId,
                            },
                        },
                    },
                },
            },
        };
    }

    return {}; // admin => tous les parents
};

export const ROLE_LABELS: Record<string, string> = {
    admin: "Administrateur",
    teacher: "Enseignant",
    student: "Élève",
    parent: "Parent",
};
