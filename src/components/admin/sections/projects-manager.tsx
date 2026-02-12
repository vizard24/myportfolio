"use client";

import React, { useState } from 'react';
import { useSimplePortfolio } from '@/context/simple-portfolio-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Project } from '@/data/portfolio-data';

export function ProjectsManager() {
    const { projects, addProject, updateProject, deleteProject } = useSimplePortfolio();
    const { toast } = useToast();

    const [projectForm, setProjectForm] = useState<Partial<Project>>({});
    const [editingProject, setEditingProject] = useState<string | null>(null);
    const [showProjectForm, setShowProjectForm] = useState(false);

    // ... (rest of logic) ...
    // Actually I need to paste the full Logic

    const handleProjectSave = async () => {
        if (!projectForm.title || !projectForm.description) {
            toast({ title: "Error", description: "Title and description are required", variant: "destructive" });
            return;
        }

        try {
            const project: Project = {
                id: editingProject || `project-${Date.now()}`,
                title: projectForm.title,
                description: projectForm.description,
                imageUrl: projectForm.imageUrl || '',
                techStack: projectForm.techStack || [],
                githubUrl: projectForm.githubUrl,
                liveDemoUrl: projectForm.liveDemoUrl,
                // Fill other optional fields with undefined
            };

            if (editingProject) {
                await updateProject(project);
                toast({ title: "Success", description: "Project updated" });
            } else {
                await addProject(project);
                toast({ title: "Success", description: "Project added" });
            }

            setProjectForm({});
            setEditingProject(null);
            setShowProjectForm(false);
        } catch (error) {
            toast({ title: "Error", description: "Failed to save project", variant: "destructive" });
        }
    };

    const handleProjectEdit = (project: Project) => {
        setProjectForm(project);
        setEditingProject(project.id);
        setShowProjectForm(true);
    };

    const handleProjectDelete = async (projectId: string) => {
        try {
            await deleteProject(projectId);
            toast({ title: "Success", description: "Project deleted" });
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete project", variant: "destructive" });
        }
    };


    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Projects ({projects.length})</h2>
                <Button onClick={() => setShowProjectForm(!showProjectForm)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Project
                </Button>
            </div>

            {showProjectForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>{editingProject ? 'Edit Project' : 'Add New Project'}</CardTitle>
                        <CardDescription>
                            {editingProject ? 'Update project information' : 'Enter details for your new project'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="project-title">Project Title *</Label>
                            <Input
                                id="project-title"
                                placeholder="e.g., E-commerce Platform"
                                value={projectForm.title || ''}
                                onChange={(e) => setProjectForm(prev => ({ ...prev, title: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label htmlFor="project-description">Description *</Label>
                            <Textarea
                                id="project-description"
                                placeholder="Describe what this project does, the problem it solves, and key features..."
                                value={projectForm.description || ''}
                                onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                                rows={4}
                            />
                        </div>
                        <div>
                            <Label htmlFor="project-image">Image URL</Label>
                            <Input
                                id="project-image"
                                placeholder="https://example.com/project-screenshot.jpg"
                                value={projectForm.imageUrl || ''}
                                onChange={(e) => setProjectForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label htmlFor="project-tech">Tech Stack (comma-separated)</Label>
                            <Input
                                id="project-tech"
                                placeholder="React, TypeScript, Node.js, MongoDB"
                                value={projectForm.techStack?.map(t => t.name).join(', ') || ''}
                                onChange={(e) => {
                                    const techNames = e.target.value.split(',').map(name => name.trim()).filter(name => name);
                                    const techStack = techNames.map(name => ({ name, iconName: name as any }));
                                    setProjectForm(prev => ({ ...prev, techStack }));
                                }}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="project-github">GitHub URL</Label>
                                <Input
                                    id="project-github"
                                    placeholder="https://github.com/username/project"
                                    value={projectForm.githubUrl || ''}
                                    onChange={(e) => setProjectForm(prev => ({ ...prev, githubUrl: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label htmlFor="project-demo">Live Demo URL</Label>
                                <Input
                                    id="project-demo"
                                    placeholder="https://project-demo.com"
                                    value={projectForm.liveDemoUrl || ''}
                                    onChange={(e) => setProjectForm(prev => ({ ...prev, liveDemoUrl: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 pt-4">
                            <Button onClick={handleProjectSave} disabled={!projectForm.title || !projectForm.description}>
                                <Save className="h-4 w-4 mr-2" />
                                {editingProject ? 'Update Project' : 'Save Project'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setProjectForm({});
                                    setEditingProject(null);
                                    setShowProjectForm(false);
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {projects.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-8">
                            <div className="text-gray-400 mb-4">
                                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Yet</h3>
                            <p className="text-gray-500 mb-4">Click "Add New Project" to showcase your work</p>
                            <Button onClick={() => setShowProjectForm(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Your First Project
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {projects.map((project) => (
                        <Card key={project.id}>
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">{project.title}</h3>
                                        <p className="text-sm text-gray-600 mt-1 mb-3">{project.description}</p>
                                        {project.techStack && project.techStack.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-3">
                                                {project.techStack.map((tech, index) => (
                                                    <Badge key={index} variant="secondary" className="text-xs">
                                                        {tech.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                        <div className="flex gap-2 text-sm">
                                            {project.githubUrl && (
                                                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                    GitHub
                                                </a>
                                            )}
                                            {project.liveDemoUrl && (
                                                <a href={project.liveDemoUrl} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
                                                    Live Demo
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <Button size="sm" variant="outline" onClick={() => handleProjectEdit(project)}>
                                            Edit
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => handleProjectDelete(project.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
