import { Prisma } from "@prisma/client";

//** Ces fonctions sont utilisées pour restreindre l'accès aux données en fonction du rôle de l'utilisateur connecté. **//

// Si l'utilisateur est un enseignant, il ne peut voir que les parents de ses élèves.
// Si l'utilisateur est un admin, il peut voir tous les parents.
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

// Si l'utilisateur est un enseignant, il ne peut voir que les élèves de ses classes.
// Si l'utilisateur est un parent, il ne peut voir que ses enfants.
// Si l'utilisateur est un élève, il ne peut voir que lui-même.
// Si l'utilisateur est un admin, il peut voir tous les élèves. 
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


// Labels lisibles pour les rôles, utilisées dans l'interface utilisateur pour afficher le rôle de l'utilisateur de manière plus compréhensible
export const ROLE_LABELS: Record<string, string> = {
    admin: "Administrateur",
    teacher: "Enseignant",
    student: "Élève",
    parent: "Parent",
};


// 
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

