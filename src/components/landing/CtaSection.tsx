import SchoolRequestForm from "@/components/forms/SchoolRequestForm";

export default function CtaSection() {
  return (
    <section
      id="creer-mon-ecole"
      className="bg-linear-to-br from-[#0F2D56] to-[#1B5FC1] px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
    >
      <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2 lg:items-center">
        <div className="text-center lg:text-left">
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Votre école n&apos;est pas encore sur la plateforme ?
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/75 sm:text-base">
            Faites une demande en quelques minutes. Notre équipe examine votre demande
            et vous envoie vos identifiants administrateur sous 48 heures.
          </p>
          <ul className="mt-6 flex flex-col gap-2 text-sm text-white/80">
            <li>✓ Aucune carte bancaire requise pour la demande</li>
            <li>✓ Espace dédié et sécurisé pour votre établissement</li>
            <li>✓ Accompagnement à la prise en main</li>
          </ul>
        </div>
        <SchoolRequestForm />
      </div>
    </section>
  );
}
