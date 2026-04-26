import { redirect } from "next/navigation";
import { isDatabaseConnectionError } from "./db-error";

export async function withDB<T>(fn: () => Promise<T>): Promise<T> {
    try {
        return await fn();
    } catch (error) {
        console.error("[DB Error]", error);
        if (isDatabaseConnectionError(error)) {
            redirect("/errors/connection-error");
        }
        // Toute autre erreur → server-error
        redirect("/errors/server-error");
    }
}