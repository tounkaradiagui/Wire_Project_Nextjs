import { Prisma } from "@prisma/client";

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
