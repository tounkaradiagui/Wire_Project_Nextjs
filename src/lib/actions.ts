"use server";
import { SessionSchemaInput, UserSchemaInput, EventSchemaInput, AnnouncementSchemaInput, AttendanceSchemaInput, ResultSchemaInput, ExamSchemaInput, AssignmentSchemaInput, LessonSchemaInput, ClassSchemaInput, SubjectSchemaInput, TeacherSchemaInput, StudentSchemaInput, ParentSchemaInput } from "./formValidationSchemas";
import prisma from '@/lib/prisma';
import { createClerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";


type currentState = { success: boolean; error: string | null; };

function timeToDate(time: string) {
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
}

// Generate a base username
function generateBaseUsername(firstName: string, lastName: string) {
    return `${firstName}_${lastName}`
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9_-]/g, "") // 👈 IMPORTANT
        .slice(0, 30);
}

// Generate a unique username
async function generateUniqueUsername(
    clerk: any,
    firstName: string,
    lastName: string
) {
    const base = generateBaseUsername(firstName, lastName);

    let counter = 0;

    while (counter < 20) {
        const username = counter === 0 ? base : `${base}${counter}`;

        const existing = await clerk.users.getUserList({
            username: [username],
        });

        if (existing.data.length === 0) {
            return username;
        }

        counter++;
    }

    throw new Error("Impossible de générer username unique");
}

// Create clerk user Action
export const createUser = async (
    currentState: currentState,
    data: UserSchemaInput
) => {
    const clerk = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY!,
    });

    const baseUsername = generateBaseUsername(
        data.firstName,
        data.lastName
    );

    let attempt = 0;

    while (attempt < 10) {
        const username =
            attempt === 0
                ? (data.username || baseUsername).toLowerCase()
                : `${baseUsername}${attempt}`.toLowerCase();

        try {
            // Conversion propre
            const prismaRole = data.role.toUpperCase();   // ENUM PRISMA
            const metadataRole = data.role.toLowerCase(); // CLERK + URL

            const clerkUser = await clerk.users.createUser({
                firstName: data.firstName,
                lastName: data.lastName,
                username,
                password: data.password,
                publicMetadata: {
                    role: metadataRole,
                    status: "active",
                },
            });

            await prisma.userProfile.create({
                data: {
                    clerkId: clerkUser.id,
                    username: clerkUser.username!,
                    firstName: clerkUser.firstName!,
                    lastName: clerkUser.lastName!,
                    image: clerkUser.imageUrl || null,
                    role: prismaRole as any, // compatible enum
                    isActive: true,
                    isBanned: false,
                    bannedAt: null,
                },
            });

            return { success: true, error: null };

        } catch (error: any) {
            const clerkError = error?.errors?.[0];

            if (clerkError?.code === "form_identifier_exists") {
                attempt++;
                continue;
            }

            return { success: false, error: "Erreur Clerk" };
        }
    }

    return {
        success: false,
        error: "Impossible de générer un username unique",
    };
};

// Update clerk user Action
export const updateUser = async (
    currentState: currentState,
    data: UserSchemaInput & { id: string }
) => {
    try {
        if (!data.id) {
            return { success: false, error: "ID manquant" };
        }
        const clerk = createClerkClient({
            secretKey: process.env.CLERK_SECRET_KEY!,
        });

        let username = data.username;

        const existing = await clerk.users.getUserList({
            username: [username],
        });

        const conflict = existing.data.some(
            (u) => u.id !== data.id
        );

        if (conflict) {
            username = await generateUniqueUsername(
                clerk,
                data.firstName,
                data.lastName
            );
        }

        // UPDATE Clerk user
        await clerk.users.updateUser(data.id, {
            firstName: data.firstName,
            lastName: data.lastName,
            username,
            //   emailAddress: data.email ? [data.email] : undefined,
            ...(data.password && { password: data.password }),
        });

        // UPDATE Prisma profile
        await prisma.userProfile.update({
            where: { clerkId: data.id },
            data: {
                role: data.role,
            },
        });

        return { success: true, error: null };
    } catch (error) {
        // console.error(error);
        return { success: false, error: "Erreur lors de la mise à jour" };
    }
};

export const toggleUserStatus = async (id: string): Promise<void> => {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (role !== "super_admin") {
        throw new Error("Action non autorisée !");
    }

    const clerk = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY!,
    });

    const user = await prisma.userProfile.findUnique({
        where: { id },
    });

    if (!user) {
        throw new Error("Utilisateur introuvable !");
    }

    const newBanState = !user.isBanned;

    // Update Prisma
    await prisma.userProfile.update({
        where: { id },
        data: {
            isBanned: newBanState,
            isActive: !newBanState,
            bannedAt: newBanState ? new Date() : null,
        },
    });

    // Update Clerk metadata
    await clerk.users.updateUser(user.clerkId, {
        publicMetadata: {
            isBanned: newBanState,
        },
    });

    // 🔥 Revoke ALL active sessions if banned
    if (newBanState) {
        const sessionList = await clerk.sessions.getSessionList({
            userId: user.clerkId,
        });

        for (const session of sessionList.data) {
            await clerk.sessions.revokeSession(session.id);
        }
    }

    revalidatePath("/list/users");
};


export async function requireActiveUser() {
    const { userId } = await auth();

    if (!userId) throw new Error("Non authentifié");

    const user = await prisma.userProfile.findUnique({
        where: { id: userId },
        select: { isBanned: true },
    });

    if (user?.isBanned) {
        throw new Error("Compte suspendu");
    }

    return userId;
}

// Create Subject Action
export const createSubject = async (currentState: currentState, data: SubjectSchemaInput) => {
    try {
        await prisma.subject.create({
            data: {
                name: data.name,
                ...(data.teachers?.length && {
                    teachers: {
                        create: data.teachers.map((teacherId: string) => ({
                            teacher: {
                                connect: { id: teacherId },
                            },
                        })),
                    },
                }),
            },
        });

        return { success: true, error: null };

    } catch (error) {
        // console.log(error)
        return { success: false, error: "Une erreur est survenue lors de la création de la matière" };
    }
};

export const updateSubject = async (
    currentState: currentState,
    data: SubjectSchemaInput
) => {
    try {
        if (!data.id) {
            return { success: false, error: "ID de la matière manquant" };
        }

        await prisma.$transaction(async (tx) => {
            // Update subject name
            await tx.subject.update({
                where: { id: data.id },
                data: { name: data.name },
            });

            // Remove old teacher relations
            await tx.teacherSubject.deleteMany({
                where: { subjectId: data.id },
            });

            // Recreate relations
            if (data.teachers?.length) {
                await tx.teacherSubject.createMany({
                    data: data.teachers.map((teacherId: string) => ({
                        teacherId,
                        subjectId: data.id!,
                    })),
                });
            }
        });

        return { success: true, error: null };
    } catch (error) {
        // console.error(error);
        return {
            success: false,
            error: "Une erreur est survenue lors de la mise à jour de la matière",
        };
    }
};

