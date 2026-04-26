import { auth } from "@clerk/nextjs/server";

// Cette fonction récupère les données d'authentification de l'utilisateur connecté, notamment son ID et son rôle. 
// Elle utilise la fonction `auth` de Clerk pour obtenir les informations de session, puis extrait le rôle à partir des métadonnées 
// de la session. Le rôle est utilisé pour déterminer les autorisations de l'utilisateur dans l'application.
export const getAuthData = async () => {
    const { userId, sessionClaims } = await auth();

    const role = (sessionClaims?.metadata as { role?: string })?.role;

    return {
        userId,
        role,
    };
};

// Fonction pour ajuster les horaires des leçons à la semaine en cours
const currentWorkWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();

    const startOfWeek = new Date(today);
    if (dayOfWeek === 0) {
        startOfWeek.setDate(today.getDate() + 1);
    }
    if (dayOfWeek === 6) {
        startOfWeek.setDate(today.getDate() + 2);
    } else {
        startOfWeek.setDate(today.getDate() - (dayOfWeek - 1));
    }
    startOfWeek.setHours(0, 0, 0, 0);

    return startOfWeek;
}

export const adjustScheduleToCurrentWeek = (
    lessons: { title: string; start?: Date; end?: Date }[]
) => {
    const startOfWeek = currentWorkWeek();

    return lessons
        .filter((lesson) => lesson.start && lesson.end)
        .map((lesson) => {
            const lessonDayOfWeek = lesson.start!.getDay();

            const daysFromMonday = lessonDayOfWeek === 0 ? 6 : lessonDayOfWeek - 1;

            const adjustedStartDate = new Date(startOfWeek);

            adjustedStartDate.setDate(startOfWeek.getDate() + daysFromMonday);

            const adjustedEndDate = new Date(adjustedStartDate);

            adjustedStartDate.setHours(
                lesson.start!.getHours(),
                lesson.start!.getMinutes(),
                lesson.start!.getSeconds()
            );

            adjustedEndDate.setHours(
                lesson.end!.getHours(),
                lesson.end!.getMinutes(),
                lesson.end!.getSeconds()
            );

            return {
                title: lesson.title,
                start: adjustedStartDate,
                end: adjustedEndDate,
            };
        });
};