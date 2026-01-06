"use server";
import {ClassSchemaInput, SubjectSchemaInput, TeacherSchemaInput, StudentSchemaInput} from "./formValidationSchemas";
import prisma from '@/lib/prisma';
import { createClerkClient  } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";


type currentState = {success:boolean; error:boolean};

// Create Subject Action
export const createSubject = async (currentState: currentState, data: SubjectSchemaInput) => {
    try {
        await prisma.subject.create({
            data: {
                name: data.name,
                teachers:{
                    connect:data.teachers.map((teacherId) => ({id: teacherId}))
                }
            }
        });
        return {success:true, error: false}
        
    } catch (error) {
        console.log(error)
        return {success:false, error: true};
    }
};

export const updateSubject = async (currentState: currentState, data: SubjectSchemaInput) => {
    try {
        await prisma.subject.update({
            where: {
                id: data.id
            },
            
            data: {
                name: data.name,
                teachers:{
                    set: data.teachers.map((teacherId) => ({id: teacherId}))
                }
            }
        });
        return {success:true, error: false}
        
    } catch (error) {
        console.log(error)
        return {success:false, error: true};
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
        return {success:true, error: false}
        
    } catch (error) {
        console.log(error)
        return {success:false, error: true};
    }
}

// Create class Action schema
export const createClass = async (currentState: currentState, data: ClassSchemaInput) => {
    try {
        await prisma.class.create({
            data
        });
        return {success:true, error: false}
        
    } catch (error) {
        console.log(error)
        return {success:false, error: true};
    }
};

export const updateClass = async (currentState: currentState, data: ClassSchemaInput) => {
    try {
        await prisma.class.update({
            where: {
                id: data.id
            },
            
            data
        });
        return {success:true, error: false}
        
    } catch (error) {
        console.log(error)
        return {success:false, error: true};
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
        return {success:true, error: false}
        
    } catch (error) {
        return {success:false, error: true};
    }
}

// Create teacher Action schema
export const createTeacher = async (currentState: { success: boolean; error: boolean }, data: TeacherSchemaInput) => {
    try {
        let userId: string | null = null;

        // CLERK CLIENT
        const clerk = createClerkClient({
            secretKey: process.env.CLERK_SECRET_KEY!,
        });

        const user = await clerk.users.createUser({
            username: data.username,
            password: data.password,
            firstName: data.name,
            lastName: data.surname,
            publicMetadata: { role: "teacher" },
        });

        // Clerk user Id
        userId = user.id;

        const subjectIds = await prisma.subject.findMany({
            where: { name: { in: data.subjects } },
            select: { id: true },
        });

        await prisma.teacher.create({
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
            subjects: {
                connect: subjectIds.map(s => ({ id: s.id })),
            },
            
        },
        });

        return { success: true, error: false };

    } catch (error) {

        if (userId) {
            await clerk.users.deleteUser(userId);
        };

        return { success: false, error: true };
    }
};

export const updateTeacher = async (currentState: currentState, data: TeacherSchemaInput) => {
    try {
        // CLERK CLIENT
    const clerk = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY!,
    });

    if(!data.id) {
        return {success:false, error:true};
    }
    const user = await clerk.users.updateUser(data.id, {
        username: data.username,
        ...(data.password !== "" && {password: data.password}),
        firstName: data.name,
        lastName: data.surname,
        publicMetadata: { role: "teacher" },
    });

    const subjectIds = await prisma.subject.findMany({
        where: { name: { in: data.subjects } },
        select: { id: true },
    });

    await prisma.teacher.update({
        where:{id: data.id},
      data: {
        ...(data.password !== "" && {password: data.password}),
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
        subjects: {
            set: subjectIds.map(s => ({ id: s.id })),
        },
        
      },
    });

    console.log("Teacher data: ", data);

        return {success:true, error: false}
        
    } catch (error) {
        console.log(error)
        return {success:false, error: true};
    }
};

export const deleteTeacher = async (currentState: currentState, data: FormData) => {
    const id = data.get("id") as string;
    try {
         const clerk = createClerkClient({
            secretKey: process.env.CLERK_SECRET_KEY!,
        });

        await clerk.users.deleteUser(id);

        await prisma.teacher.delete({
            where: {
                id: id
            }
        });
        return {success:true, error: false}
        
    } catch (error) {
        return {success:false, error: true};
    }
}