export const deleteSubject = async (currentState: currentState, data: FormData) => {
    const id = data.get("id") as string;
    try {
        await prisma.subject.delete({
            where: {
                id: parseInt(id)
            }
        });
        return { success: true, error: null }

    } catch (error) {
        // console.log(error)
        return { success: false, error: "Erreur de suppression de la matière" };
    }
}

// Create Class Action 
export const createClass = async (
    currentState: currentState,
    data: ClassSchemaInput
) => {
    try {
        // Vérifier le grade
        const grade = await prisma.grade.findUnique({
            where: { id: data.gradeId },
        })
        if (!grade) {
            return { success: false, error: "Niveau introuvable" }
        }

        // Créer la classe
        await prisma.class.create({
            data: {
                name: data.name,
                capacity: data.capacity,
                gradeId: data.gradeId,
            },
        })

        return { success: true, error: null }
    } catch (error) {
        // console.log("createClass error:", error)
        return { success: false, error: "Erreur de création de la classe" }
    }
}

export const updateClass = async (currentState: currentState, data: ClassSchemaInput) => {
    try {
        await prisma.class.update({
            where: {
                id: data.id
            },

            data
        });
        return { success: true, error: null }

    } catch (error) {
        // console.log(error)
        return { success: false, error: "Erreur de mise à jour de la classe" };
    }
};

export const deleteClass = async (currentState: currentState, data: FormData) => {
    const id = data.get("id") as string;
    try {
        await prisma.class.delete({
            where: {
                id: parseInt(id)
            }
        });
        return { success: true, error: null }

    } catch (error) {
        return { success: false, error: "Erreur de suppression de la classe" };
    }
}

// Create Teacher Action
export const createTeacher = async (
    currentState: { success: boolean; error: string | null },
    data: TeacherSchemaInput
) => {
    let userId: string | null = null;

    const clerk = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY!,
    });

    try {
        // Créer user Clerk
        const user = await clerk.users.createUser({
            username: data.username,
            password: data.password,
            firstName: data.name,
            lastName: data.surname,
            publicMetadata: {
                role: "teacher",
                status: "active",
            },
        });

        userId = user.id;

        // Transaction DB
        await prisma.$transaction(async (tx) => {
            // Créer UserProfile
            const profile = await tx.userProfile.create({
                data: {
                    clerkId: user.id,
                    role: "TEACHER",
                    username: data.username,
                    firstName: data.name,
                    lastName: data.surname,
                    isActive: true,
                    isBanned: false,
                },
            });

            // Créer Teacher
            await tx.teacher.create({
                data: {
                    id: user.id,
                    username: data.username,
                    name: data.name,
                    surname: data.surname,
                    email: data.email || null,
                    phone: data.phone || null,
                    address: data.address,
                    image: data.image || null,
                    bloodType: data.bloodType,
                    sex: data.sex,
                    birthday: data.birthday ?? null,
                    userProfileId: profile.id, // Liaison du profil utilisateur
                },
            });

            // Relations subjects
            if (data.subjects && data.subjects.length > 0) {
                const subjects = await tx.subject.findMany({
                    where: { name: { in: data.subjects } },
                    select: { id: true },
                });

                await tx.teacherSubject.createMany({
                    data: subjects.map((s) => ({
                        teacherId: user.id!,
                        subjectId: s.id,
                    })),
                });
            }

            // Relations classes
            if (data.classes && data.classes.length > 0) {
                const classes = await tx.class.findMany({
                    where: { id: { in: data.classes } },
                    select: { id: true },
                });

                await tx.teacherClass.createMany({
                    data: classes.map((c) => ({
                        teacherId: user.id!,
                        classId: c.id,
                    })),
                });
            }
        });

        return { success: true, error: null };

    } catch (error) {
        // rollback Clerk si erreur DB
        if (userId) {
            await clerk.users.deleteUser(userId);
        }

        // console.error("CREATE TEACHER ERROR 👉", error);

        return {
            success: false,
            error: "Une erreur est survenue lors de la création du professeur.",
        };
    }
};

// Update Teacher Action
export const updateTeacher = async (
    _currentState: { success: boolean; error: string | null },
    data: TeacherSchemaInput
) => {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (role !== "admin" && role !== "super_admin") {
        return { success: false, error: "Action non autorisée." };
    }

    if (!data.id) {
        return { success: false, error: "ID manquant" };
    }

    const clerk = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY!,
    });

    try {
        // Update Clerk
        await clerk.users.updateUser(data.id, {
            username: data.username,
            ...(data.password && { password: data.password }),
            firstName: data.name,
            lastName: data.surname,
            publicMetadata: { role: "teacher" },
        });

        // Transaction Prisma
        await prisma.$transaction(async (tx) => {

            // Récupérer le teacher avec son profile
            const teacher = await tx.teacher.findUnique({
                where: { id: data.id },
                select: { userProfileId: true },
            });

            if (!teacher) {
                throw new Error("Teacher introuvable");
            }

            // Update UserProfile
            await tx.userProfile.update({
                where: { id: teacher.userProfileId },
                data: {
                    username: data.username,
                    firstName: data.name,
                    lastName: data.surname,
                },
            });

            // Update Teacher
            await tx.teacher.update({
                where: { id: data.id },
                data: {
                    username: data.username,
                    name: data.name,
                    surname: data.surname,
                    email: data.email ?? null,
                    phone: data.phone ?? null,
                    address: data.address,
                    image: data.image ?? null,
                    bloodType: data.bloodType,
                    sex: data.sex,
                    birthday: data.birthday ?? null,
                },
            });

            // Update relations subjects
            await tx.teacherSubject.deleteMany({
                where: { teacherId: data.id },
            });

            if (data.subjects?.length) {
                const subjects = await tx.subject.findMany({
                    where: { name: { in: data.subjects } },
                    select: { id: true },
                });

                await tx.teacherSubject.createMany({
                    data: subjects.map((s) => ({
                        teacherId: data.id!,
                        subjectId: s.id,
                    })),
                });
            }

            // Update relations classes
            await tx.teacherClass.deleteMany({
                where: { teacherId: data.id },
            });

            if (data.classes?.length) {
                await tx.teacherClass.createMany({
                    data: data.classes.map((classId) => ({
                        teacherId: data.id!,
                        classId,
                    })),
                });
            }
        });

        return { success: true, error: null };

    } catch (error) {
        // console.error("UPDATE TEACHER ERROR 👉", error);
        return {
            success: false,
            error: "Erreur lors de la mise à jour.",
        };
    }
};

