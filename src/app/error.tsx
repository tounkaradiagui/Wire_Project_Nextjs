"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("🔥 GLOBAL ERROR:", error);
    Sentry.captureException(error);

    // Redirection vers page custom
    router.push("/errors/server-error");
  }, [error, router]);

  return null;
}