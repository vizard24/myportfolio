
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { type Project, techIcons } from '@/data/portfolio-data';
import { SectionWrapper } from '@/components/layout/section-wrapper';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Github, ExternalLink, Pencil, PlusCircle, Save, X, Eye, EyeOff, FileText, PlayCircle, BookMarked, PenTool, Trash2 } from 'lucide-react';
import { useAdminMode } from '@/context/admin-mode-context';
import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useSimplePortfolio } from '@/context/simple-portfolio-context';


type LinkType = 'githubUrl' | 'liveDemoUrl' | 'caseStudyUrl' | 'videoDemoUrl' | 'apiDocsUrl' | 'designFilesUrl';

function ProjectCard({ project: initialProject, onSave, onDelete }: { project: Project; onSave: (updatedProject: Project) => void; onDelete: (projectId: string) => void; }) {
  const { isAdminMode } = useAdminMode();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState(initialProject);
  const [newTech, setNewTech] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAdminMode) {
      setIsEditing(false);
    }
  }, [isAdminMode]);

  useEffect(() => {
    setEditedProject(initialProject);
  }, [initialProject]);

  const handleSave = () => {
    onSave(editedProject);
    setIsEditing(false);
    toast({
      title: "Project Saved",
      description: "Your changes have been saved.",
    });
  };

  const handleCancel = () => {
    setEditedProject(initialProject);
    setIsEditing(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedProject(prev => ({...prev, [name]: value}));
  };

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>, linkType: LinkType) => {
    setEditedProject(prev => ({...prev, [linkType]: e.target.value}));
  };

  const toggleLinkVisibility = (linkType: LinkType) => {
    setEditedProject(prev => {
      const currentUrl = prev[linkType];
      const tempStorageKey = `_${linkType}_hidden`;
      if (currentUrl !== undefined) {
        // @ts-ignore
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
            techStack: [...prev.techStack, { name: newTech, iconName: 'Default' }]
        }));
        setNewTech("");
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedProject(prev => ({
          ...prev,
          imageUrl: reader.result as string,
        }));
        toast({
          title: "Image Updated",
          description: "The project image has been updated. Save to confirm.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageEditClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteClick = () => {
    onDelete(initialProject.id);
    toast({
        title: "Project Deleted",
        description: `"${initialProject.title}" has been removed.`,
        variant: "destructive"
    });
  }
  
  const linkConfig: { key: LinkType, label: string, Icon: React.ElementType }[] = [
    { key: 'githubUrl', label: 'GitHub', Icon: Github },
    { key: 'liveDemoUrl', label: 'Live Demo', Icon: ExternalLink },
    { key: 'caseStudyUrl', label: 'Case Study', Icon: FileText },
    { key: 'videoDemoUrl', label: 'Video Demo', Icon: PlayCircle },
    { key: 'apiDocsUrl', label: 'API Docs', Icon: BookMarked },
    { key: 'designFilesUrl', label: 'Design Files', Icon: PenTool },
  ];

  const currentProject = isEditing ? editedProject : initialProject;

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
             <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" className="h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the project
                    "{initialProject.title}".
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteClick}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
         </div>
      )}
      <div className="relative w-full h-56">
        {currentProject.imageUrl ? (
          <Image
            src={currentProject.imageUrl}
            alt={currentProject.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{objectFit: "cover"}}
            className="transition-transform duration-500 group-hover:scale-105"
            data-ai-hint={currentProject.imageHint || "technology project"}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-gray-300 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-xs text-gray-500">No image</p>
            </div>
          </div>
        )}
        {isEditing && (
          <>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
              accept="image/*"
            />
            <Button
              variant="outline"
              size="icon"
              className="absolute bottom-2 right-2 h-8 w-8 bg-black/50 text-white hover:bg-black/70 hover:text-white"
              onClick={handleImageEditClick}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
      <CardHeader>
        {isEditing ? (
            <Input name="title" value={editedProject.title} onChange={handleInputChange} className="text-xl font-semibold"/>
        ) : (
            <CardTitle className="text-xl font-semibold text-primary">{currentProject.title}</CardTitle>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        {isEditing ? (
            <Textarea name="description" value={editedProject.description} onChange={handleInputChange} rows={4} className="text-sm" />
        ) : (
            <CardDescription className="text-sm text-foreground/80 mb-4 leading-relaxed">
            {currentProject.description}
            </CardDescription>
        )}

        <div className="flex flex-wrap gap-2 my-4">
          {currentProject.techStack.map((tech) => {
            const Icon = tech.iconName ? techIcons[tech.iconName] : null;
            return (
                <Badge key={tech.name} variant="secondary" className="flex items-center gap-1 text-xs group/badge relative">
                  {Icon && <Icon className="h-3 w-3" />}
                  {tech.name}
                  {isEditing && (
                     <button onClick={() => handleTechDelete(tech.name)} className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full h-4 w-4 flex items-center justify-center opacity-0 group-hover/badge:opacity-100 transition-opacity">
                        <X className="h-3 w-3" />
                     </button>
                  )}
                </Badge>
            );
          })}
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
                {linkConfig.map(({key, Icon, label}) => (
                  <div key={key} className="flex items-center gap-2">
                      <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => toggleLinkVisibility(key)}>
                          {editedProject[key] !== undefined ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                      <Icon className="h-4 w-4" />
                      <Input 
                        disabled={editedProject[key] === undefined} 
                        name={key}
                        value={editedProject[key] || ''} 
                        onChange={(e) => handleLinkChange(e, key)} 
                        placeholder={`${label} URL`} />
                  </div>
                ))}
            </div>
        ) : (
            <div className="flex justify-end flex-wrap gap-2 w-full">
                {linkConfig.map(({key, Icon, label}) => {
                    const url = currentProject[key];
                    if (!url) return null;
                    const isPrimary = key === 'liveDemoUrl';
                    return (
                        <Button 
                            key={key} 
                            variant={isPrimary ? 'default' : 'outline'} 
                            size="sm" asChild 
                            className={isPrimary ? "bg-gradient-to-r from-[#FFA07A] to-[#FFDAB9] text-primary-foreground hover:opacity-90 transition-opacity" : ""}
                        >
                            <Link href={url} target="_blank" rel="noopener noreferrer">
                            <Icon className="mr-2 h-4 w-4" /> {label}
                            </Link>
                        </Button>
                    );
                })}
            </div>
        )}
      </CardFooter>
    </Card>
  );
}