// Delete Teacher Action if Super Admin but deactivate if admin
export const deleteTeacher = async (currentState: currentState, data: FormData
) => {
    const id = data.get("id") as string;

    if (!id) {
        return { success: false, error: true };
    }

    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (role !== "admin") {
        return { success: false, error: "Non autorisé" };
    }

    try {
        await prisma.teacher.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
        });

        return { success: true, error: null };
    } catch (error) {
        // console.error(error);
        return { success: false, error: "Erreur de suppression" };
    }
};

// Create Student Action
export const createStudent = async (
    _currentState: { success: boolean; error: string | null },
    data: StudentSchemaInput
) => {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (role !== "admin" && role !== "super_admin") {
        return { success: false, error: "Action non autorisée." };
    }

    let userId: string | null = null;

    const clerk = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY!,
    });

    try {
        const { parentId, classId, gradeId } = data;

        if (!parentId) throw new Error("Parent is required");
        if (!classId) throw new Error("Class is required");
        if (!gradeId) throw new Error("Grade is required");

        // Vérifier capacité classe
        const classItem = await prisma.class.findUnique({
            where: { id: classId },
            include: { _count: { select: { students: true } } },
        });

        if (!classItem) {
            return { success: false, error: "Classe introuvable." };
        }

        if (classItem.capacity === classItem._count.students) {
            return { success: false, error: "La classe est pleine." };
        }

        // Create Clerk user
        const user = await clerk.users.createUser({
            username: data.username,
            password: data.password,
            firstName: data.name,
            lastName: data.surname,
            publicMetadata: {
                role: "student",
                status: "active",
            },
        });

        userId = user.id;

        // Transaction Prisma
        await prisma.$transaction(async (tx) => {
            // Créer UserProfile d'abord
            const profile = await tx.userProfile.create({
                data: {
                    clerkId: user.id,
                    role: "STUDENT",
                    username: data.username,
                    firstName: data.name,
                    lastName: data.surname,
                    isActive: true,
                    isBanned: false,
                },
            });

            // Ensuite créer Student
            await tx.student.create({
                data: {
                    id: user.id,
                    username: data.username,
                    name: data.name,
                    surname: data.surname,
                    email: data.email || null,
                    phone: data.phone || null,
                    address: data.address,
                    image: data.image || null,
                    bloodType: data.bloodType,
                    sex: data.sex,
                    birthday: data.birthday ?? null,
                    userProfile: {
                        connect: { id: profile.id }, // Liaison du profil utilisateur
                    },
                    parent: { connect: { id: parentId } },
                    class: { connect: { id: classId } },
                    grade: { connect: { id: gradeId } },
                },
            });
        });

        return { success: true, error: null };
    } catch (error) {
        if (userId) {
            await clerk.users.deleteUser(userId);
        }

        return {
            success: false,
            error: "Une erreur est survenue lors de la création de l'élève.",
        };
    }
};

// Update Student Action
export const updateStudent = async (
    _currentState: { success: boolean; error: string | null },
    data: StudentSchemaInput
) => {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (role !== "admin" && role !== "super_admin") {
        return { success: false, error: "Action non autorisée." };
    }

    if (!data.id) {
        return { success: false, error: "Student ID is required" };
    }

    const clerk = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY!,
    });

    try {
        const { parentId, classId, gradeId } = data;

        if (!parentId) throw new Error("Parent is required");
        if (!classId) throw new Error("Class is required");
        if (!gradeId) throw new Error("Grade is required");

        const existingStudent = await prisma.student.findUnique({
            where: { id: data.id },
            select: { classId: true, userProfileId: true },
        });

        if (!existingStudent) {
            return { success: false, error: "Élève introuvable." };
        }

        const classItem = await prisma.class.findUnique({
            where: { id: classId },
            include: { _count: { select: { students: true } } },
        });

        if (
            existingStudent.classId !== classId &&
            classItem &&
            classItem.capacity === classItem._count.students
        ) {
            return { success: false, error: "La classe est pleine" };
        }

        // Transaction
        await prisma.$transaction(async (tx) => {
            // Update Clerk
            await clerk.users.updateUser(data.id!, {
                username: data.username,
                ...(data.password && { password: data.password }),
                firstName: data.name,
                lastName: data.surname,
            });

            // Update UserProfile
            await tx.userProfile.update({
                where: { id: existingStudent.userProfileId },
                data: {
                    username: data.username,
                    firstName: data.name,
                    lastName: data.surname,
                },
            });

            // Update Student
            await tx.student.update({
                where: { id: data.id },
                data: {
                    username: data.username,
                    name: data.name,
                    surname: data.surname,
                    email: data.email || null,
                    phone: data.phone || null,
                    address: data.address,
                    image: data.image || null,
                    bloodType: data.bloodType,
                    sex: data.sex,
                    birthday: data.birthday ?? null,
                    parent: { connect: { id: parentId } },
                    class: { connect: { id: classId } },
                    grade: { connect: { id: gradeId } },
                },
            });
        });

        return { success: true, error: null };
    } catch (error) {
        console.log(error, "Erreur de serveur")
        return {
            success: false,
            error: "Une erreur est survenue lors de la mise à jour de l'élève.",
        };
    }
};

// Delete Student Action
export const deleteStudent = async (
    _currentState: currentState,
    data: FormData
) => {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (role !== "admin" && role !== "super_admin") {
        return { success: false, error: "Action non autorisée." };
    }

    const id = data.get("id") as string;

    try {
        const student = await prisma.student.findUnique({
            where: { id },
            select: { userProfileId: true },
        });

        if (!student) {
            return { success: false, error: "Élève introuvable." };
        }

        await prisma.$transaction(async (tx) => {
            // Soft delete Student
            await tx.student.update({
                where: { id },
                data: {
                    isDeleted: true,
                    deletedAt: new Date(),
                },
            });

            // Désactiver le profil
            await tx.userProfile.update({
                where: { id: student.userProfileId },
                data: {
                    isActive: false,
                    isBanned: true,
                },
            });
        });

        return { success: true, error: null };
    } catch {
        return {
            success: false,
            error: "Erreur lors de la suppression.",
        };
    }
};

// Create Exam Action
export const createExam = async (currentState: currentState, data: ExamSchemaInput) => {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    try {
        if (role === "teacher") {
            const teacherLesson = await prisma.lesson.findFirst({
                where: {
                    teacherId: userId!,
                    id: data.lessonId
                }
            })

            if (!teacherLesson) {
                return { success: false, error: null };
            }
        }

        await prisma.exam.create({
            data: {
                title: data.title,
                startTime: data.startTime,
                endTime: data.endTime,
                lessonId: data.lessonId
            }
        });
        return { success: true, error: null }

    } catch (error) {
        // console.log(error)
        return { success: false, error: "Une erreur est survenue lors de la création de l'examen." };
    }
};

