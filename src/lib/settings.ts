export const ITEM_PER_PAGE = 5;

type RouteAccessMap = {
  [key: string]: string[];
};

export const routeAccessMap: RouteAccessMap = {

  // routes accessibles à tous les rôles connectés
  "/profile(.*)": ["admin", "teacher", "student", "parent", "super_admin"],
  "/settings(.*)": ["admin", "teacher", "student", "parent", "super_admin"],

  // Bulletins (tous les rôles connectés)
  "/bulletins(.*)": ["admin", "teacher", "student", "parent"],

  // Report Cards génération (admin/teacher seulement)
  "/report-cards(.*)": ["admin", "teacher"],

  // listes
  "/list/teachers(.*)": ["admin", "super_admin"],
  "/list/students(.*)": ["admin", "parent", "super_admin"],
  "/list/parents(.*)": ["admin", "super_admin"],
  "/list/subjects(.*)": ["admin", "super_admin", "teacher"],
  "/list/classes(.*)": ["admin", "teacher", "super_admin"],
  "/list/users(.*)": ["super_admin"],
  "/list/lessons(.*)": ["admin", "teacher"],

  "/super_admin(.*)": ["super_admin"],
  "/super_admin/schools-list(.*)": ["super_admin"],
  "/super_admin/schools-request(.*)": ["super_admin"],
  "/super_admin/payment(.*)": ["super_admin"],
  "/super_admin/subscription(.*)": ["super_admin"],
  "/super_admin/statistics(.*)": ["super_admin"],
  "/super_admin/support(.*)": ["super_admin"],

  "/list/sessions(.*)": ["admin", "teacher"],
  // page prendre les présences
  "/list/sessions/(.*)/attendance": ["admin", "teacher"],
  "/list/students/(.*)/card": ["admin", "teacher"],

  "/list/exams(.*)": ["admin", "teacher", "student", "parent"],
  "/list/assignments(.*)": ["admin", "teacher", "student", "parent"],
  "/list/results(.*)": ["admin", "teacher", "student", "parent"],
  "/list/attendance(.*)": ["admin", "teacher", "student", "parent"],
  "/list/events(.*)": ["admin", "teacher", "student", "parent"],
  "/list/announcements(.*)": ["admin", "teacher", "student", "parent"],
  "/list/messages(.*)": ["admin", "teacher", "parent"],

  // zones role-based (TOUJOURS EN DERNIER)
  "/super_admin/dashboard(.*)": ["super_admin"],
  "/admin(.*)": ["admin"],
  "/teacher(.*)": ["teacher"],
  "/student(.*)": ["student"],
  "/parent(.*)": ["parent"],
};