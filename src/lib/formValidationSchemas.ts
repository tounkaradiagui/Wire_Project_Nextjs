import { z } from "zod";

// Le schema
export const userSchema = z.object({
  id: z.string().optional(),
  firstName: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères.")
    .max(50, "Le prénom est trop long.")
    .trim(),

  lastName: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères.")
    .max(50, "Le nom est trop long.")
    .trim(),

  username: z
    .string()
    .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères.")
    .max(30, "Le nom d'utilisateur est trop long.")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username invalide"),

  email: z
    .string()
    .email({ message: "Adresse email invalide" })
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),

  password: z
    .string()
    .min(4, "Le mot de passe doit contenir au moins 4 caractères.")
    .max(100)
    .regex(/[A-Z]/, "Doit contenir au moins une majuscule.")
    .regex(/[a-z]/, "Doit contenir au moins une minuscule.")
    .regex(/[0-9]/, "Doit contenir au moins un chiffre.")
    .regex(/[^A-Za-z0-9]/, "Doit contenir au moins un caractère spécial."),

  role: z.enum(["ADMIN", "TEACHER", "PARENT", "STUDENT"],
    {
      message: "Le role est requis !",
    }),

  image: z.string().optional(),
});

export type UserSchemaInput = z.infer<typeof userSchema>;

// 
export const subjectSchema = z.object({
  id: z.coerce.number().optional(),
  code: z.string().optional(),
  coefficient: z.coerce
    .number()
    .min(0, "Le coefficient doit être positif")
    .optional(),
  name: z
    .string()
    .min(1, {
      message: "Le nom de la matière est réquis.",
    }),
  teachers: z.array(z.string()), // Array of teacher IDs as strings
});

export type SubjectSchemaInput = z.infer<typeof subjectSchema>;
// End Subject Schema

// Teacher Schema
export const teacherSchema = z.object({
  id: z.string().optional(),

  username: z
    .string()
    .min(3, {
      message: "Le nom d'utilisateur doit contenir au moins 3 caractères.",
    })
    .max(20, {
      message: "Le nom d'utilisateur ne doit pas dépasser 20 caractères.",
    }),

  email: z
    .string()
    .email({ message: "Adresse email invalide" })
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),

  password: z
    .string()
    .min(4, {
      message: "Le mot de passe doit contenir au moins 4 caractères.",
    })
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),

  name: z.string().min(1, { message: "Le prénom est obligatoire" }),

  surname: z.string().min(1, { message: "Le nom est obligatoire" }),

  phone: z.string().optional(),

  address: z.string().min(1, { message: "L'adresse est obligatoire" }),

  image: z.string().optional(),

  birthday: z.coerce.date().optional(),

  sex: z.enum(["MALE", "FEMALE"], {
    message: "Le genre est requis !",
  }),

  bloodType: z.string().min(1, {
    message: "Le type sanguin est requis !",
  }),

  subjects: z.array(z.string()).optional(),

  classes: z
    .array(z.coerce.number())
    .min(1, { message: "Au moins une classe doit être assignée." }),
});

export type TeacherSchemaInput = z.infer<typeof teacherSchema>;
// End Teacher Schema

// Class Schema
export const classSchema = z.object({
  id: z.coerce.number().optional(),
  name: z
    .string()
    .min(1, {
      message: "Le nom de la classe est réquis.",
    }),
  capacity: z.coerce.number().min(1, {
    message: "La capacité doit être au moins de 1."
  }),
  gradeId: z.coerce.number().min(1, {
    message: "Le niveau est réquis."
  }),
});

export type ClassSchemaInput = z.infer<typeof classSchema>;
// End Class Schema


// Exam Schema
export const examSchema = z.object({
  id: z.coerce.number().optional(),
  title: z
    .string()
    .min(1, {
      message: "Le titre est réquis.",
    }),
  startTime: z.coerce.date({ message: "La date et l'heure de départ sont réquis !" }),
  endTime: z.coerce.date({ message: "La date et l'heure de fin sont réquis !" }),
  lessonId: z.coerce.number({ message: "Veuillez affecter une lesson !" })
});

