import Navbar from "@/components/landing/Navbar";
import HeroSlider from "@/components/landing/HeroSlider";
import StatsSection from "@/components/landing/StatsSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import SchoolsSection from "@/components/landing/SchoolsSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FaqSection from "@/components/landing/FaqSection";
import CtaSection from "@/components/landing/CtaSection";
import Footer from "@/components/landing/Footer";

import prisma from "@/lib/prisma";
import {
  heroSlides,
  platformStats,
  features,
  testimonials,
  faqItems,
} from "@/lib/landingData";

export default async function HomePage() {
    const schools = await prisma.school.findMany({
        where: {
            status: "ACTIVE",
            isDeleted: false,
            isVerified: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            <HeroSlider slides={heroSlides} />
            <StatsSection stats={platformStats} />
            <FeaturesSection features={features} />
            <SchoolsSection schools={schools} />
            <TestimonialsSection items={testimonials} />
            <FaqSection items={faqItems} />
            <CtaSection />
            <Footer />
        </main>
    );
}