export const updateExam = async (currentState: currentState, data: ExamSchemaInput) => {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    try {
        if (role === "teacher") {
            const teacherLesson = await prisma.lesson.findFirst({
                where: {
                    teacherId: userId!,
                    id: data.lessonId
                }
            })

            if (!teacherLesson) {
                return { success: false, error: "Vous n'êtes pas autorisé à modifier cet examen." };
            }
        }

        await prisma.exam.update({
            where: {
                id: data.id,
            },
            data: {
                title: data.title,
                startTime: data.startTime,
                endTime: data.endTime,
                lessonId: data.lessonId
            }
        });
        return { success: true, error: null }

    } catch (error) {
        // console.log(error)
        return { success: false, error: "Une erreur est survenue lors de la mise à jour de l'examen." };
    }
};

export const deleteExam = async (currentState: currentState, data: FormData) => {
    const id = data.get("id") as string;

    try {
        await prisma.exam.delete({
            where: {
                id: parseInt(id),
            },
            select: {
                id: true,
                title: true,
            }
        });
        return { success: true, error: null }

    } catch (error) {
        // console.log(error)
        return { success: false, error: "Une erreur est survenue lors de la suppression de l'examen." };
    }
};

// Create Parent Action
export const createParent = async (
    _currentState: { success: boolean; error: string | null },
    data: ParentSchemaInput
) => {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (role !== "admin" && role !== "super_admin") {
        return { success: false, error: "Action non autorisée." };
    }

    let userId: string | null = null;

    const clerk = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY!,
    });

    try {
        const user = await clerk.users.createUser({
            username: data.username,
            password: data.password,
            firstName: data.name,
            lastName: data.surname,
            publicMetadata: {
                role: "parent",
                status: "active",
            },
        });

        userId = user.id;

        await prisma.$transaction(async (tx) => {
            const profile = await tx.userProfile.create({
                data: {
                    clerkId: user.id,
                    role: "PARENT",
                    username: data.username,
                    firstName: data.name,
                    lastName: data.surname,
                    isActive: true,
                    isBanned: false,
                },
            });

            await tx.parent.create({
                data: {
                    id: user.id,
                    username: data.username,
                    name: data.name,
                    surname: data.surname,
                    email: data.email || null,
                    phone: data.phone,
                    address: data.address,
                    image: data.image || null,
                    sex: data.sex,
                    birthday: data.birthday ?? null,

                    userProfile: {
                        connect: { id: profile.id },
                    },
                },
            });
        });

        return { success: true, error: null };
    } catch (error) {
        if (userId) {
            await clerk.users.deleteUser(userId);
        }

        return {
            success: false,
            error: "Une erreur est survenue lors de la création du parent.",
        };
    }
};

// Update Parent Action
export const updateParent = async (
    _currentState: { success: boolean; error: string | null },
    data: ParentSchemaInput
) => {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (role !== "admin" && role !== "super_admin") {
        return { success: false, error: "Action non autorisée." };
    }

    if (!data.id) {
        return { success: false, error: "ID manquant" };
    }

    const clerk = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY!,
    });

    try {
        const existingParent = await prisma.parent.findUnique({
            where: { id: data.id },
            select: { userProfileId: true },
        });

        if (!existingParent) {
            return { success: false, error: "Parent introuvable." };
        }

        await prisma.$transaction(async (tx) => {
            await clerk.users.updateUser(data.id!, {
                username: data.username,
                ...(data.password && { password: data.password }),
                firstName: data.name,
                lastName: data.surname,
            });

            await tx.userProfile.update({
                where: { id: existingParent.userProfileId },
                data: {
                    username: data.username,
                    firstName: data.name,
                    lastName: data.surname,
                },
            });

            await tx.parent.update({
                where: { id: data.id },
                data: {
                    username: data.username,
                    name: data.name,
                    surname: data.surname,
                    email: data.email || null,
                    phone: data.phone,
                    address: data.address,
                    image: data.image || null,
                    sex: data.sex,
                    birthday: data.birthday ?? null,
                },
            });
        });

        return { success: true, error: null };
    } catch {
        return {
            success: false,
            error: "Une erreur est survenue lors de la mise à jour du parent.",
        };
    }
};

// Delete Parent Action
export const deleteParent = async (
    _currentState: currentState,
    data: FormData
) => {
    const { sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (role !== "admin" && role !== "super_admin") {
        return { success: false, error: "Action non autorisée." };
    }

    const id = data.get("id") as string;

    try {
        const parent = await prisma.parent.findUnique({
            where: { id },
            select: { userProfileId: true },
        });

        if (!parent) {
            return { success: false, error: "Parent introuvable." };
        }

        await prisma.$transaction(async (tx) => {
            await tx.parent.update({
                where: { id },
                data: {
                    isDeleted: true,
                    deletedAt: new Date(),
                },
            });

            await tx.userProfile.update({
                where: { id: parent.userProfileId },
                data: {
                    isActive: false,
                    isBanned: true,
                },
            });
        });

        return { success: true, error: null };
    } catch {
        return {
            success: false,
            error: "Une erreur est survenue lors de la suppression du parent.",
        };
    }
};

// Create Lesson Action
export const createLesson = async (
    _currentState: { success: boolean; error: string | null },
    data: LessonSchemaInput
) => {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    try {
        if (!userId) {
            return { success: false, error: "Utilisateur non authentifié." };
        }

        const teacherId = role === "teacher" ? userId : data.teacherId;

        if (!teacherId) {
            return { success: false, error: "Aucun enseignant spécifié." };
        }

        const startDate = new Date(data.startDate);
        const dueDate = new Date(data.dueDate);

        if (startDate >= dueDate) {
            return {
                success: false,
                error: "La date de fin doit être après la date de début.",
            };
        }

        // vérifier assignation prof-classe
        const isAssigned = await prisma.teacherClass.findFirst({
            where: {
                teacherId,
                classId: data.classId,
            },
        });

        if (!isAssigned) {
            return {
                success: false,
                error: "Cet enseignant n’est pas assigné à cette classe.",
            };
        }

        await prisma.lesson.create({
            data: {
                name: data.name,
                startDate,
                dueDate,
                subjectId: data.subjectId,
                classId: data.classId,
                teacherId,
            },
        });

        return { success: true, error: null };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            error: "Une erreur est survenue lors de la création du cours.",
        };
    }
};

