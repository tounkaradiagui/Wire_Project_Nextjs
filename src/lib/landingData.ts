import {
    PartnerSchool,
    HeroSlide,
    Testimonial,
    FaqItem,
    PlatformStat,
    Feature,
} from "@/lib/types";

export const heroSlides: HeroSlide[] = [
    {
        id: "slide-1",
        imageUrl: "/images/hero/hero-1.jpg",
        eyebrow: "Plateforme tout-en-un",
        title: "Gérez votre école en toute simplicité",
        description:
            "Élèves, enseignants, parents, paiements et emplois du temps réunis dans un seul espace, pensé pour l'Afrique francophone.",
    },
    {
        id: "slide-2",
        imageUrl: "/images/hero/hero-2.jpg",
        eyebrow: "Suivi des absences",
        title: "Ne perdez plus aucune information de présence",
        description:
            "Enregistrez les absences en quelques clics et informez automatiquement les parents par SMS ou email.",
    },
    {
        id: "slide-3",
        imageUrl: "/images/hero/hero-3.jpg",
        eyebrow: "Bulletins automatisés",
        title: "Générez les bulletins en quelques minutes",
        description:
            "Calculs de moyennes, appréciations et classements générés automatiquement, conformes aux standards locaux.",
    },
    {
        id: "slide-4",
        imageUrl: "/images/hero/hero-4.jpg",
        eyebrow: "Communication parents",
        title: "Restez connectés avec chaque famille",
        description:
            "Messagerie intégrée, notifications de paiement et suivi de scolarité accessibles directement aux parents.",
    },
];

export const features: Feature[] = [
    { id: "f1", icon: "users", title: "Gestion des élèves", description: "Inscriptions, dossiers, classes et historique scolaire centralisés." },
    { id: "f2", icon: "calendar-x", title: "Gestion des absences", description: "Pointage rapide et alertes automatiques aux parents." },
    { id: "f3", icon: "file-text", title: "Bulletins", description: "Génération automatique des bulletins et relevés de notes." },
    { id: "f4", icon: "credit-card", title: "Paiements", description: "Suivi de la scolarité, reçus et rappels d'échéance." },
    { id: "f5", icon: "clock", title: "Emploi du temps", description: "Planification des cours et des salles sans conflits." },
    { id: "f6", icon: "message-circle", title: "Communication parents", description: "Messagerie et notifications en temps réel." },
];

export const platformStats: PlatformStat[] = [
    { id: "st1", label: "Écoles partenaires", value: 48, icon: "school" },
    { id: "st2", label: "Élèves gérés", value: 18400, suffix: "+", icon: "graduation-cap" },
    { id: "st3", label: "Enseignants actifs", value: 1260, suffix: "+", icon: "users" },
    { id: "st4", label: "Pays couverts", value: 6, icon: "globe" },
];

