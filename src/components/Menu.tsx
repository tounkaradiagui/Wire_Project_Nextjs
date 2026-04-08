"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";

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
  UserCircle,
  CheckSquare,
  Trophy,
  FileCheck2,
  NotebookPen,
} from "lucide-react";

const menuItems = [
  {
    title: "MENU",
    items: [
      {
        icon: Home,
        label: "Accueil",
        href: "DYNAMIC_HOME", // placeholder
        visible: ["admin", "teacher", "student", "parent", "super_admin"],
      },
      {
        icon: Home,
        label: "Utilisateurs",
        href: "/list/users",
        visible: ["super_admin"],
      },
      {
        icon: User,
        label: "Enseignants",
        href: "/list/teachers",
        visible: ["admin", "super_admin"],
      },
      {
        icon: GraduationCap,
        label: "Élèves",
        href: "/list/students",
        visible: ["admin", "super_admin"],
      },
      {
        icon: Users,
        label: "Parents",
        href: "/list/parents",
        visible: ["admin", "super_admin"],
      },
      {
        icon: BookOpen,
        label: "Matières",
        href: "/list/subjects",
        visible: ["admin", "super_admin", "teacher"],
      },
      {
        icon: ClipboardList,
        label: "Classes",
        href: "/list/classes",
        visible: ["admin", "super_admin"],
      },
      {
        icon: FileText,
        label: "Cours",
        href: "/list/lessons",
        visible: ["admin", "teacher", "super_admin"],
      },
      {
        icon: FileText,
        label: "Séances",
        href: "/list/sessions",
        visible: ["admin", "teacher", "super_admin"],
      },
      {
        icon: Trophy,
        label: "Trimestre",
        href: "/list/exams",
        visible: ["admin", "teacher", "student", "parent", "super_admin"],
      },
      {
        icon: FileCheck2,
        label: "Devoirs",
        href: "/list/assignments",
        visible: ["admin", "teacher", "student", "parent", "super_admin"],
      },
      {
        icon: NotebookPen,
        label: "Résultats",
        href: "/list/results",
        visible: ["admin", "teacher", "student", "parent", "super_admin"],
      },
      {
        icon: CheckSquare,
        label: "Absences",
        href: "/list/attendances",
        visible: ["admin", "teacher", "student", "parent", "super_admin"],
      },
      {
        icon: Calendar,
        label: "Événements",
        href: "/list/events",
        visible: ["admin", "super_admin"],
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
        visible: ["admin", "super_admin"],
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
        visible: ["admin", "teacher", "student", "parent", "super_admin"],
      },
      {
        icon: Settings,
        label: "Paramètres",
        href: "/settings",
        visible: ["admin", "teacher", "student", "parent", "super_admin"],
      },
    ],
  },
];

type MenuProps = {
  isMobileOpen?: boolean;
};

const Menu = ({ isMobileOpen = false }: MenuProps) => {
  const { user } = useUser();
  if (!user) return null;
  const role = user.publicMetadata?.role as string;

  const getHomeRoute = (role: string) => {
    switch (role) {
      case "super_admin":
        return "/dashboard/super_admin";
      case "admin":
        return "/admin";
      case "teacher":
        return "/teacher";
      case "student":
        return "/student";
      case "parent":
        return "/parent";
      default:
        return "/";
    }
  };

  return (
    <div className="flex-1 px-2 py-4">
      {menuItems.map((group) => (
        <div className="flex flex-col gap-2" key={group.title}>
          <span className={`hidden lg:block my-4 font-light text-white`}>
            {group.title}
          </span>

          {group.items.map((item) => {
            if (role && item.visible.includes(role)) {
              const Icon = item.icon;
              return (
                <Link
                  href={item.href === "DYNAMIC_HOME" ? getHomeRoute(role) : item.href}
                  key={item.label}
                  className={`
                    flex items-center gap-4 mt-2 text-gray-700 transition-all duration-200
                    ${isMobileOpen ? "justify-start px-4 py-2" : "justify-center lg:justify-start"}
                  `}
                >
                  {/* Afficher l’icône uniquement sur desktop OU si on n’est pas en mobile open */}
                  {!isMobileOpen && <Icon size={25} color="#1E5CC5" />}
                  <span className="hidden lg:block text-white">{item.label}</span>
                  {/* Sur mobile open, on montre le label comme bouton plein */}
                  {isMobileOpen && (
                    <span className="text-white">{item.label}</span>
                  )}
                </Link>
              );
            }
            return null;
          })}
        </div>
      ))}
    </div>
  );
};

export default Menu;