// Update Lesson
export const updateLesson = async (
    _currentState: { success: boolean; error: string | null },
    data: LessonSchemaInput
) => {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    try {
        if (!userId) {
            return { success: false, error: "Utilisateur non authentifié." };
        }

        if (!data.id) {
            return { success: false, error: "ID du cours manquant." };
        }

        const teacherId = role === "teacher" ? userId : data.teacherId;

        if (!teacherId) {
            return { success: false, error: "Aucun enseignant spécifié." };
        }

        if (role === "teacher") {
            const lesson = await prisma.lesson.findUnique({
                where: { id: data.id },
            });

            if (lesson?.teacherId !== userId) {
                return {
                    success: false,
                    error: "Vous ne pouvez modifier que vos propres cours.",
                };
            }
        }

        const startDate = new Date(data.startDate);
        const dueDate = new Date(data.dueDate);

        if (startDate >= dueDate) {
            return {
                success: false,
                error: "La date de fin doit être après la date de début.",
            };
        }

        // 🔒 Vérifier assignation prof-classe
        const isAssigned = await prisma.teacherClass.findFirst({
            where: {
                teacherId,
                classId: data.classId,
            },
        });

        if (!isAssigned) {
            return {
                success: false,
                error: "Cet enseignant n’est pas assigné à cette classe.",
            };
        }

        await prisma.lesson.update({
            where: {
                id: data.id,
            },
            data: {
                name: data.name,
                startDate,
                dueDate,
                subjectId: data.subjectId,
                classId: data.classId,
                teacherId,
            },
        });

        return { success: true, error: null };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            error: "Une erreur est survenue lors de la mise à jour du cours.",
        };
    }
};

export const deleteLesson = async (
    _currentState: { success: boolean; error: string | null },
    data: FormData
) => {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    const id = parseInt(data.get("id") as string);

    try {
        if (!userId) {
            return { success: false, error: "Utilisateur non authentifié." };
        }

        const lesson = await prisma.lesson.findUnique({
            where: { id },
        });

        if (!lesson) {
            return { success: false, error: "Cours introuvable." };
        }

        // 🔐 Teacher ne peut supprimer que ses cours
        if (role === "teacher" && lesson.teacherId !== userId) {
            return { success: false, error: "Action non autorisée." };
        }

        await prisma.lesson.delete({
            where: { id },
        });

        return { success: true, error: null };
    } catch (error) {
        // console.error(error);
        return {
            success: false,
            error: "Une erreur est survenue lors de la suppression du cours.",
        };
    }
};

// Create Session Action
export const createSession = async (
    currentState: currentState,
    data: SessionSchemaInput
): Promise<currentState> => {
    try {
        const { userId, sessionClaims } = await auth();
        const role = (sessionClaims?.metadata as { role?: string })?.role;

        if (!userId || !role) {
            return { success: false, error: "Non autorisé." };
        }

        if (!["super_admin", "admin", "teacher"].includes(role)) {
            return { success: false, error: "Rôle interdit." };
        }

        const startTime = new Date(data.startTime);
        const endTime = new Date(data.endTime);
        const date = new Date(data.date);

        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
            return { success: false, error: "Heure invalide." };
        }

        if (endTime <= startTime) {
            return {
                success: false,
                error: "L'heure de fin doit être après l'heure de début.",
            };
        }

        const lesson = await prisma.lesson.findUnique({
            where: { id: data.lessonId },
        });

        if (!lesson) {
            return {
                success: false,
                error: "La leçon sélectionnée est introuvable.",
            };
        }

        if (role === "teacher" && lesson.teacherId !== userId) {
            return {
                success: false,
                error: "Ce cours ne vous appartient pas.",
            };
        }
        if (!lesson.startDate || !lesson.dueDate || date < lesson.startDate || date > lesson.dueDate) {
            return {
                success: false,
                error: "La date de la séance est hors de la période du cours.",
            };
        }

        // 🚫 Conflits
        const conflict = await prisma.session.findFirst({
            where: {
                date,
                isDeleted: false,
                AND: [
                    { startTime: { lt: endTime } },
                    { endTime: { gt: startTime } },
                ],
                OR: [
                    { lesson: { teacherId: lesson.teacherId } },
                    { lesson: { classId: lesson.classId } },
                ],
            },
        });

        if (conflict) {
            return {
                success: false,
                error:
                    "Conflit : le professeur ou la classe a déjà une séance à cette heure.",
            };
        }

        await prisma.session.create({
            data: {
                date,
                startTime,
                endTime,
                room: data.room ?? null,
                lesson: { connect: { id: data.lessonId } },
                teacher: { connect: { id: lesson.teacherId } },
                class: { connect: { id: lesson.classId } },
                isDeleted: false,
            },
        });

        return { success: true, error: null };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Erreur serveur." };
    }
};

// Update Session Action
export const updateSession = async (
    currentState: currentState,
    data: SessionSchemaInput
): Promise<currentState> => {
    try {
        const { userId, sessionClaims } = await auth();
        const role = (sessionClaims?.metadata as { role?: string })?.role;

        if (!userId || !role) {
            return { success: false, error: "Non autorisé." };
        }

        if (!["super_admin", "admin", "teacher"].includes(role)) {
            return { success: false, error: "Rôle interdit." };
        }

        if (!data.id) {
            return { success: false, error: "ID de la session manquant." };
        }

        const session = await prisma.session.findUnique({
            where: { id: data.id },
            include: {
                lesson: true,
            },
        });

        if (!session || session.isDeleted) {
            return { success: false, error: "Séance introuvable." };
        }

        const lesson = session.lesson;

        // 👨‍🏫 Ownership teacher
        if (role === "teacher" && lesson.teacherId !== userId) {
            return {
                success: false,
                error: "Cette séance ne vous appartient pas.",
            };
        }

        const startTime = new Date(data.startTime);
        const endTime = new Date(data.endTime);
        const date = new Date(data.date);

        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
            return { success: false, error: "Heure invalide." };
        }

        if (endTime <= startTime) {
            return {
                success: false,
                error: "L'heure de fin doit être après l'heure de début.",
            };
        }

        // Synchroniser date
        startTime.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
        endTime.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());

        if (!lesson.startDate || !lesson.dueDate || date < lesson.startDate || date > lesson.dueDate) {
            return {
                success: false,
                error:
                    "La date de la séance doit être comprise dans la période du cours.",
            };
        }

        // 🚫 Conflits professeur + classe
        const conflict = await prisma.session.findFirst({
            where: {
                id: { not: data.id },
                date,
                isDeleted: false,
                AND: [
                    { startTime: { lt: endTime } },
                    { endTime: { gt: startTime } },
                ],
                OR: [
                    { lesson: { teacherId: lesson.teacherId } },
                    { lesson: { classId: lesson.classId } },
                ],
            },
        });

        if (conflict) {
            return {
                success: false,
                error:
                    "Conflit : la classe ou l’enseignant a déjà une séance à cette heure.",
            };
        }

        await prisma.session.update({
            where: { id: data.id },
            data: {
                date,
                startTime,
                endTime,
                room: data.room ?? null,
            },
        });

        return { success: true, error: null };
    } catch (error) {
        console.log("updateSession error:", error);
        return { success: false, error: "Erreur serveur." };
    }
};

