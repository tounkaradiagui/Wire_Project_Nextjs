import FormModal from "./FormModal";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";


export type FormContainerProps = {
  table:
  | "teacher"
  | "student"
  | "parent"
  | "subject"
  | "class"
  | "lesson"
  | "exam"
  | "assignment"
  | "result"
  | "attendance"
  | "event"
  | "user"
  | "session"
  | "announcement";
  type: "create" | "update" | "delete";
  data?: Record<string, unknown>;
  id?: number | string;
  role?: "admin" | "teacher" | "parent" | "student" | "super_admin";
};

const FormContainer = async ({ table, type, data, id, role }: FormContainerProps) => {
  let relatedData = {};


  // Fetch related data based on the table type
  if (type !== "delete") {
    switch (table) {
      case "subject": {
        const subjectTeachers =
          await prisma.teacher.findMany({
            select: {
              id: true,
              name: true,
              surname: true,
            },
          });
        relatedData = {
          teachers: subjectTeachers
        };
        break;
      }

      case "class": {
        const classGrades = await prisma.grade.findMany({
          select: {
            id: true,
            level: true,
          },
        });
        const classTeachers = await prisma.teacher.findMany({
          select: {
            id: true,
            name: true,
            surname: true,
          },
        });
        relatedData = { teachers: classTeachers, grades: classGrades };
        break;
      }

      case "teacher": {
        const teacherSubjects = await prisma.subject.findMany({
          select: {
            id: true,
            name: true,
          },
        });

        const teacherClasses = await prisma.class.findMany({
          select: {
            id: true,
            name: true,
          },
          orderBy: {
            name: "asc",
          },
        });

        relatedData = {
          subjects: teacherSubjects,
          classes: teacherClasses,
        };

        break;
      }


      case "student": {
        const studentGrades = await prisma.grade.findMany({
          select: {
            id: true,
            level: true,
          },
        });

        const studentClasses = await prisma.class.findMany({
          include: { _count: { select: { students: true } } }
        });
        relatedData = { classes: studentClasses, grades: studentGrades };
        break;
      }

      case "parent": {
        const studentParentGrades = await prisma.grade.findMany({
          select: {
            id: true,
            level: true,
          },
        });

        const studentparentClasses = await prisma.class.findMany({
          include: { _count: { select: { students: true } } }
        });
        relatedData = { classes: studentParentGrades, grades: studentparentClasses };
        break;
      }

      case "exam": {
        const { userId, sessionClaims } = await auth();
        const role = (sessionClaims?.metadata as { role?: string })?.role;

        const examLessons = await prisma.lesson.findMany({
          where: {
            ...(role === "teacher" ? { teacherId: userId! } : {}),
          },
          select: {
            id: true,
            name: true,
          }
        });

        relatedData = { lessons: examLessons };
        break;
      }

      case "assignment": {
        const assignmentLessons = await prisma.lesson.findMany({
          select: {
            id: true,
            name: true,
          },
        });
        relatedData = { lessons: assignmentLessons };
        break;
      }

      case "announcement": {
        const announcements = await prisma.announcement.findMany({
          include: {
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        const classes = await prisma.class.findMany({
          select: {
            id: true,
            name: true,
          },
          orderBy: {
            name: "asc",
          },
        });
        relatedData = {
          announcements,
          classes,
        };
        break;
      }

      case "event": {
        const events = await prisma.event.findMany({
          include: {
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        const eventClasses = await prisma.class.findMany({
          select: {
            id: true,
            name: true,
          },
          orderBy: {
            name: "asc",
          },
        });
        relatedData = {
          events,
          eventClasses,
        };
        break;
      }

      case "lesson": {
        const { userId, sessionClaims } = await auth();
        const role = (sessionClaims?.metadata as { role?: string })?.role;

        const lessonSubjects = await prisma.subject.findMany({
          select: {
            id: true,
            name: true,
          },
        });

        const lessonClasses =
          role === "teacher"
            ? await prisma.class.findMany({
              where: {
                teacherClasses: {
                  some: {
                    teacherId: userId!,
                  },
                },
              },
              select: {
                id: true,
                name: true,
              },
            })
            : await prisma.class.findMany({
              select: {
                id: true,
                name: true,
              },
            });


        // Si admin → voir tous les enseignants
        // Si teacher → lui-même uniquement
        const lessonTeachers =
          role === "teacher"
            ? await prisma.teacher.findMany({
              where: { id: userId! },
              select: {
                id: true,
                name: true,
                surname: true,
              },
            })
            : await prisma.teacher.findMany({
              select: {
                id: true,
                name: true,
                surname: true,
              },
            });

        relatedData = {
          subjects: lessonSubjects,
          classes: lessonClasses,
          teachers: lessonTeachers,
        };
        break;
      }

      case "result": {
        const { userId, sessionClaims } = await auth();
        const role = (sessionClaims?.metadata as { role?: string })?.role;

        // Élèves
        const students = await prisma.student.findMany({
          select: {
            id: true,
            name: true,
            surname: true,
          },
        });

        // Exams (filtrés si teacher)
        const exams = await prisma.exam.findMany({
          where: {
            ...(role === "teacher"
              ? {
                lesson: {
                  teacherId: userId!,
                },
              }
              : {}),
          },
          select: {
            id: true,
            title: true,
          },
        });

        // Assignments (filtrés si teacher)
        const assignments = await prisma.assignment.findMany({
          where: {
            ...(role === "teacher"
              ? {
                lesson: {
                  teacherId: userId!,
                },
              }
              : {}),
          },
          select: {
            id: true,
            title: true,
          },
        });

        relatedData = {
          students,
          exams,
          assignments,
        };
        break;
      }

      case "session": {
        const { userId, sessionClaims } = await auth();
        const role = (sessionClaims?.metadata as { role?: string })?.role;

        // Sécurité : seuls admin et teacher peuvent créer des sessions
        if (role !== "admin" && role !== "teacher") {
          throw new Error("Unauthorized");
        }

        /**
         * LESSONS DISPONIBLES
         * - admin → toutes
         * - teacher → seulement les siennes
         */
        const lessons = await prisma.lesson.findMany({
          where: {
            ...(role === "teacher"
              ? { teacherId: userId! }
              : {}),
          },
          select: {
            id: true,
            name: true,
          },
        });

        relatedData = { lessons };

        break;
      }

      case "attendance": {
        const { userId, sessionClaims } = await auth();
        const role = (sessionClaims?.metadata as { role?: string })?.role;

        /**
         * LESSONS
         */
        const lessons = await prisma.lesson.findMany({
          where: {
            ...(role === "teacher"
              ? { teacherId: userId! }
              : role === "student"
                ? {
                  class: {
                    students: {
                      some: { id: userId! },
                    },
                  },
                }
                : role === "parent"
                  ? {
                    class: {
                      students: {
                        some: { parentId: userId! },
                      },
                    },
                  }
                  : {}),
          },
          select: {
            id: true,
            name: true,
          },
        });

        /**
         * SESSIONS (IMPORTANT 🔥)
         * On ne prend que les sessions non supprimées
         */
        const sessions = await prisma.session.findMany({
          where: {
            isDeleted: false,
            ...(role === "teacher"
              ? {
                lesson: {
                  teacherId: userId!,
                },
              }
              : {}),
          },
          select: {
            id: true,
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
          orderBy: [
            { date: "desc" },
            { startTime: "asc" },
          ],
        });

        /**
         * STUDENTS
         */
        const students = await prisma.student.findMany({
          where: {
            ...(role === "teacher"
              ? {
                class: {
                  lessons: {
                    some: { teacherId: userId! },
                  },
                },
              }
              : role === "parent"
                ? { parentId: userId! }
                : {}),
          },
          select: {
            id: true,
            name: true,
            surname: true,
          },
        });

        /**
         * ENUMS
         */
        const statuses = [
          { label: "Présent", value: "PRESENT" },
          { label: "Absent", value: "ABSENT" },
          { label: "Retard", value: "LATE" },
        ];

        const actors = [
          { label: "Enseignant", value: "TEACHER" },
          { label: "Parent", value: "PARENT" },
        ];

        relatedData = {
          students,
          lessons,
          sessions,
          statuses,
          actors,
        };

        break;
      }

      default:
        break;
    }
  }

  return (
    <div>
      {/* Form implementation goes here */}
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData}
        role={role}
      />
    </div>
  );
};

export default FormContainer;
