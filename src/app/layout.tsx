import { ClerkProvider } from "@clerk/nextjs"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastContainer, toast } from 'react-toastify';


const inter = Inter({ subsets: ["latin"] });

// Ce layout est utilisé pour toutes les pages de l'app, il englobe donc tous les composants enfants. C'est ici qu'on peut
// mettre des éléments communs à toutes les pages (ex: un thème, un contexte global, une barre de navigation, etc.).
export const metadata: Metadata = {
  // ── Titre ──
  title: {
    default: "Wagadu — Application de gestion scolaire",
    template: "%s | Wagadu",
  },
  // ── Description ──
  description:
    "Plateforme de gestion scolaire Wagadu — Bulletins, présences, résultats et suivi des élèves. Optimisez la gestion de votre école au Mali avec notre tableau de bord intuitif et complet.",

  // ── Mots-clés ──
  keywords: [
    "école", "gestion scolaire", "bulletins", "résultats", "Segou",
    "présences", "Mali", "Bamako", "Wagadu", "enseignement", "Koulikoro", "Sikasso", "Gao",
    "Tombouctou", "Mopti", "Ségou", "Kayes", "éducation", "système scolaire",
    "plateforme éducative", "suivi des élèves", "gestion des notes", "gestion des présences",
    "tableau de bord scolaire", "application scolaire", "école numérique", "éducation au Mali",
    "école à Kayes", "école à Segou", "école à Bamako", "école à Koulikoro", "école à Sikasso",
    "école à Gao", "école à Tombouctou", "école à Mopti", "école à Ségou", "école à Kayes",
  ],

  // ── Auteur ──
  authors: [{ name: "Diagui Tounkara", url: "https://wagadu-initial-stage.vercel.app" }],
  creator: "Diagui Tounkara",

  // ── Open Graph (partage réseaux sociaux) ──
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://wagadu-initial-stage.vercel.app",
    siteName: "Wagadu",
    title: "Wagadu — Tableau de bord scolaire",
    description: "Plateforme de gestion scolaire Wagadu — Bulletins, présences, résultats.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Wagadu Logo",
      },
    ],
  },

  // ── Twitter Card ──
  twitter: {
    card: "summary_large_image",
    title: "Wagadu — Tableau de bord scolaire",
    description: "Plateforme de gestion scolaire Wagadu.",
    images: ["/logo.png"],
  },

  // ── Favicon (Next.js gère icon.png automatiquement) ──
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },

  // ── Robots ──
  robots: {
    index: false, // ← false car c'est une app privée
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },

  // ── Manifest PWA (optionnel) ──
  manifest: "/manifest.json",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#111827", // gris foncé — correspond à ton UI
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>{children} <ToastContainer position="top-center" theme="dark" /></body>
      </html>
    </ClerkProvider>
  )
}