export default function ProjectsSection() {
    const { isAdminMode } = useAdminMode();
    const { projects, updateProject, addProject, deleteProject } = useSimplePortfolio();
    const { toast } = useToast();

    // Ensure projects is always an array
    const safeProjects = Array.isArray(projects) ? projects : [];

    const handleAddProject = async () => {
        const newProject: Project = {
            id: `project-${Date.now()}`,
            title: 'New Project',
            description: 'A brief description of your new project.',
            imageUrl: '',
            imageHint: 'new project placeholder',
            techStack: [],
        };
        
        try {
            await addProject(newProject);
            toast({
                title: "Project Added",
                description: "A new project card has been created. Click the edit icon to start adding details.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to add project. Please try again.",
                variant: "destructive",
            });
        }
    }

    const handleUpdateProject = async (updatedProject: Project) => {
        try {
            await updateProject(updatedProject);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update project. Please try again.",
                variant: "destructive",
            });
        }
    }

    const handleDeleteProject = async (projectId: string) => {
        try {
            await deleteProject(projectId);
            toast({
                title: "Project Deleted",
                description: "The project has been removed.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete project. Please try again.",
                variant: "destructive",
            });
        }
    }

  return (
    <SectionWrapper 
      id="projects" 
      title="My Projects" 
      subtitle="A selection of projects I've worked on."
      headerActions={
        isAdminMode ? (
          <Button variant="outline" size="sm" onClick={handleAddProject}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Project
          </Button>
        ) : null
      }
    >
      {safeProjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-medium mb-2">No Projects Yet</h3>
            <p className="text-sm">
              {isAdminMode 
                ? "Click the 'Add Project' button above to showcase your work." 
                : "Projects will appear here once they are added."
              }
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {safeProjects.map((project) => (
            <ProjectCard key={project.id} project={project} onSave={handleUpdateProject} onDelete={handleDeleteProject} />
          ))}
        </div>
      )}
    </SectionWrapper>
  );
}