export type ExamSchemaInput = z.infer<typeof examSchema>;
// End Exam Schema

// Student Schema
export const studentSchema = z.object({
  id: z.coerce.string().optional(),
  username: z
    .string()
    .min(3, {
      message: "Le nom d'utilisateur doit contenir au moins 3 caractères.",
    })
    .max(20, {
      message: "Le nom d'utilisateur ne doit pas dépasser 20 caractères.",
    }),
  email: z.string().email({ message: "Adresse email invalide" }).optional().or(z.literal("")),
  password: z
    .string()
    .min(4, { message: "Le mot de passe doit contenir au moins 4 caractères." })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "Le prénom est obligatoire" }),
  surname: z.string().min(1, { message: "Le nom est obligatoire" }),
  phone: z.string().optional(),
  address: z.string(),
  image: z.string().optional(),
  birthday: z.coerce.date().optional(),
  sex: z.enum(["MALE", "FEMALE"], { message: "Le genre est réquis !" }),
  bloodType: z.string().min(1, { message: "Le type saguin est réquis !" }),
  gradeId: z.coerce.number().min(1, { message: "le niveau est réquis" }),
  classId: z.coerce.number().min(1, { message: "la classe est obligatoire" }),
  parentId: z.coerce.string().min(1, { message: "Veuillez affecter un parent à cet élève" }),
});

export type StudentSchemaInput = z.infer<typeof studentSchema>;
// End Student Schema

// Parent Schema  
export const parentSchema = z.object({
  id: z.coerce.string().optional(),
  username: z
    .string()
    .min(3, {
      message: "Le nom d'utilisateur doit contenir au moins 3 caractères.",
    })
    .max(20, {
      message: "Le nom d'utilisateur ne doit pas dépasser 20 caractères.",
    }),
  email: z.string().email({ message: "Adresse email invalide" }).optional().or(z.literal("")),
  password: z
    .string()
    .min(4, { message: "Le mot de passe doit contenir au moins 4 caractères." })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "Le prénom est obligatoire" }),
  surname: z.string().min(1, { message: "Le nom est obligatoire" }),
  phone: z.string().min(1, { message: "Le numéro de téléphone est obligatoire" }),
  address: z.string(),
  image: z.string().optional(),
  birthday: z.coerce.date().optional(),
  sex: z.enum(["MALE", "FEMALE"], { message: "Le genre est réquis !" }),
});

export type ParentSchemaInput = z.infer<typeof parentSchema>;
// End Parent Schema  

// Lesson Schema
export const lessonSchema = z
  .object({
    id: z.coerce.number().optional(),

    name: z.string().min(1, {
      message: "Le titre de la leçon est requis.",
    }),

    weekDay: z
      .number()
      .min(0)
      .max(6, {
        message: "Jour invalide (0 = dimanche, 6 = samedi)",
      }),

    startHour: z
      .number()
      .min(0)
      .max(23, {
        message: "Heure de début invalide",
      }),

    endHour: z
      .number()
      .min(0)
      .max(23, {
        message: "Heure de fin invalide",
      }),

    startDate: z.coerce.date({
      message: "La date de début est requise.",
    }),

    dueDate: z.coerce.date({
      message: "La date de fin est requise.",
    }),

    subjectId: z.coerce.number().min(1),
    classId: z.coerce.number().min(1),

    teacherId: z.string().min(1),
  })
  .refine((data) => data.startDate < data.dueDate, {
    message: "La date de fin doit être après la date de début.",
    path: ["dueDate"],
  })
  .refine((data) => data.endHour > data.startHour, {
    message: "L'heure de fin doit être après l'heure de début.",
    path: ["endHour"],
  });

export type LessonSchemaInput = z.infer<typeof lessonSchema>;
// End Lesson Schema

