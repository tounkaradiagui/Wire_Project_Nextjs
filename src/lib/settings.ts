export const ITEM_PER_PAGE = 5;

type RouteAccessMap = {
  [key: string]: string[];
};

export const routeAccessMap: RouteAccessMap = {
  // ✅ routes accessibles à tous les rôles connectés
  "/profile(.*)": ["admin", "teacher", "student", "parent"],
  "/settings(.*)": ["admin", "teacher", "student", "parent"],

  // 📋 listes
  "/list/teachers(.*)": ["admin", "teacher"],
  "/list/students(.*)": ["admin", "teacher", "parent"],
  "/list/parents(.*)": ["admin", "teacher"],
  "/list/subjects(.*)": ["admin"],
  "/list/classes(.*)": ["admin", "teacher"],

  "/list/exams(.*)": ["admin", "teacher", "student", "parent"],
  "/list/assignments(.*)": ["admin", "teacher", "student", "parent"],
  "/list/results(.*)": ["admin", "teacher", "student", "parent"],
  "/list/attendance(.*)": ["admin", "teacher", "student", "parent"],
  "/list/events(.*)": ["admin", "teacher", "student", "parent"],
  "/list/announcements(.*)": ["admin", "teacher", "student", "parent"],
  "/list/messages(.*)": ["admin", "teacher", "parent"],

  // 🔐 zones role-based (TOUJOURS EN DERNIER)
  "/admin(.*)": ["admin"],
  "/teacher(.*)": ["teacher"],
  "/student(.*)": ["student"],
  "/parent(.*)": ["parent"],
};