import Header from '@/components/layout/header';
import IntroductionSection from '@/components/home/introduction-section';
import ProjectsSection from '@/components/home/projects-section';
import ExperienceSection from '@/components/home/experience-section';
import SkillsSection from '@/components/home/skills-section';
import ResumeSection from '@/components/home/resume-section';
import Footer from '@/components/layout/footer';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow">
        <IntroductionSection />
        <ProjectsSection />
        <ExperienceSection />
        <SkillsSection />
        <ResumeSection />
      </main>
      <Footer />
    </div>
  );
}