// Delete Session Action
export const deleteSession = async (
    currentState: currentState,
    id: string
): Promise<currentState> => {
    try {
        const { userId, sessionClaims } = await auth();
        const role = (sessionClaims?.metadata as { role?: string })?.role;

        if (!userId || !role) {
            return { success: false, error: "Non autorisé." };
        }

        if (!["super_admin", "admin", "teacher"].includes(role)) {
            return { success: false, error: "Rôle interdit." };
        }

        const session = await prisma.session.findUnique({
            where: { id },
            include: {
                lesson: true,
                attendances: true,
            },
        });

        if (!session || session.isDeleted) {
            return { success: false, error: "Séance introuvable." };
        }

        // 👨‍🏫 Ownership check
        if (role === "teacher" && session.lesson.teacherId !== userId) {
            return {
                success: false,
                error: "Cette séance ne vous appartient pas.",
            };
        }

        // 🚨 Empêcher suppression si des présences existent
        if (session.attendances.length > 0) {
            return {
                success: false,
                error:
                    "Impossible de supprimer cette séance car des présences y sont liées.",
            };
        }

        // ✅ Soft delete
        await prisma.session.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });

        return { success: true, error: null };
    } catch (error) {
        console.log("deleteSession error:", error);
        return { success: false, error: "Erreur serveur." };
    }
};

// Create Assignment Action
export const createAssignment = async (
    currentState: currentState,
    data: AssignmentSchemaInput
) => {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    try {
        // 🔐 Autorisation
        if (!["teacher", "admin"].includes(role ?? "")) {
            return { success: false, error: "Vous n’êtes pas autorisé à effectuer cette action." };
        }

        // 🕒 Validation des dates
        const startDate = new Date(data.startDate);
        const dueDate = new Date(data.dueDate);

        if (isNaN(startDate.getTime()) || isNaN(dueDate.getTime())) {
            return { success: false, error: null };
        }

        if (dueDate <= startDate) {
            return { success: false, error: "La date de remise doit être postérieure à la date de début." };
        }

        // 👨‍🏫 Vérifier que le prof possède la leçon
        if (role === "teacher") {
            const teacherLesson = await prisma.lesson.findFirst({
                where: {
                    id: data.lessonId,
                    teacherId: userId!,
                },
            });

            if (!teacherLesson) {
                return { success: false, error: "Ce cours ne vous appartient pas" };
            }
        }

        // ✅ Création
        await prisma.assignment.create({
            data: {
                title: data.title,
                startDate,
                dueDate,
                lessonId: data.lessonId,
            },
        });

        return { success: true, error: null };
    } catch (error) {
        // console.error("Create Assignment Error ❌", error);
        return { success: false, error: "Erreur lors de la création" };
    }
};

export const updateAssignment = async (
    currentState: currentState,
    data: AssignmentSchemaInput
) => {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    try {
        // 🔐 Autorisation
        if (!["teacher", "admin"].includes(role ?? "")) {
            return { success: false, error: "Vous n’êtes pas autorisé à effectuer cette action." };
        }

        // 🆔 ID obligatoire
        if (!data.id) {
            return { success: false, error: "ID requis" };
        }

        // 🕒 Validation des dates
        const startDate = new Date(data.startDate);
        const dueDate = new Date(data.dueDate);

        if (isNaN(startDate.getTime()) || isNaN(dueDate.getTime())) {
            return { success: false, error: null };
        }

        if (dueDate <= startDate) {
            return { success: false, error: "La date de remise doit être postérieure à la date de début." };
        }

        // 👨‍🏫 Vérifier que le prof possède la leçon
        if (role === "teacher") {
            const teacherLesson = await prisma.lesson.findFirst({
                where: {
                    id: data.lessonId,
                    teacherId: userId!,
                },
            });

            if (!teacherLesson) {
                return { success: false, error: "Ce cours ne vous appartient pas" };
            }
        }

        // ✅ Mise à jour
        await prisma.assignment.update({
            where: {
                id: data.id,
            },
            data: {
                title: data.title,
                startDate,
                dueDate,
                lessonId: data.lessonId,
            },
        });

        return { success: true, error: null };
    } catch (error) {
        // console.error("Update Assignment Error ❌", error);
        return { success: false, error: "Erreur lors de la mise à jour" };
    }
};


export const deleteAssignment = async (currentState: currentState, data: FormData) => {
    const id = data.get("id") as string;

    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    try {
        await prisma.assignment.delete({
            where: {
                id: parseInt(id),
                ...(role === "teacher" ? { teacherId: userId! } : {}),
            },
            select: {
                id: true,
                title: true,
            }
        });
        return { success: true, error: null }

    } catch (error) {
        // console.log(error)
        return { success: false, error: "Une erreur est survenue lors de la suppression du devoir." };
    }
};

// Create Result Action
export const createResult = async (
    currentState: currentState,
    data: ResultSchemaInput
) => {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    // 🔒 Sécurité : seul l'enseignant peut enregister un note
    if (!userId || role !== "teacher") {
        return {
            success: false,
            error: "Seul un enseignant peut enregistrer une note",
        };
    }

    // Vérifier que la leçon appartient bien à l’enseignant
    const lesson = await prisma.lesson.findFirst({
        where: {
            teacherId: userId!,
            OR: [
                { exams: { some: { id: data.examId ?? undefined } } },
                { assignments: { some: { id: data.assignmentId ?? undefined } } },
            ],
        },
    });

    if (!lesson) {
        return {
            success: false,
            error: "Accès refusé à cette leçon",
        };
    }

    if (data.examId) {
        const examExists = await prisma.exam.findUnique({
            where: { id: data.examId },
        });

        if (!examExists) {
            return { success: false, error: "Examen introuvable" };
        }
    }

    if (!data.examId && !data.assignmentId) {
        return { success: false, error: "Examen ou devoir requis" };
    }

    if (data.examId && data.assignmentId) {
        return { success: false, error: "Impossible d’avoir examen et devoir en même temps" };
    }

    try {

        await prisma.result.create({
            data: {
                score: data.score,
                studentId: data.studentId,
                examId: data.examId ? Number(data.examId) : null,
                assignmentId: data.assignmentId ? Number(data.assignmentId) : null,
            },
        });

        return { success: true, error: null };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            error: "Erreur lors de l'enregistrement de la note",
        };
    }
};

// Update Result Action
export const updateResult = async (
    _currentState: { success: boolean; error: string | null },
    data: ResultSchemaInput
) => {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (!userId || role !== "teacher") {
        return {
            success: false,
            error: "Seul un enseignant peut modifier une note",
        };
    }

    if (!data.id) {
        return { success: false, error: "ID manquant" };
    }

    const existingResult = await prisma.result.findUnique({
        where: { id: data.id },
        include: {
            exam: { include: { lesson: true } },
            assignment: { include: { lesson: true } },
        },
    });

    if (!existingResult) {
        return { success: false, error: "Note introuvable" };
    }

    const lesson =
        existingResult.exam?.lesson ||
        existingResult.assignment?.lesson;

    if (!lesson || lesson.teacherId !== userId) {
        return { success: false, error: "Accès refusé" };
    }

    try {
        await prisma.result.update({
            where: { id: data.id },
            data: {
                score: data.score,
            },
        });

        return { success: true, error: null };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            error: "Erreur lors de la modification",
        };
    }
};

