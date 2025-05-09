import Image from 'next/image';
import Link from 'next/link';
import { personalInfo } from '@/data/portfolio-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Github, Linkedin, Mail, Download } from 'lucide-react';
import SectionWrapper from '@/components/layout/section-wrapper';

export default function IntroductionSection() {
  return (
    <SectionWrapper id="home" className="bg-secondary/50">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-12 items-center">
        <div className="md:col-span-2 flex justify-center">
          <Card className="w-64 h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 rounded-full overflow-hidden shadow-xl transform transition-all duration-500 hover:scale-105">
            <Image
              src={personalInfo.profilePictureUrl}
              alt={personalInfo.name}
              width={320}
              height={320}
              priority
              className="object-cover w-full h-full"
              data-ai-hint={personalInfo.profilePictureHint}
            />
          </Card>
        </div>
        <div className="md:col-span-3 text-center md:text-left">
          <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl lg:text-6xl">
            {personalInfo.name}
          </h1>
          <p className="mt-4 text-xl text-muted-foreground sm:text-2xl">
            {personalInfo.title}
          </p>
          <p className="mt-6 text-base leading-relaxed text-foreground/80">
            {personalInfo.introduction}
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button asChild size="lg" className="bg-gradient-to-r from-[#FFA07A] to-[#FFDAB9] text-primary-foreground hover:opacity-90 transition-opacity shadow-md">
              <Link href="#projects">
                View Projects
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="shadow-md">
              <Link href="/resume.pdf" target="_blank" download> {/* Assuming resume.pdf is in public folder */}
                <Download className="mr-2 h-5 w-5" />
                Download CV
              </Link>
            </Button>
          </div>
          <div className="mt-8 flex justify-center md:justify-start space-x-6">
            <Link href={personalInfo.contact.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub profile">
              <Github className="h-7 w-7 text-muted-foreground hover:text-primary transition-colors" />
            </Link>
            <Link href={personalInfo.contact.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile">
              <Linkedin className="h-7 w-7 text-muted-foreground hover:text-primary transition-colors" />
            </Link>
            <Link href={`mailto:${personalInfo.contact.email}`} aria-label="Send email">
              <Mail className="h-7 w-7 text-muted-foreground hover:text-primary transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
