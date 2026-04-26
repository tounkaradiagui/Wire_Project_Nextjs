export const ITEM_PER_PAGE = 5;

type RouteAccessMap = {
  [key: string]: string[];
};

export const routeAccessMap: RouteAccessMap = {

  // routes accessibles à tous les rôles connectés
  "/profile(.*)": ["admin", "teacher", "student", "parent", "super_admin"],
  "/settings(.*)": ["admin", "teacher", "student", "parent", "super_admin"],

  // Bulletins (tous les rôles connectés)
  "/bulletins(.*)": ["admin", "teacher", "student", "parent", "super_admin"],

  // Report Cards génération (admin/teacher seulement)
  "/report-cards(.*)": ["admin", "teacher", "super_admin"],

  // listes
  "/list/teachers(.*)": ["admin", "super_admin"],
  "/list/students(.*)": ["admin", "parent", "super_admin"],
  "/list/parents(.*)": ["admin", "super_admin"],
  "/list/subjects(.*)": ["admin", "super_admin", "teacher"],
  "/list/classes(.*)": ["admin", "teacher", "super_admin"],
  "/list/users(.*)": ["super_admin"],
  "/list/lessons(.*)": ["admin", "teacher", "super_admin"],


  "/list/sessions(.*)": ["admin", "super_admin", "teacher"],
  // page prendre les présences
  "/list/sessions/(.*)/attendance": ["admin", "teacher", "super_admin"],
  "/list/students/(.*)/card": ["admin", "teacher", "super_admin"],

  "/list/exams(.*)": ["admin", "teacher", "student", "parent", "super_admin"],
  "/list/assignments(.*)": ["admin", "teacher", "student", "parent", "super_admin"],
  "/list/results(.*)": ["admin", "teacher", "student", "parent", "super_admin"],
  "/list/attendance(.*)": ["admin", "teacher", "student", "parent", "super_admin"],
  "/list/events(.*)": ["admin", "teacher", "student", "parent", "super_admin"],
  "/list/announcements(.*)": ["admin", "teacher", "student", "parent", "super_admin"],
  "/list/messages(.*)": ["admin", "teacher", "parent"],

  // zones role-based (TOUJOURS EN DERNIER)
  "/super_admin(.*)": ["super_admin"],
  "/admin(.*)": ["admin"],
  "/teacher(.*)": ["teacher"],
  "/student(.*)": ["student"],
  "/parent(.*)": ["parent"],
};