export const partnerSchools: PartnerSchool[] = [
    {
        id: "s1",
        name: "Lycée Sainte-Marie",
        city: "Abidjan",
        country: "Côte d'Ivoire",
        logoUrl: "/images/schools/saintemarie-logo.png",
        bannerUrl: "/images/schools/saintemarie-banner.jpg",
        studentsCount: 420,
        teachersCount: 32,
        foundedYear: 1998,
        description:
            "Établissement privé reconnu pour l'excellence académique et son encadrement personnalisé du primaire au lycée.",
        plan: "premium",
        status: "active",
        address: "Cocody, Abidjan",
        phone: "+225 27 22 44 55 66",
        email: "contact@saintemarie.ci",
    },
    {
        id: "s2",
        name: "École Les Palmiers",
        city: "Dakar",
        country: "Sénégal",
        logoUrl: "/images/schools/palmiers-logo.png",
        bannerUrl: "/images/schools/palmiers-banner.jpg",
        studentsCount: 310,
        teachersCount: 24,
        foundedYear: 2005,
        description:
            "École bilingue offrant un cursus moderne et un fort accompagnement des familles tout au long de la scolarité.",
        plan: "standard",
        status: "active",
        address: "Mermoz, Dakar",
        phone: "+221 33 824 11 22",
        email: "contact@lespalmiers.sn",
    },
    {
        id: "s3",
        name: "Collège Saint-Joseph",
        city: "Cotonou",
        country: "Bénin",
        logoUrl: "/images/schools/stjoseph-logo.png",
        bannerUrl: "/images/schools/stjoseph-banner.jpg",
        studentsCount: 185,
        teachersCount: 18,
        foundedYear: 2012,
        description:
            "Collège à taille humaine, reconnu pour la qualité de son suivi pédagogique individualisé.",
        plan: "standard",
        status: "active",
        address: "Akpakpa, Cotonou",
        phone: "+229 21 30 12 34",
        email: "admin@stjoseph.bj",
    },
    {
        id: "s4",
        name: "Groupe Scolaire Excellence",
        city: "Lomé",
        country: "Togo",
        logoUrl: "/images/schools/excellence-logo.png",
        bannerUrl: "/images/schools/excellence-banner.jpg",
        studentsCount: 260,
        teachersCount: 21,
        foundedYear: 2009,
        description:
            "Groupe scolaire multi-filières, du préscolaire au secondaire, avec un fort taux de réussite aux examens nationaux.",
        plan: "premium",
        status: "active",
        address: "Bè, Lomé",
        phone: "+228 22 25 67 89",
        email: "contact@excellence.tg",
    },
];

export const testimonials: Testimonial[] = [
    {
        id: "t1",
        authorName: "M. Kouassi Bernard",
        authorRole: "Directeur",
        schoolName: "Lycée Sainte-Marie",
        avatarUrl: "/images/testimonials/kouassi.jpg",
        quote:
            "Depuis que nous utilisons la plateforme, le temps consacré à la gestion administrative a été divisé par deux. Nos enseignants peuvent enfin se concentrer sur la pédagogie.",
        rating: 5,
    },
    {
        id: "t2",
        authorName: "Mme Diallo Aïcha",
        authorRole: "Administratrice",
        schoolName: "École Les Palmiers",
        avatarUrl: "/images/testimonials/diallo.jpg",
        quote:
            "Les parents adorent recevoir les notifications d'absence en temps réel. Cela a vraiment renforcé la confiance avec les familles.",
        rating: 5,
    },
    {
        id: "t3",
        authorName: "M. Adjovi Serge",
        authorRole: "Proviseur",
        schoolName: "Collège Saint-Joseph",
        avatarUrl: "/images/testimonials/adjovi.jpg",
        quote:
            "La génération des bulletins qui prenait auparavant une semaine se fait maintenant en une après-midi. Un vrai gain de temps pour toute l'équipe pédagogique.",
        rating: 4,
    },
];

export const faqItems: FaqItem[] = [
    {
        id: "faq1",
        question: "Comment inscrire mon école sur la plateforme ?",
        answer:
            "Cliquez sur « Créer mon école », remplissez le formulaire de demande avec les informations de votre établissement. Notre équipe valide votre demande sous 48 heures et vous envoie vos identifiants administrateur.",
    },
    {
        id: "faq2",
        question: "La plateforme est-elle adaptée aux connexions internet lentes ?",
        answer:
            "Oui, l'interface a été optimisée pour fonctionner correctement même avec une connexion internet limitée, un enjeu central pour de nombreux établissements.",
    },
    {
        id: "faq3",
        question: "Puis-je postuler comme enseignant dans une école partenaire ?",
        answer:
            "Oui. Sur la page de chaque école partenaire, vous pouvez envoyer votre candidature avec votre CV et une lettre de motivation. Chaque candidat peut soumettre jusqu'à 2 candidatures au total.",
    },
    {
        id: "faq4",
        question: "Mes données sont-elles sécurisées ?",
        answer:
            "Chaque école dispose d'un espace isolé. Les mots de passe sont générés de façon sécurisée et les données ne sont jamais partagées entre établissements.",
    },
    {
        id: "faq5",
        question: "Existe-t-il une version d'essai ?",
        answer:
            "Vous pouvez demander une démonstration gratuite via le bouton « Demander une démo » en haut de la page d'accueil.",
    },
];
