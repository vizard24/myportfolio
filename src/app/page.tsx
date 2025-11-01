
"use client";

import Header from '@/components/layout/header';
import IntroductionSection from '@/components/home/introduction-section';
import ProjectsSection from '@/components/home/projects-section';
import ExperienceSection from '@/components/home/experience-section';
import SkillsSection from '@/components/home/skills-section';
import ContactSection from '@/components/home/contact-section';
import Footer from '@/components/layout/footer';
import NetworkingSection from '@/components/home/networking-section';
import { useAdminMode } from '@/context/admin-mode-context';

function PageContent() {
  const { isAdminMode } = useAdminMode();
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <IntroductionSection />
        <ProjectsSection />
        <ExperienceSection />
        <SkillsSection />
        <ContactSection />
        {isAdminMode && <NetworkingSection />}
      </main>
      <Footer />
    </div>
  );
}


export default function HomePage() {
  return (
    <PageContent />
  );
}
