
"use client";

import Header from '@/components/layout/header';
import IntroductionSection from '@/components/home/introduction-section';
import ProjectsSection from '@/components/home/projects-section';
import ExperienceSection from '@/components/home/experience-section';
import SkillsSection from '@/components/home/skills-section';
import ContactSection from '@/components/home/contact-section';
import Footer from '@/components/layout/footer';
import { AdminModeProvider } from '@/context/admin-mode-context';
import { AuthProvider } from '@/context/auth-context';
import { MessageProvider } from '@/context/message-context';
import { PortfolioDataProvider } from '@/context/portfolio-data-context';

export default function HomePage() {
  return (
    <AuthProvider>
      <AdminModeProvider>
        <MessageProvider>
          <PortfolioDataProvider>
            <div className="flex flex-col min-h-screen bg-background">
              <Header />
              <main className="flex-grow">
                <IntroductionSection />
                <ProjectsSection />
                <ExperienceSection />
                <SkillsSection />
                <ContactSection />
              </main>
              <Footer />
            </div>
          </PortfolioDataProvider>
        </MessageProvider>
      </AdminModeProvider>
    </AuthProvider>
  );
}
