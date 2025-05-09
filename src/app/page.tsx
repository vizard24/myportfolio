import Header from '@/components/layout/header';
import IntroductionSection from '@/components/home/introduction-section';
import ProjectsSection from '@/components/home/projects-section';
import ExperienceSection from '@/components/home/experience-section';
import SkillsSection from '@/components/home/skills-section';
import ResumePitchSection from '@/components/home/resume-pitch-section';
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
        <ResumePitchSection />
      </main>
      <Footer />
    </div>
  );
}
