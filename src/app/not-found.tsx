import { redirect } from "next/navigation";

export default function NotFound() {
    redirect("/errors/not-found");
}