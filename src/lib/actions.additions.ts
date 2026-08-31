"use server";

import { revalidatePath } from "next/cache";
import {
  teacherApplicationServerSchema,
  schoolRegistrationRequestSchema,
  demoRequestSchema,
  TeacherApplicationServerInput,
  SchoolRegistrationRequestInput,
  DemoRequestInput,
} from "@/lib/formValidationSchemas"; // Ensure this file exists in src/lib/ directory
import { ActionResult, PartnerSchool } from "@/lib/types";
import prisma from "@/lib/prisma"; 
// décommentez une fois le modèle Prisma ajouté (voir schema en bas du fichier)

/**
 * À fusionner avec votre fichier lib/actions.ts existant.
 *
 * Modèle Prisma attendu (à ajouter dans schema.prisma) :
 *
 * model TeacherApplication {
 *   id           String   @id @default(cuid())
 *   schoolId     String
 *   school       School   @relation(fields: [schoolId], references: [id])
 *   fullName     String
 *   email        String
 *   phone        String
 *   coverLetter  String   @db.Text
 *   cvUrl        String
 *   cvFileName   String
 *   status       ApplicationStatus @default(PENDING)
 *   createdAt    DateTime @default(now())
 *
 *   @@index([email])
 * }
 *
 * enum ApplicationStatus {
 *   PENDING
 *   REVIEWED
 *   ACCEPTED
 *   REJECTED
 * }
 *
 * model SchoolRegistrationRequest {
 *   id            String   @id @default(cuid())
 *   schoolName    String
 *   city          String
 *   country       String
 *   contactName   String
 *   email         String
 *   phone         String?
 *   studentsCount Int?
 *   message       String?  @db.Text
 *   status        RequestStatus @default(PENDING)
 *   createdAt     DateTime @default(now())
 * }
 *
 * enum RequestStatus {
 *   PENDING
 *   VALIDATED
 *   REJECTED
 * }
 */

const MAX_APPLICATIONS_PER_CANDIDATE = 2;

// ─────────────────────────────────────────────────────────────────────────
// CANDIDATURES ENSEIGNANT
// ─────────────────────────────────────────────────────────────────────────

/**
 * Upload du CV vers votre fournisseur de stockage (UploadThing, S3, Cloudinary...).
 * Remplacez le corps de cette fonction par votre intégration réelle.
 */
async function uploadCv(file: File): Promise<{ url: string; fileName: string }> {
  // Exemple générique — à adapter à votre provider de stockage.
  // const uploaded = await uploadThing.upload(file);
  // return { url: uploaded.url, fileName: file.name };

  const arrayBuffer = await file.arrayBuffer();
  const fileName = `${Date.now()}-${file.name}`;
  // Placeholder : à remplacer par un vrai upload distant.
  return { url: `/uploads/cv/${fileName}`, fileName: file.name };
}

/**
 * Vérifie combien de candidatures un candidat a déjà soumises (toutes écoles confondues),
 * et bloque l'envoi au-delà de MAX_APPLICATIONS_PER_CANDIDATE.
 */
export async function getApplicationCountByEmail(
  email: string
): Promise<number> {
  // return prisma.teacherApplication.count({ where: { email: email.toLowerCase() } });

  // --- Implémentation mock en attendant le branchement Prisma ---
  return mockApplications.filter(
    (a) => a.email.toLowerCase() === email.toLowerCase()
  ).length;
}