export const createStudent = async (
    currentState: { success: boolean; error: boolean },
    data: StudentSchemaInput
    ) => {
    try {
        let userId: string | null = null;

        const { parentId, classId, gradeId } = data;

        // Validation
        if (!parentId) throw new Error("Parent is required");
        if (!classId) throw new Error("Class is required");
        if (!gradeId) throw new Error("Grade is required");

        console.log("FORM DATA OK:", { parentId, classId, gradeId });

        // Vérifiez la capacité de classe pour pouvoir ajouter un élève
        const classsItem = await prisma.class.findUnique({
            where: {id: data.classId},
            include:{
                _count:{select:{students:true}}
            }
        });

        if(classsItem && classsItem.capacity === classsItem._count.students) {
            return {success: false, error:true}
        }

        // Create Clerk user
        const clerk = createClerkClient({
            secretKey: process.env.CLERK_SECRET_KEY!,
        });

        const user = await clerk.users.createUser({
            username: data.username,
            password: data.password,
            firstName: data.name,
            lastName: data.surname,
            publicMetadata: { role: "student" },
        });

        // Clerk user Id
        userId = user.id;

        // Create student
        await prisma.student.create({
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
            parent: { connect: { id: parentId } },
            class: { connect: { id: classId } },
            grade: { connect: { id: gradeId } },
        },
        });

        return { success: true, error: false };
    } catch (error) {
        // delete user from clerk
       if (userId) {
            await clerk.users.deleteUser(userId);
        };
        // console.error("Create Student errror ❌", error);
        return { success: false, error: true };
    }
};


export const updateStudent = async (
    currentState: { success: boolean; error: boolean },
    data: StudentSchemaInput
    ) => {
  try {
    const { parentId, classId, gradeId } = data;

    if (!data.id) throw new Error("Student ID is required");
    if (!parentId) throw new Error("Parent is required");
    if (!classId) throw new Error("Class is required");
    if (!gradeId) throw new Error("Grade is required");

    // Fetch existing student
    const existingStudent = await prisma.student.findUnique({
      where: { id: data.id },
      select: { classId: true },
    });

    // Check class capacity ONLY if class changes
    const classItem = await prisma.class.findUnique({
      where: { id: classId },
      include: { _count: { select: { students: true } } },
    });

    if (
      existingStudent?.classId !== classId &&
      classItem &&
      classItem.capacity === classItem._count.students
    ) {
      throw new Error("Class is full");
    }

    // Clerk update
    const clerk = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY!,
    });

    await clerk.users.updateUser(data.id, {
      username: data.username,
      ...(data.password && { password: data.password }),
      firstName: data.name,
      lastName: data.surname,
    });

    // Prisma update
    await prisma.student.update({
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

    return { success: true, error: false };
  } catch (error) {
    console.error("Update Student error ❌", error);
    return { success: false, error: true };
  }
};


export const deleteStudent = async (currentState: currentState, data: FormData) => {
    const id = data.get("id") as string;
    try {
        const clerk = createClerkClient({
            secretKey: process.env.CLERK_SECRET_KEY!,
        });

        await clerk.users.deleteUser(id);

        await prisma.student.delete({
            where: {
                id: id
            }
        });
        return {success:true, error: false}
        
    } catch (error) {
        return {success:false, error: true};
    }
}

// Create Exam Action
export const createExam = async (currentState: currentState, data: ExamSchemaInput) => {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    
    try {
        if(role === "teacher") {
            const teacherLesson = await prisma.lesson.findFirst({
                where:{
                    teacherId:userId!,
                    id:data.lessonId
                }
            })

            if(!teacherLesson) {
                return {success:false, error:true};
            }
        }

        await prisma.exam.create({
            data: {
                title: data.title,
                startTime: data.startTime,
                endTime: data.endTime,
                lessonId: data.lessonId
                // lessons:{
                //     connect:data.lessons.map((teacherId) => ({id: teacherId}))
                // }
            }
        });
        return {success:true, error: false}
        
    } catch (error) {
        console.log(error)
        return {success:false, error: true};
    }
};

export const updateExam = async (currentState: currentState, data: ExamSchemaInput) => {
    const { userId, sessionClaims } = await auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    
    try {
        if(role === "teacher") {
            const teacherLesson = await prisma.lesson.findFirst({
                where:{
                    teacherId:userId!,
                    id:data.lessonId
                }
            })

            if(!teacherLesson) {
                return {success:false, error:true};
            }
       }

        await prisma.exam.update({
            where:{
                id: data.id,
            },
            data: {
                title: data.title,
                startTime: data.startTime,
                endTime: data.endTime,
                lessonId: data.lessonId
            }
        });
        return {success:true, error: false}
        
    } catch (error) {
        console.log(error)
        return {success:false, error: true};
    }
};

export const deleteExam = async (currentState: currentState, data: FormData) => {
    const id = data.get("id") as string;

    // const { userId, sessionClaims } = await auth();
    // const role = (sessionClaims?.metadata as { role?: string })?.role;

    try {
        await prisma.exam.delete({
            where: {
                id: parseInt(id),
                // ...(role === "teacher" ? {teacherId: userId!} : {}),
            },
            select:{
                id:true,
                title:true,
            }
        });
        return {success:true, error: false}
        
    } catch (error) {
        console.log(error)
        return {success:false, error: true};
    }
}