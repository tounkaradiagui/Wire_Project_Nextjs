export type Plan = "standard" | "premium";
export type SchoolStatus = "active" | "inactive" | "pending";

export interface PartnerSchool {
  id: string;
  name: string;
  city: string;
  country: string;
  logoUrl: string;
  bannerUrl: string;
  studentsCount: number;
  teachersCount: number;
  foundedYear: number;
  description: string;
  plan: Plan;
  status: SchoolStatus;
  address: string;
  phone: string;
  email: string;
  website?: string;
}

export interface HeroSlide {
  id: string;
  imageUrl: string;
  eyebrow: string;
  title: string;
  description: string;
}

export interface Testimonial {
  id: string;
  authorName: string;
  authorRole: string;
  schoolName: string;
  avatarUrl: string;
  quote: string;
  rating: number;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface PlatformStat {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  icon: string;
}

export interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

/** Server action response shape, used across lib/actions.ts */
export interface ActionResult<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
  fieldErrors?: Record<string, string[]>;
}