// Session Schema
export const sessionSchema = z.object({
  id: z.string().optional(),
  lessonId: z.coerce.number({ message: "Le cours est obligatoire" }),

  date: z.coerce
    .date({
      message: "La date est obligatoire",
    }),

  startTime: z.coerce
    .date({
      message: "L'heure de début est obligatoire",
    }),

  endTime: z.coerce
    .date({
      message: "L'heure de fin est obligatoire",
    }),

  room: z.string().optional(),
}).refine(
  (data) => data.endTime > data.startTime,
  {
    message: "L'heure de fin doit être après l'heure de début",
    path: ["endTime"],
  }
);

export type SessionSchemaInput = z.infer<typeof sessionSchema>;

// End Session Schema

// Assignment Schema
export const assignmentSchema = z.object({
  id: z.coerce.number().optional(),
  title: z
    .string()
    .min(1, {
      message: "Le titre est réquis.",
    }),

  startDate: z.preprocess(
    (value) => (value ? new Date(value as string) : undefined),
    z.date({ message: "La date de début est requise !" })
  ),

  dueDate: z.preprocess(
    (value) => (value ? new Date(value as string) : undefined),
    z.date({
      message: "La date de remise est requise !"
    })
  ),

  lessonId: z.coerce.number({ message: "Le cours est requis !" })
});

export type AssignmentSchemaInput = z.infer<typeof assignmentSchema>;
// End Assignment Schema

// Result Schema
export const resultSchema = z
  .object({
    id: z.coerce.number().optional(),

    score: z.coerce
      .number()
      .min(0, { message: "La note ne peut pas être négative" })
      .max(20, { message: "La note ne peut pas dépasser 20" }),

    examId: z.coerce.number().optional().nullable(),

    assignmentId: z.coerce.number().optional().nullable(),

    studentId: z.string().min(1, {
      message: "L'élève est requis.",
    }),

    termId: z.coerce.number({
      message: "Le trimestre est requis",
    }),

    appreciation: z.string().optional(),
  })
  .refine(
    (data) =>
      (data.examId && !data.assignmentId) ||
      (!data.examId && data.assignmentId),
    {
      message: "Veuillez choisir soit un examen soit un devoir",
      path: ["examId"],
    }
  );

export type ResultSchemaInput = z.infer<typeof resultSchema>;
// End Result Schema

// Announcement Schema 
export const announcementSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Le titre est requis" }),
  description: z.string().optional().nullable(),
  date: z.coerce.date({ message: "La date est requise" }),
  classId: z
    .string()
    .optional()
    .transform((value) => (value && value !== "" ? Number(value) : undefined)),
});

export type AnnouncementSchemaInput = z.infer<typeof announcementSchema>;
// End Announcement Schema

// Event Schema 
export const eventSchema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Le titre est requis" }),
  description: z.string().min(1, { message: "La description est requise" }),
  startTime: z.coerce.date({ message: "La date de début est requise" }),
  endTime: z.coerce.date({ message: "La date de fin est requise" }),
  classId: z
    .string()
    .optional()
    .transform((value) => (value && value !== "" ? Number(value) : undefined)),
});

export type EventSchemaInput = z.infer<typeof eventSchema>;
// End Event Schema

// Attendance Status Schema
export const AttendanceStatusEnum = z.enum([
  "PRESENT",
  "ABSENT",
  "LATE",
]);

// Attendance Actor Schema
export const AttendanceActorEnum = z.enum([
  "TEACHER",
  "PARENT",
]);

// Attendance Schema
export const attendanceSchema = z
  .object({
    id: z.coerce.number().optional(),

    studentId: z.string().min(1, {
      message: "L'élève est requis.",
    }),

    sessionId: z.coerce
      .string()
      .min(1, { message: "La séance est requise." }),

    status: AttendanceStatusEnum,

    comment: z
      .string()
      .max(500, "Le commentaire est trop long.")
      .optional()
      .nullable(),

    proofUrl: z
      .string()
      .url("Le lien du justificatif est invalide.")
      .optional()
      .nullable(),

    createdBy: AttendanceActorEnum.optional(),
  })
  .superRefine((data, ctx) => {
    // 🔴 ABSENCE → justification obligatoire
    if (data.status === "ABSENT") {
      if (!data.comment && !data.proofUrl) {
        ctx.addIssue({
          code: "custom",
          path: ["comment"],
          message:
            "Une justification (commentaire ou justificatif) est obligatoire pour une absence.",
        });
      }
    }
  });