// Delete Result Action
export const deleteResult = async (
    currentState: currentState,
    formData: FormData
) => {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (!userId || role !== "teacher") {
        return {
            success: false,
            error: "Seul un enseignant peut supprimer une note",
        };
    }

    const id = Number(formData.get("id"));

    if (!id) {
        return { success: false, error: "ID invalide" };
    }

    const existingResult = await prisma.result.findUnique({
        where: { id },
        include: {
            exam: { include: { lesson: true } },
            assignment: { include: { lesson: true } },
        },
    });

    if (!existingResult) {
        return { success: false, error: "Note introuvable" };
    }

    const lesson =
        existingResult.exam?.lesson ||
        existingResult.assignment?.lesson;

    if (!lesson || lesson.teacherId !== userId) {
        return { success: false, error: "Accès refusé" };
    }

    await prisma.result.delete({
        where: { id },
    });

    return { success: true, error: null };
};

// Create attendance
export const createAttendance = async (
    _currentState: { success: boolean; error: string | null },
    data: AttendanceSchemaInput
) => {

    try {

        const { userId, sessionClaims } = await auth();
        const role = (sessionClaims?.metadata as { role?: string })?.role;

        if (!userId || !role) {
            return { success: false, error: "Non autorisé" };
        }

        if (!["teacher", "admin", "super_admin"].includes(role)) {
            return { success: false, error: "Rôle interdit" };
        }

        const sessionId = data.sessionId;

        const session = await prisma.session.findUnique({
            where: { id: sessionId },
            include: {
                lesson: {
                    include: { class: true }
                },
                attendances: true,
            }
        });

        if (!session) {
            return { success: false, error: "Séance introuvable" };
        }

        // 👨‍🏫 ownership teacher
        if (role === "teacher" && session.teacherId !== userId) {
            return { success: false, error: "Cette séance ne vous appartient pas" };
        }

        if (role === "admin") {
            // admin peut tout faire → pas de restriction
        }

        const student = await prisma.student.findUnique({
            where: { id: data.studentId }
        });

        if (!student) {
            return { success: false, error: "Élève introuvable" };
        }

        if (student.classId !== session.lesson.classId) {
            return { success: false, error: "Élève non inscrit dans cette classe" };
        }

        // 🔒 Parent → seulement ses enfants
        if (role === "parent" && student.parentId !== userId) {
            return { success: false, error: "Accès interdit" };
        }

        if (role === "parent") {
            if (data.status !== "ABSENT") {
                return {
                    success: false,
                    error: "Un parent peut uniquement signaler une absence.",
                };
            }

            if (!data.comment && !data.proofUrl) {
                return {
                    success: false,
                    error: "Une justification est obligatoire.",
                };
            }
        }

        if (data.proofUrl && !data.proofUrl.includes("res.cloudinary.com")) {
            return {
                success: false,
                error: "Fichier invalide",
            };
        }

        await prisma.attendance.upsert({
            where: {
                studentId_sessionId: {
                    studentId: data.studentId,
                    sessionId: data.sessionId
                }
            },

            update: {
                status: data.status,
                comment: data.comment ?? null,
                proofUrl: data.proofUrl ?? null,
                updatedAt: new Date()
            },

            create: {
                studentId: data.studentId,
                sessionId: data.sessionId,
                status: data.status,
                comment: data.comment ?? null,
                proofUrl: data.proofUrl ?? null,
                createdBy:
                    role === "parent"
                        ? "PARENT"
                        : role === "teacher"
                            ? "TEACHER"
                            : "ADMIN",

            }
        });

        return { success: true, error: null };

    } catch (error) {

        console.log("saveSessionAttendances error", error);

        return {
            success: false,
            error: "Erreur serveur"
        };

    }

};

export const updateAttendance = async (
    currentState: currentState,
    data: AttendanceSchemaInput
): Promise<currentState> => {

    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (!userId || !role || !data.id) {
        return { success: false, error: "Non autorisé." };
    }

    try {

        const attendance = await prisma.attendance.findUnique({
            where: { id: data.id },
            include: {
                session: {
                    include: {
                        lesson: {
                            select: {
                                teacherId: true,
                                classId: true
                            }
                        }
                    }
                },
                student: true
            }
        });

        if (!attendance) {
            return {
                success: false,
                error: "Présence introuvable."
            };
        }

        if (attendance.isDeleted) {
            return {
                success: false,
                error: "Cette absence est supprimée."
            };
        }

        /** 🚫 Parent ne peut pas modifier */
        if (role === "parent") {
            return {
                success: false,
                error: "Un parent ne peut pas modifier une présence."
            };
        }

        /** 🔐 Enseignant → seulement ses séances */
        if (
            role === "teacher" &&
            attendance.session?.lesson.teacherId !== userId
        ) {
            return {
                success: false,
                error: "Accès refusé."
            };
        }

        const newStatus = data.status ?? attendance.status;

        /** justification obligatoire pour absence */
        if (
            newStatus === "ABSENT" &&
            !data.comment &&
            !data.proofUrl
        ) {
            return {
                success: false,
                error: "Justification obligatoire pour une absence."
            };
        }

        /** validation fichier */
        if (
            data.proofUrl &&
            !data.proofUrl.includes("res.cloudinary.com")
        ) {
            return {
                success: false,
                error: "Fichier invalide"
            };
        }

        await prisma.attendance.update({
            where: { id: data.id },
            data: {
                status: newStatus,
                comment: data.comment ?? null,
                proofUrl: data.proofUrl ?? null,
                updatedAt: new Date()
            }
        });

        return { success: true, error: null };

    } catch (error) {

        console.log("updateAttendance error", error);

        return {
            success: false,
            error: "Erreur serveur."
        };

    }
};


export const deleteAttendance = async (
    currentState: currentState,
    data: FormData
) => {
    const id = Number(data.get("id"));

    if (!id) {
        return { success: false, error: "ID invalide" };
    }

    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    try {
        // 1️⃣ Fetch attendance with session → lesson → teacher
        const attendance = await prisma.attendance.findUnique({
            where: { id },
            include: {
                session: {
                    include: {
                        lesson: {
                            select: { teacherId: true },
                        },
                    },
                },
            },
        });

        if (!attendance) {
            return { success: false, error: "Absence introuvable" };
        }

        // 2️⃣ Permission check
        if (
            role === "teacher" &&
            attendance.session?.lesson.teacherId !== userId
        ) {
            return {
                success: false,
                error: "Vous n'avez pas le droit de supprimer cette absence",
            };
        }

        // 3️⃣ Restriction parent / student
        if (role === "parent" || role === "student") {
            return {
                success: false,
                error: "Action non autorisée",
            };
        }

        // 4️⃣ Soft delete
        await prisma.attendance.update({
            where: { id },
            data: {
                isDeleted: true,
                deletedAt: new Date(),
            },
        });

        return { success: true, error: null };
    } catch (error) {
        return {
            success: false,
            error: "Erreur serveur lors de la suppression",
        };
    }
};

