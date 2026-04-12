"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useUser, useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { loginSchema } from "@/lib/validations/auth.schema";

export default function LoginPage() {
  const { signIn, isLoaded } = useSignIn();
  const { isSignedIn, user } = useUser();
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<any>({});
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [touched, setTouched] = useState({
    identifier: false,
    password: false,
  });

  const isDisabled =
  loading ||
  identifier.trim().length === 0 ||
  password.trim().length === 0;

  // Vérification automatique du status après login
  useEffect(() => {
    if (!isSignedIn || !user) return;

    const status = user.publicMetadata?.status;
    const role = user.publicMetadata?.role;

    if (status === "banned") {
      setGlobalError("Votre compte est banni.");
      return;
    }

    if (status === "inactive") {
      setGlobalError("Votre compte est inactif.");
      return;
    }

    const result = loginSchema.safeParse({ identifier, password });
  
    if (!result.success) {
      const errors: any = {};
  
      result.error.issues.forEach((err) => {
        const field = err.path[0] as string;
        errors[field] = err.message;
      });
  
      setFieldErrors(errors);
      return;
    }

    if (role) router.replace(`/${role}`);
  }, [isSignedIn, user, router, identifier, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setGlobalError(null);

    if (!isLoaded) return;

    try {
      setLoading(true);

      const attempt = await signIn.create({ identifier, password });

      if (attempt.status === "complete") {
        // reload pour que useUser détecte le user
        window.location.reload();
      }
    } catch (err: any) {
      setLoading(false);
      const code = err?.errors?.[0]?.code;

      switch (code) {
        case "form_identifier_not_found":
          setFieldErrors({ identifier: "Identifiant incorrect" });
          break;
        case "form_password_incorrect":
          setFieldErrors({ password: "Mot de passe incorrect" });
          break;
        case "user_locked":
        case "user_banned":
          setFieldErrors({password: "Compte banni ou verrouillé"});
          break;
        default:
          setGlobalError("Une erreur est survenue, veuillez réessayer");
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-linear-to-br from-blue-500 via-indigo-500 to-blue-600 dark:from-gray-900 dark:via-gray-800 dark:to-black">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-white text-2xl md:text-4xl font-semibold mb-6 text-center"
      >
        Wagadu – Gestion des absences
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl flex flex-col md:flex-row w-full max-w-5xl overflow-hidden border border-white/20"
      >
        <div className="hidden md:block md:w-1/2">
          <img src="/login-bg.png" alt="Login" className="h-full w-full object-cover" />
        </div>

        <div className="w-full md:w-1/2 bg-white dark:bg-gray-900 p-8 md:p-10 flex flex-col justify-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-center text-2xl md:text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-6"
          >
            Welcome Back!
          </motion.h2>

          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <motion.div whileFocus={{ scale: 1.02 }}>
              <input
                type="text"
                value={identifier}
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, identifier: true }))
                }
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Identifiant"
                className="w-full rounded-xl border-gray-300 bg-gray-100 dark:bg-gray-800 p-3 focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </motion.div>

            {touched.identifier && fieldErrors.identifier && (
              <p className="text-xs text-red-500">
                {fieldErrors.identifier}
              </p>
            )}
  
            <motion.div whileFocus={{ scale: 1.02 }}>
              <input
                type="password"
                value={password}
                onBlur={() =>
                  setTouched((prev) => ({ ...prev, password: true }))
                }
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                className="w-full rounded-xl border-gray-300 bg-gray-100 dark:bg-gray-800 p-3 focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </motion.div>

            {touched.password && fieldErrors.password && (
              <p className="text-xs text-red-500">
                {fieldErrors.password}
              </p>
            )}

            {globalError && (
              <div className="bg-red-100 text-red-600 p-3 rounded-xl text-sm text-center">
                {globalError}
              </div>
            )}

            <motion.button
              whileHover={!isDisabled ? { scale: 1.03 } : {}}
              whileTap={!isDisabled ? { scale: 0.97 } : {}}
              type="submit"
              disabled={isDisabled}
              className={`w-full py-3 rounded-xl font-semibold transition flex items-center justify-center ${isDisabled ? "bg-blue-500 cursor-not-allowed" : "bg-blue-600 cursor-pointer hover:bg-blue-700 text-white"
                }`}
            >
              {loading ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" /> : "Se connecter"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}