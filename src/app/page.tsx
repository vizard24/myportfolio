
"use client";

import Header from '@/components/layout/header';
import IntroductionSection from '@/components/home/introduction-section';
import ProjectsSection from '@/components/home/projects-section';
import ExperienceSection from '@/components/home/experience-section';
import SkillsSection from '@/components/home/skills-section';
import ContactSection from '@/components/home/contact-section';
import Footer from '@/components/layout/footer';
import { useAdminMode } from '@/context/admin-mode-context';
import { BackgroundBlobs } from '@/components/ui/background-blobs';

function PageContent() {
  const { isAdminMode } = useAdminMode();
  return (
    <div className="flex flex-col min-h-screen relative overflow-x-hidden">
      <BackgroundBlobs />
      <Header />
      <main className="flex-grow z-10">
        <IntroductionSection />
        <ProjectsSection />
        <ExperienceSection />
        <SkillsSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}


export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <PageContent />
  );
}