// Fetch parent students
export const getParentStudents = async () => {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (!userId || role !== "parent") {
        return { success: false, error: "Accès refusé" };
    }

    return prisma.student.findMany({
        where: {
            parentId: userId,
        },
        include: {
            class: true,
            grade: true,
        },
    });
};

// Fetch Student Attendances For Parent
export const getStudentAttendancesForParent = async (studentId: string) => {

    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (!userId || role !== "parent") {
        return {
            success: false,
            error: "Accès refusé",
            data: [],
        };
    }

    const attendances = await prisma.attendance.findMany({
        where: {
            studentId,
            isDeleted: false,
            student: {
                parentId: userId,
            },
        },

        orderBy: {
            session: {
                date: "desc",
            },
        },

        include: {
            session: {
                select: {
                    date: true,
                    startTime: true,
                    lesson: {
                        select: {
                            name: true,
                        },
                    },
                    class: {
                        select: {
                            name: true,
                        },
                    },
                },
            },
        },
    });

    return {
        success: true,
        data: attendances,
        error: null,
    };
};

// Fetch Student Assignments For Parent
export const getStudentAssignmentsForParent = async (studentId: string) => {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (!userId || role !== "parent") {
        return {
            success: false,
            error: "Accès refusé",
            data: [],
        };
    }

    const assignments = await prisma.assignment.findMany({
        where: {
            lesson: {
                class: {
                    students: {
                        some: {
                            id: studentId,
                            parentId: userId,
                        },
                    },
                },
            },
        },
        orderBy: {
            dueDate: "asc",
        },
        include: {
            lesson: {
                select: { name: true },
            },
        },
    });

    return {
        success: true,
        data: assignments,
        error: null,
    };
};

// Fetch Student Exams For Parent
export const getExams = async (studentId?: string) => {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    if (role !== "parent") {
        throw new Error("Accès non autorisé");
    }

    return prisma.exam.findMany({
        where: {
            lesson: {
                class: {
                    students: {
                        some: {
                            ...(studentId ? { id: studentId } : {}),
                            parentId: userId!,
                        },
                    },
                },
            },
        },
        // orderBy: {
        //     startTime: "asc",
        // },
        include: {
            lesson: {
                select: {
                    name: true,
                },
            },
        },
    });
};

// Create Announcement Action
export const createAnnouncement = async (
    currentState: currentState,
    data: AnnouncementSchemaInput
) => {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    try {
        if (!userId || role !== "admin") {
            return {
                success: false,
                error: "Vous n'êtes pas autorisé à créer une annonce.",
            };
        }

        await prisma.announcement.create({
            data: {
                title: data.title,
                date: data.date,
                description: data.description ?? null,
                ...(data.classId !== undefined && { classId: data.classId }),
            },
        });

        return { success: true, error: null };
    } catch (error) {
        // console.error("Create Announcement Error ❌", error);
        return {
            success: false,
            error: "Une erreur est survenue lors de la création de l'annonce.",
        };
    }
};

// Update Announcement Action
export const updateAnnouncement = async (
    currentState: currentState,
    data: AnnouncementSchemaInput
) => {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    try {
        if (!userId || role !== "admin") {
            return {
                success: false,
                error: "Vous n'êtes pas autorisé à modifier une annonce.",
            };
        }

        if (!data.id) {
            return {
                success: false,
                error: "ID de l'annonce manquant.",
            };
        }

        await prisma.announcement.update({
            where: { id: data.id },
            data: {
                title: data.title,
                date: data.date,
                description: data.description ?? null,
                ...(data.classId !== undefined && { classId: data.classId }),
            },
        });

        return { success: true, error: null };
    } catch (error) {
        // console.error("Update Announcement Error ❌", error);
        return {
            success: false,
            error: "Une erreur est survenue lors de la mise à jour de l'annonce.",
        };
    }
};

// Delete Announcement Action
export const deleteAnnouncement = async (
    currentState: currentState,
    data: FormData
) => {
    const id = Number(data.get("id"));

    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    try {
        if (!userId || role !== "admin") {
            return {
                success: false,
                error: "Vous n'êtes pas autorisé à supprimer une annonce.",
            };
        }

        if (!id || isNaN(id)) {
            return {
                success: false,
                error: "ID invalide.",
            };
        }

        await prisma.announcement.delete({
            where: { id },
        });

        return { success: true, error: null };
    } catch (error) {
        // console.error("Delete Announcement Error ❌", error);
        return {
            success: false,
            error: "Une erreur est survenue lors de la suppression de l'annonce.",
        };
    }
};

// Create Event Action
export const createEvent = async (
    currentState: currentState,
    data: EventSchemaInput
) => {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    try {
        if (!userId || role !== "admin") {
            return {
                success: false,
                error: "Vous n'êtes pas autorisé à créer un événement.",
            };
        }

        await prisma.event.create({
            data: {
                title: data.title,
                startTime: data.startTime,
                endTime: data.endTime,
                description: data.description,
                ...(data.classId !== undefined && { classId: data.classId }),
            },
        });

        return { success: true, error: null };
    } catch (error) {
        // console.error("Create Event Error ❌", error);
        return {
            success: false,
            error: "Une erreur est survenue lors de la création de l'annonce.",
        };
    }
};

// Update Event Action
export const updateEvent = async (
    currentState: currentState,
    data: EventSchemaInput
) => {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    try {
        if (!userId || role !== "admin") {
            return {
                success: false,
                error: "Vous n'êtes pas autorisé à modifier une annonce.",
            };
        }

        if (!data.id) {
            return {
                success: false,
                error: "ID de l'événement manquant.",
            };
        }

        await prisma.event.update({
            where: { id: data.id },
            data: {
                title: data.title,
                startTime: data.startTime,
                endTime: data.endTime,
                description: data.description,
                ...(data.classId !== undefined && { classId: data.classId }),
            },
        });

        return { success: true, error: null };
    } catch (error) {
        // console.error("Update Event Error ❌", error);
        return {
            success: false,
            error: "Une erreur est survenue lors de la mise à jour de l'annonce.",
        };
    }
};

// Delete Event Action
export const deleteEvent = async (
    currentState: currentState,
    data: FormData
) => {
    const id = Number(data.get("id"));

    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;

    try {
        if (!userId || role !== "admin") {
            return {
                success: false,
                error: "Vous n'êtes pas autorisé à supprimer une annonce.",
            };
        }

        if (!id || isNaN(id)) {
            return {
                success: false,
                error: "ID invalide.",
            };
        }

        await prisma.event.delete({
            where: { id },
        });

        return { success: true, error: null };
    } catch (error) {
        // console.error("Delete Event Error ❌", error);
        return {
            success: false,
            error: "Une erreur est survenue lors de la suppression de l'annonce.",
        };
    }
};