export type AttendanceSchemaInput = z.infer<typeof attendanceSchema>;
// End Attendance schma

/**
 * À fusionner avec votre fichier lib/formValidationsSchema.ts existant.
 * Ces schémas couvrent les nouveaux formulaires de la page d'accueil publique :
 * - candidature enseignant
 * - demande de création d'espace école
 * - demande de démo
 */

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;
const ACCEPTED_CV_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

const phoneRegex = /^[+]?[0-9\s().-]{8,20}$/;

/** Validation du fichier CV. Utilisé côté client (File) — côté serveur, on revalide la taille/type via FormData. */
export const cvFileSchema = z
  .instanceof(File, { message: "Le CV est requis." })
  .refine((file) => file.size > 0, "Le CV est requis.")
  .refine(
    (file) => file.size <= MAX_FILE_SIZE,
    `Le fichier ne doit pas dépasser ${MAX_FILE_SIZE_MB} Mo.`
  )
  .refine(
    (file) => ACCEPTED_CV_TYPES.includes(file.type),
    "Formats acceptés : PDF, JPG, PNG ou WEBP."
  );

export const teacherApplicationSchema = z.object({
  schoolId: z.string().min(1, "École invalide."),
  fullName: z
    .string()
    .trim()
    .min(3, "Le nom complet doit contenir au moins 3 caractères.")
    .max(120, "Le nom complet est trop long."),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, "Numéro de téléphone invalide."),
  email: z.string().trim().email("Adresse email invalide."),
  coverLetter: z
    .string()
    .trim()
    .min(50, "La lettre de motivation doit contenir au moins 50 caractères.")
    .max(3000, "La lettre de motivation est trop longue (3000 caractères max)."),
  cv: cvFileSchema,
});

export type TeacherApplicationInput = z.infer<typeof teacherApplicationSchema>;

/** Variante serveur : le CV est déjà uploadé, on ne reçoit que son URL/clé. */
export const teacherApplicationServerSchema = teacherApplicationSchema
  .omit({ cv: true })
  .extend({
    cvUrl: z.string().min(1, "Le CV est requis."),
    cvFileName: z.string().min(1),
  });

export type TeacherApplicationServerInput = z.infer<
  typeof teacherApplicationServerSchema
>;

export const schoolRegistrationRequestSchema = z.object({
  schoolName: z.string().trim().min(2, "Le nom de l'école est requis."),
  city: z.string().trim().min(2, "La ville est requise."),
  country: z.string().trim().min(2, "Le pays est requis."),
  contactName: z.string().trim().min(3, "Le nom du contact est requis."),
  email: z.string().trim().email("Adresse email invalide."),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, "Numéro de téléphone invalide.")
    .optional()
    .or(z.literal("")),
  studentsCount: z
    .coerce.number({ invalid_type_error: "Veuillez indiquer un nombre." })
    .int()
    .positive("Le nombre d'élèves doit être positif.")
    .optional(),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type SchoolRegistrationRequestInput = z.infer<
  typeof schoolRegistrationRequestSchema
>;

export const demoRequestSchema = z.object({
  fullName: z.string().trim().min(3, "Le nom complet est requis."),
  email: z.string().trim().email("Adresse email invalide."),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, "Numéro de téléphone invalide.")
    .optional()
    .or(z.literal("")),
  schoolName: z.string().trim().min(2, "Le nom de l'école est requis."),
  preferredDate: z.string().optional(),
});

export type DemoRequestInput = z.infer<typeof demoRequestSchema>;

export const schoolSearchSchema = z.object({
  query: z.string().trim().max(120).optional().default(""),
});
