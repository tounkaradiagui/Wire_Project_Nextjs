import { Prisma } from "@prisma/client";

/**
 * Filtre automatiquement les élèves visibles selon le rôle
 * L'enseignant ne peut voir la liste des élèves de ses classes 
 * Filtrage automatique pour enseignant
 */
// export const studentRoleFilter = (
//     role: string | undefined,
//     userId: string | null
// ): Prisma.StudentWhereInput => {
//     if (role === "teacher" && userId) {
//         return {
//             class: {
//                 lessons: {
//                     some: {
//                         teacherId: userId,
//                     },
//                 },
//             },
//         };
//     }

//     return {}; // admin = tout voir
// };

// export const studentRoleFilter = (role?: string, userId?: string) => {
//     switch (role) {
//         case "admin":
//             return {};

//         case "teacher":
//             return {
//                 class: {
//                     lessons: {
//                         some: {
//                             teacherId: userId!,
//                         },
//                     },
//                 },
//             };

//         case "parent":
//             return {
//                 parentId: userId!,
//             };

//         case "student":
//             return {
//                 id: userId!,
//             };

//         default:
//             return {
//                 id: "__no_access__",
//             };
//     }
// };

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
            lesson: {
                teacherId: userId,
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
