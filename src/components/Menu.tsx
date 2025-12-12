import Link from "next/link";

import {
  Home,
  User,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  FileText,
  Calendar,
  MessageSquare,
  Megaphone,
  Settings,
  LogOut,
  UserCircle,
  CheckSquare,
  Trophy,
  FileCheck2,
  ClipboardCheck,
  NotebookPen,
} from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";

const menuItems = [
  {
    title: "MENU",
    items: [
      {
        icon: Home,
        label: "Accueil",
        href: "/admin",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: User,
        label: "Enseignants",
        href: "/list/teachers",
        visible: ["admin", "teacher"],
      },
      {
        icon: GraduationCap,
        label: "Élèves",
        href: "/list/students",
        visible: ["admin", "teacher"],
      },
      {
        icon: Users,
        label: "Parents",
        href: "/list/parents",
        visible: ["admin", "teacher"],
      },
      {
        icon: BookOpen,
        label: "Matières",
        href: "/list/subjects",
        visible: ["admin"],
      },
      {
        icon: ClipboardList,
        label: "Classes",
        href: "/list/classes",
        visible: ["admin", "teacher"],
      },
      {
        icon: FileText,
        label: "Leçons",
        href: "/list/lessons",
        visible: ["admin", "teacher"],
      },
      {
        icon: Trophy,
        label: "Examens",
        href: "/list/exams",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: FileCheck2,
        label: "Devoirs",
        href: "/list/assignments",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: NotebookPen,
        label: "Résultats",
        href: "/list/results",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: CheckSquare,
        label: "Présences",
        href: "/list/attendance",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: Calendar,
        label: "Événements",
        href: "/list/events",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: MessageSquare,
        label: "Messages",
        href: "/list/messages",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: Megaphone,
        label: "Annonces",
        href: "/list/announcements",
        visible: ["admin", "teacher", "student", "parent"],
      },
    ],
  },
  {
    title: "AUTRES",
    items: [
      {
        icon: UserCircle,
        label: "Profil",
        href: "/profile",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: Settings,
        label: "Paramètres",
        href: "/settings",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: LogOut,
        label: "Déconnexion",
        href: "/logout",
        visible: ["admin", "teacher", "student", "parent"],
      },
    ],
  },
];

const Menu = async () => {
  let user = null;

  try {
    user = await currentUser();
  } catch (error) {
    console.error("Clerk error (maybe offline):", error);
    return null; // avoid crash when offline
  }

  // No user → no menu
  if (!user) return null;

  const role = user.publicMetadata?.role as string;

  return (
    <div className="text-sm p-2">
      {menuItems.map((i) => (
        <div className="flex flex-col gap-2" key={i.title}>
          <span className="hidden lg:block my-4 font-light text-white">
            {i.title}
          </span>

          {i.items.map((item) => {
            if (role && item.visible.includes(role)) {
              const Icon = item.icon;
              return (
                <Link
                  href={item.href}
                  key={item.label}
                  className="flex items-center justify-center lg:justify-start gap-4 mt-2 text-gray-700 transition-all duration-200"
                >
                  <Icon size={25} color="#1E5CC5" />
                  <span className="hidden lg:block text-white">
                    {item.label}
                  </span>
                </Link>
              );
            }
          })}
        </div>
      ))}
    </div>
  );
};


export default Menu;
