"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const { isLoaded, isSignedIn, user } = useUser();

  // console.log("User:", user);

  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) return; // User must be authenticated

    const role = user?.publicMetadata?.role;
    if (role) {
      router.replace(`/${role}`);
    }
  }, [isLoaded, isSignedIn, user, router]);

  return (
    <div
      className="
        min-h-screen flex flex-col items-center justify-center p-4
        bg-gradient-to-br from-blue-500 via-indigo-500 to-blue-600
        dark:from-gray-900 dark:via-gray-800 dark:to-black
        animate-bgMove
      "
    >
      {/* --- TITLE WITH ANIMATION --- */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-white text-2xl md:text-4xl font-semibold mb-6 text-center"
      >
        Ecole de Gogui – Gestion des absences
      </motion.h1>

      {/* --- MAIN CARD --- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="
          bg-white/10 dark:bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl 
          flex flex-col md:flex-row 
          w-full max-w-5xl overflow-hidden border border-white/20
        "
      >
        {/* LEFT IMAGE */}
        <div className="hidden md:block md:w-1/2">
          <img
            src="/login-bg.png"
            alt="Login"
            className="h-full w-full object-cover"
          />
        </div>

        {/* RIGHT FORM */}
        <div className="w-full md:w-1/2 bg-white dark:bg-gray-900 p-8 md:p-10 flex flex-col justify-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
            className="text-center text-2xl md:text-3xl font-semibold text-gray-800 dark:text-gray-100 mb-6"
          >
            Welcome Back!
          </motion.h2>

          <SignIn.Root>
            <SignIn.Step name="start">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.25 }}
                className="flex flex-col space-y-4"
              >
                {/* --- Username --- */}
                <Clerk.Field name="identifier">
                  <Clerk.Label className="text-gray-700 dark:text-gray-300 font-medium">
                    Username
                  </Clerk.Label>

                  <motion.div whileFocus={{ scale: 1.02 }}>
                    <Clerk.Input
                      type="text"
                      placeholder="Identifiant"
                      required
                      className="
                        w-full rounded-xl border-gray-300 dark:border-gray-700
                        bg-gray-100 dark:bg-gray-800 p-3 text-base md:text-lg
                        focus:ring-2 focus:ring-blue-500 transition-all
                      "
                    />
                  </motion.div>
                  <Clerk.FieldError className="text-xs text-red-400" />
                </Clerk.Field>

                {/* --- PASSWORD --- */}
                <Clerk.Field name="password">
                  <Clerk.Label className="text-gray-700 dark:text-gray-300 font-medium">
                    Mot de passe
                  </Clerk.Label>

                  <motion.div whileFocus={{ scale: 1.02 }}>
                    <Clerk.Input
                      type="password"
                      placeholder="Votre mot de passe"
                      required
                      className="
                        mt-1 w-full rounded-xl border-gray-300 dark:border-gray-700
                        bg-gray-100 dark:bg-gray-800 p-3 text-base md:text-lg
                        focus:ring-2 focus:ring-blue-500 transition-all
                      "
                    />
                  </motion.div>
                  <Clerk.FieldError className="text-xs text-red-400" />
                </Clerk.Field>

                {/* --- REMEMBER ME --- */}
                <div className="flex items-center space-x-2">
                  <input type="checkbox" className="w-4 h-4" />
                  <span className="text-gray-600 dark:text-gray-300 text-sm">
                    Se rappeler de moi
                  </span>
                </div>

                {/* --- BUTTON + LOADER --- */}
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <SignIn.Action
                    submit
                    className="
                      w-full bg-blue-600 hover:bg-blue-700 cursor-pointer
                      text-white py-3 rounded-xl font-semibold transition flex items-center justify-center
                    "
                    onClick={() => setLoading(true)}
                  >
                    {loading ? (
                      <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Connexion"
                    )}
                  </SignIn.Action>
                </motion.div>

                {/* --- FORGOT PASSWORD --- */}
                {/* <div className="text-center mt-2">
                  <a href="#" className="text-sm text-blue-600 hover:underline">
                    Mot de passe oublié ?
                  </a>
                </div> */}
              </motion.div>
            </SignIn.Step>
          </SignIn.Root>
        </div>
      </motion.div>
    </div>
  );
}
