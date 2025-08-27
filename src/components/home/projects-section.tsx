
import Image from 'next/image';
import Link from 'next/link';
import { projectsData, type Project } from '@/data/portfolio-data';
import SectionWrapper from '@/components/layout/section-wrapper';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Github, ExternalLink, Pencil, PlusCircle } from 'lucide-react';
import { useAdminMode } from '@/context/admin-mode-context';

function ProjectCard({ project }: { project: Project }) {
  const { isAdminMode } = useAdminMode();
  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg rounded-xl transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 relative">
      {isAdminMode && (
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 text-white bg-black/30 hover:bg-black/50 z-10">
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      <div className="relative w-full h-56">
        <Image
          src={project.imageUrl}
          alt={project.title}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-500 group-hover:scale-105"
          data-ai-hint={project.imageHint || "technology project"}
        />
      </div>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary">{project.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription className="text-sm text-foreground/80 mb-4 leading-relaxed">
          {project.description}
        </CardDescription>
        <div className="flex flex-wrap gap-2 mb-4">
          {project.techStack.map((tech) => (
            <Badge key={tech.name} variant="secondary" className="flex items-center gap-1 text-xs">
              {tech.icon && <tech.icon className="h-3 w-3" />}
              {tech.name}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="mt-auto pt-0 pb-6 px-6 flex justify-end space-x-3">
        {project.githubUrl && (
          <Button variant="outline" size="sm" asChild>
            <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer">
              <Github className="mr-2 h-4 w-4" /> GitHub
            </Link>
          </Button>
        )}
        {project.liveDemoUrl && (
          <Button size="sm" asChild className="bg-gradient-to-r from-[#FFA07A] to-[#FFDAB9] text-primary-foreground hover:opacity-90 transition-opacity">
            <Link href={project.liveDemoUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" /> Live Demo
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default function ProjectsSection() {
    const { isAdminMode } = useAdminMode();
  return (
    <SectionWrapper 
      id="projects" 
      title="My Projects" 
      subtitle="A selection of projects I've worked on."
      headerActions={
        isAdminMode ? (
          <Button variant="outline" size="sm">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Project
          </Button>
        ) : null
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projectsData.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </SectionWrapper>
  );
}