export async function submitTeacherApplication(
  formData: FormData
): Promise<ActionResult> {
  try {
    const raw = {
      schoolId: formData.get("schoolId") as string,
      fullName: formData.get("fullName") as string,
      phone: formData.get("phone") as string,
      email: formData.get("email") as string,
      coverLetter: formData.get("coverLetter") as string,
    };
    const cvFile = formData.get("cv") as File | null;

    if (!cvFile || cvFile.size === 0) {
      return {
        success: false,
        message: "Veuillez joindre votre CV.",
        fieldErrors: { cv: ["Le CV est requis."] },
      };
    }

    const ACCEPTED_TYPES = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ];
    if (!ACCEPTED_TYPES.includes(cvFile.type)) {
      return {
        success: false,
        message: "Format de CV invalide.",
        fieldErrors: { cv: ["Formats acceptés : PDF, JPG, PNG ou WEBP."] },
      };
    }
    if (cvFile.size > 5 * 1024 * 1024) {
      return {
        success: false,
        message: "Le fichier CV dépasse 5 Mo.",
        fieldErrors: { cv: ["Le fichier ne doit pas dépasser 5 Mo."] },
      };
    }

    // 1. Vérification de la limite AVANT toute écriture en base.
    const existingCount = await getApplicationCountByEmail(raw.email);
    if (existingCount >= MAX_APPLICATIONS_PER_CANDIDATE) {
      return {
        success: false,
        message:
          "Vous avez atteint la limite de 2 candidatures. Vous ne pouvez plus postuler avec cette adresse email.",
      };
    }

    // 2. Upload du CV.
    const { url: cvUrl, fileName: cvFileName } = await uploadCv(cvFile);

    // 3. Validation finale du payload serveur.
    const parsed = teacherApplicationServerSchema.safeParse({
      ...raw,
      cvUrl,
      cvFileName,
    });
    if (!parsed.success) {
      return {
        success: false,
        message: "Veuillez corriger les erreurs du formulaire.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    // 4. Re-vérification atomique recommandée en transaction Prisma pour éviter
    //    une double soumission concurrente (race condition) :
    //
    // const result = await prisma.$transaction(async (tx) => {
    //   const count = await tx.teacherApplication.count({
    //     where: { email: parsed.data.email.toLowerCase() },
    //   });
    //   if (count >= MAX_APPLICATIONS_PER_CANDIDATE) {
    //     throw new Error("LIMIT_REACHED");
    //   }
    //   return tx.teacherApplication.create({ data: { ...parsed.data, email: parsed.data.email.toLowerCase() } });
    // });

    mockApplications.push({
      id: `app-${Date.now()}`,
      ...parsed.data,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    });

    revalidatePath(`/ecoles/${raw.schoolId}`);

    const remaining = MAX_APPLICATIONS_PER_CANDIDATE - (existingCount + 1);
    return {
      success: true,
      message:
        remaining > 0
          ? `Candidature envoyée avec succès ! Il vous reste ${remaining} candidature possible.`
          : "Candidature envoyée avec succès ! Vous avez atteint le nombre maximal de candidatures autorisées.",
    };
  } catch (error) {
    console.error("submitTeacherApplication error:", error);
    return {
      success: false,
      message: "Une erreur est survenue lors de l'envoi de votre candidature.",
    };
  }
}

// Stockage mock en mémoire — à retirer une fois Prisma branché.
const mockApplications: Array<
  TeacherApplicationServerInput & {
    id: string;
    status: string;
    createdAt: string;
  }
> = [];

// ─────────────────────────────────────────────────────────────────────────
// DEMANDE DE CRÉATION D'ESPACE ÉCOLE
// ─────────────────────────────────────────────────────────────────────────

export async function submitSchoolRegistrationRequest(
  data: SchoolRegistrationRequestInput
) {
  try {

    await prisma.schoolRegistrationRequest.create({
      data: {
        schoolName: data.schoolName,
        city: data.city,
        country: data.country,
        contactName: data.contactName,
        email: data.email.toLowerCase(),
        phone: data.phone,
        studentsCount: data.studentsCount,
        message: data.message,
      },
    });

    // TODO: notifier le super administrateur (email / dashboard) ici.
    return {
      success: true,
      message: "Votre demande a été envoyée. Notre équipe vous contactera sous 48 heures.",
    };

  } catch (error) {

    console.log(error);

    return {
      success: false,
      message: "Erreur serveur",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────
// DEMANDE DE DÉMO
// ─────────────────────────────────────────────────────────────────────────

export async function submitDemoRequest(
  input: DemoRequestInput
): Promise<ActionResult> {
  const parsed = demoRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: "Veuillez corriger les erreurs du formulaire.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    // await prisma.demoRequest.create({ data: parsed.data });
    return {
      success: true,
      message: "Merci ! Nous vous contacterons bientôt pour planifier votre démo.",
    };
  } catch (error) {
    console.error("submitDemoRequest error:", error);
    return {
      success: false,
      message: "Une erreur est survenue lors de l'envoi de votre demande.",
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────
// RECHERCHE D'ÉCOLES PARTENAIRES (utilisée par la barre de recherche du menu)
// ─────────────────────────────────────────────────────────────────────────

export async function searchPartnerSchools(
  query: string
): Promise<PartnerSchool[]> {
  // return prisma.school.findMany({
  //   where: {
  //     status: "active",
  //     OR: [
  //       { name: { contains: query, mode: "insensitive" } },
  //       { city: { contains: query, mode: "insensitive" } },
  //       { country: { contains: query, mode: "insensitive" } },
  //     ],
  //   },
  // });

  const { partnerSchools } = await import("@/lib/landingData");
  const q = query.trim().toLowerCase();
  if (!q) return partnerSchools;
  return partnerSchools.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q) ||
      s.country.toLowerCase().includes(q)
  );
}
