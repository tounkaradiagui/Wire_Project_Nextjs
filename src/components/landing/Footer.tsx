import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0F2D56] px-4 py-10 text-white/60 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-2 text-lg font-extrabold text-white">WAGADU</div>
            <p className="text-sm leading-relaxed">
              Plateforme de gestion scolaire pour l&apos;Afrique francophone.
            </p>
          </div>
          <div>
            <div className="mb-3 text-sm font-semibold text-white">Plateforme</div>
            <ul className="flex flex-col gap-2 text-sm">
              <li><a href="#fonctionnalites" className="hover:text-white">Fonctionnalités</a></li>
              <li><a href="#ecoles" className="hover:text-white">Écoles partenaires</a></li>
              <li><a href="#temoignages" className="hover:text-white">Témoignages</a></li>
              <li><a href="#faq" className="hover:text-white">FAQ</a></li>
            </ul>
          </div>
          <div>
            <div className="mb-3 text-sm font-semibold text-white">Pour les écoles</div>
            <ul className="flex flex-col gap-2 text-sm">
              <li><a href="#creer-mon-ecole" className="hover:text-white">Créer mon école</a></li>
              <li><Link href="/connexion" className="hover:text-white">Connexion administrateur</Link></li>
            </ul>
          </div>
          <div>
            <div className="mb-3 text-sm font-semibold text-white">Contact</div>
            <ul className="flex flex-col gap-2 text-sm">
              <li>contact@wagadu.africa</li>
              <li>+223 76 29 22 70</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs">
          © {new Date().getFullYear()} WAGADU Afrique — Tous droits réservés
        </div>
      </div>
    </footer>
  );
}
