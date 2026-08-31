import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import TeacherApplicationForm from "@/components/forms/TeacherApplicationForm";

import prisma from "@/lib/prisma";

export async function generateStaticParams() {
  const schools = await prisma.school.findMany({
    where: {
      status: "ACTIVE",
      isDeleted: false,
      isVerified: true,
    },
    select: {
      id: true,
    },
  });

  return schools.map((school) => ({
    id: school.id,
  }));
}

export default async function SchoolDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const school = await prisma.school.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      _count: {
        select: {
          teachers: true,
          students: true,
        },
      },
    },
  });

  if (!school) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Banner */}
      <div className="relative h-56 w-full bg-slate-200 sm:h-72">
        <Image
          src={school.bannerUrl || "/default-banner.jpg"}
          alt={school.name}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />

        <div className="absolute inset-0 bg-linear-to-t from-[#0F2D56]/80 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 mx-auto flex max-w-6xl items-end gap-4 px-4 pb-5 sm:px-6 lg:px-8">
          <span className="h-20 w-20 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg sm:h-24 sm:w-24">
            <Image
              src={school.logoUrl || "/school-logo.png"}
              alt={school.name}
              width={96}
              height={96}
              className="h-full w-full object-cover"
            />
          </span>

          <div>
            <h1 className="text-2xl font-extrabold text-white">
              {school.name}
            </h1>

            <p className="text-white/80">
              📍 {school.city}, {school.country}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 py-10 lg:grid-cols-3">
        {/* Informations */}
        <div className="lg:col-span-2">
          <Link
            href="/"
            className="text-sm font-medium text-[#1B5FC1]"
          >
            ← Retour aux écoles
          </Link>

          <h2 className="mt-6 text-xl font-bold text-[#0F2D56]">
            À propos
          </h2>

          <p className="mt-3 leading-7 text-slate-600">
            {school.description || "Aucune description disponible."}
          </p>

          {/* Statistiques */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl bg-[#F0F6FF] p-4 text-center">
              <div className="text-2xl">🎓</div>
              <div className="mt-2 text-lg font-bold text-[#0F2D56]">
                {school.maxStudents ?? school._count.students}
              </div>
              <div className="text-xs text-slate-500">Élèves</div>
            </div>

            <div className="rounded-xl bg-[#F0F6FF] p-4 text-center">
              <div className="text-2xl">👨‍🏫</div>
              <div className="mt-2 text-lg font-bold text-[#0F2D56]">
                {school._count.teachers}
              </div>
              <div className="text-xs text-slate-500">
                Enseignants
              </div>
            </div>

            <div className="rounded-xl bg-[#F0F6FF] p-4 text-center">
              <div className="text-2xl">🌍</div>
              <div className="mt-2 text-lg font-bold text-[#0F2D56]">
                {school.language}
              </div>
              <div className="text-xs text-slate-500">
                Langue
              </div>
            </div>

            <div className="rounded-xl bg-[#F0F6FF] p-4 text-center">
              <div className="text-2xl">⭐</div>
              <div className="mt-2 text-lg font-bold text-[#0F2D56]">
                {school.plan}
              </div>
              <div className="text-xs text-slate-500">
                Abonnement
              </div>
            </div>
          </div>

          {/* Coordonnées */}
          <h2 className="mt-10 text-xl font-bold text-[#0F2D56]">
            Coordonnées
          </h2>

          <ul className="mt-4 space-y-2 text-slate-600">
            <li>📍 {school.address}</li>

            {school.phone && <li>📞 {school.phone}</li>}

            {school.email && <li>✉️ {school.email}</li>}

            {school.website && (
              <li>
                🌐{" "}
                <a
                  href={school.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {school.website}
                </a>
              </li>
            )}
          </ul>
        </div>

        {/* Formulaire */}
        <div>
          <TeacherApplicationForm schoolId={school.id} />
        </div>
      </div>

      <Footer />
    </main>
  );
}