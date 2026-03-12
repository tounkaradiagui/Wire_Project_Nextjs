import * as Sentry from "@sentry/nextjs";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
    const { userId } = await auth();

    if (userId) {
        Sentry.setUser({
            id: userId,
        });
    }

    try {
        throw new Error("Sentry production test");

    } catch (error) {
        Sentry.captureException(error);
    }

    return Response.json({ ok: true });
}