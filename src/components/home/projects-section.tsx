
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { projectsData as initialProjectsData, type Project } from '@/data/portfolio-data';
import SectionWrapper from '@/components/layout/section-wrapper';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Github, ExternalLink, Pencil, PlusCircle, Save, X, Trash2, Eye, EyeOff } from 'lucide-react';
import { useAdminMode } from '@/context/admin-mode-context';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

function ProjectCard({ project: initialProject }: { project: Project }) {
  const { isAdminMode } = useAdminMode();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [project, setProject] = useState(initialProject);
  const [editedProject, setEditedProject] = useState(initialProject);
  const [newTech, setNewTech] = useState("");

  const handleSave = () => {
    setProject(editedProject);
    setIsEditing(false);
    toast({
      title: "Project Saved",
      description: "Your changes have been saved locally.",
    });
  };

  const handleCancel = () => {
    setEditedProject(project);
    setIsEditing(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedProject(prev => ({...prev, [name]: value}));
  };

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>, linkType: 'githubUrl' | 'liveDemoUrl') => {
    setEditedProject(prev => ({...prev, [linkType]: e.target.value}));
  };

  const toggleLinkVisibility = (linkType: 'githubUrl' | 'liveDemoUrl') => {
    setEditedProject(prev => {
      const currentUrl = prev[linkType];
      // If we are hiding it, we store the URL in a hidden field to restore it later.
      // A more robust solution would use a different state structure, but this works for local state.
      // @ts-ignore
      const tempStorageKey = `_${linkType}_hidden`;
      if (currentUrl) {
        return {...prev, [linkType]: undefined, [tempStorageKey]: currentUrl};
      } else {
        // @ts-ignore
        return {...prev, [linkType]: prev[tempStorageKey] || '' };
      }
    });
  };

  const handleTechDelete = (techNameToDelete: string) => {
    setEditedProject(prev => ({
        ...prev,
        techStack: prev.techStack.filter(tech => tech.name !== techNameToDelete)
    }));
  };

  const handleAddTech = () => {
    if (newTech && !editedProject.techStack.find(t => t.name.toLowerCase() === newTech.toLowerCase())) {
        setEditedProject(prev => ({
            ...prev,
            techStack: [...prev.techStack, { name: newTech }]
        }));
        setNewTech("");
    }
  };


  return (
    <Card className="flex flex-col h-full overflow-hidden shadow-lg rounded-xl transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 relative">
      {isAdminMode && !isEditing && (
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 text-white bg-black/30 hover:bg-black/50 z-10" onClick={() => setIsEditing(true)}>
          <Pencil className="h-4 w-4" />
        </Button>
      )}
      {isEditing && (
         <div className="absolute top-2 right-2 z-10 flex gap-1">
            <Button variant="default" size="icon" className="h-8 w-8" onClick={handleSave}><Save className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCancel}><X className="h-4 w-4" /></Button>
         </div>
      )}
      <div className="relative w-full h-56">
        <Image
          src={project.imageUrl}
          alt={project.title}
          fill
          objectFit="cover"
          className="transition-transform duration-500 group-hover:scale-105"
          data-ai-hint={project.imageHint || "technology project"}
        />
      </div>
      <CardHeader>
        {isEditing ? (
            <Input name="title" value={editedProject.title} onChange={handleInputChange} className="text-xl font-semibold"/>
        ) : (
            <CardTitle className="text-xl font-semibold text-primary">{project.title}</CardTitle>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        {isEditing ? (
            <Textarea name="description" value={editedProject.description} onChange={handleInputChange} rows={4} className="text-sm" />
        ) : (
            <CardDescription className="text-sm text-foreground/80 mb-4 leading-relaxed">
            {project.description}
            </CardDescription>
        )}

        <div className="flex flex-wrap gap-2 my-4">
          {(isEditing ? editedProject.techStack : project.techStack).map((tech) => (
            <Badge key={tech.name} variant="secondary" className="flex items-center gap-1 text-xs group/badge relative">
              {tech.icon && <tech.icon className="h-3 w-3" />}
              {tech.name}
              {isEditing && (
                 <button onClick={() => handleTechDelete(tech.name)} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full h-4 w-4 flex items-center justify-center opacity-0 group-hover/badge:opacity-100 transition-opacity">
                    <X className="h-3 w-3" />
                 </button>
              )}
            </Badge>
          ))}
        </div>
        {isEditing && (
            <div className="flex gap-2 mt-2">
                <Input value={newTech} onChange={(e) => setNewTech(e.target.value)} placeholder="Add new tech" className="h-8 text-xs" />
                <Button onClick={handleAddTech} size="sm" className="h-8 text-xs px-2"><PlusCircle className="h-4 w-4" /></Button>
            </div>
        )}
      </CardContent>
      <CardFooter className="mt-auto pt-0 pb-6 px-6 flex flex-col items-end gap-2">
        {isEditing ? (
            <div className="w-full space-y-2 text-xs">
                {/* GitHub Link */}
                <div className="flex items-center gap-2">
                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => toggleLinkVisibility('githubUrl')}>
                        {editedProject.githubUrl !== undefined ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <Github className="h-4 w-4" />
                    <Input disabled={editedProject.githubUrl === undefined} name="githubUrl" value={editedProject.githubUrl || ''} onChange={(e) => handleLinkChange(e, 'githubUrl')} placeholder="GitHub URL" />
                </div>
                {/* Live Demo Link */}
                <div className="flex items-center gap-2">
                    <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => toggleLinkVisibility('liveDemoUrl')}>
                        {editedProject.liveDemoUrl !== undefined ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                    <ExternalLink className="h-4 w-4" />
                    <Input disabled={editedProject.liveDemoUrl === undefined} name="liveDemoUrl" value={editedProject.liveDemoUrl || ''} onChange={(e) => handleLinkChange(e, 'liveDemoUrl')} placeholder="Live Demo URL" />
                </div>
            </div>
        ) : (
            <div className="flex justify-end space-x-3 w-full">
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
            </div>
        )}
      </CardFooter>
    </Card>
  );
}

export default function ProjectsSection() {
    const { isAdminMode } = useAdminMode();
    const [projects, setProjects] = useState(initialProjectsData);

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
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </SectionWrapper>
  );
}
