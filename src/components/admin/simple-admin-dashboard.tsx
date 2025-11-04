"use client";

import React, { useState } from 'react';
import { useSimplePortfolio } from '@/context/simple-portfolio-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Save, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { PersonalInfo, Project, Experience, SkillCategory } from '@/data/portfolio-data';

export function SimpleAdminDashboard() {
  const { 
    personalInfo, 
    projects, 
    experience, 
    skills,
    updatePersonalInfo,
    addProject,
    updateProject,
    deleteProject,
    addExperience,
    updateExperience,
    deleteExperience,
    updateSkills,
    loading,
    error,
    refresh
  } = useSimplePortfolio();
  
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('personal');

  // Personal Info Form
  const [personalForm, setPersonalForm] = useState<PersonalInfo>(personalInfo);

  const handlePersonalInfoSave = async () => {
    try {
      await updatePersonalInfo(personalForm);
      toast({ title: "Success", description: "Personal info updated" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update personal info", variant: "destructive" });
    }
  };

  // Project Form
  const [projectForm, setProjectForm] = useState<Partial<Project>>({});
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);

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
        liveDemoUrl: projectForm.liveDemoUrl
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

  // Experience Form
  const [experienceForm, setExperienceForm] = useState<Partial<Experience>>({});
  const [editingExperience, setEditingExperience] = useState<string | null>(null);
  const [showExperienceForm, setShowExperienceForm] = useState(false);

  const handleExperienceSave = async () => {
    if (!experienceForm.title || !experienceForm.institution) {
      toast({ title: "Error", description: "Title and institution are required", variant: "destructive" });
      return;
    }

    try {
      const exp: Experience = {
        id: editingExperience || `exp-${Date.now()}`,
        type: experienceForm.type || 'work',
        title: experienceForm.title,
        institution: experienceForm.institution,
        dateRange: experienceForm.dateRange || '',
        description: experienceForm.description || []
      };

      if (editingExperience) {
        await updateExperience(exp);
        toast({ title: "Success", description: "Experience updated" });
      } else {
        await addExperience(exp);
        toast({ title: "Success", description: "Experience added" });
      }

      setExperienceForm({});
      setEditingExperience(null);
      setShowExperienceForm(false);
    } catch (error) {
      toast({ title: "Error", description: "Failed to save experience", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Simple Admin Dashboard</h1>
        <Button onClick={refresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="projects">Projects ({projects.length})</TabsTrigger>
          <TabsTrigger value="experience">Experience ({experience.length})</TabsTrigger>
          <TabsTrigger value="skills">Skills ({skills.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your basic profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={personalForm.name}
                  onChange={(e) => setPersonalForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={personalForm.title}
                  onChange={(e) => setPersonalForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="introduction">Introduction</Label>
                <Textarea
                  id="introduction"
                  value={personalForm.introduction}
                  onChange={(e) => setPersonalForm(prev => ({ ...prev, introduction: e.target.value }))}
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={personalForm.contact.email.url}
                  onChange={(e) => setPersonalForm(prev => ({ 
                    ...prev, 
                    contact: { 
                      ...prev.contact, 
                      email: { ...prev.contact.email, url: e.target.value }
                    }
                  }))}
                />
              </div>
              <Button onClick={handlePersonalInfoSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Personal Info
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="experience" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Experience ({experience.length})</h2>
            <Button onClick={() => setShowExperienceForm(!showExperienceForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Experience
            </Button>
          </div>

          {showExperienceForm && (
            <Card>
              <CardHeader>
                <CardTitle>{editingExperience ? 'Edit Experience' : 'Add New Experience'}</CardTitle>
                <CardDescription>
                  {editingExperience ? 'Update experience information' : 'Add your work or education experience'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="exp-title">Title *</Label>
                  <Input
                    id="exp-title"
                    placeholder="e.g., Software Developer, Bachelor of Computer Science"
                    value={experienceForm.title || ''}
                    onChange={(e) => setExperienceForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="exp-institution">Institution/Company *</Label>
                  <Input
                    id="exp-institution"
                    placeholder="e.g., Google, University of Montreal"
                    value={experienceForm.institution || ''}
                    onChange={(e) => setExperienceForm(prev => ({ ...prev, institution: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="exp-date">Date Range</Label>
                  <Input
                    id="exp-date"
                    value={experienceForm.dateRange || ''}
                    onChange={(e) => setExperienceForm(prev => ({ ...prev, dateRange: e.target.value }))}
                    placeholder="e.g., Jan 2020 - Dec 2022, Sep 2018 - May 2022"
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="work"
                        checked={experienceForm.type === 'work'}
                        onChange={(e) => setExperienceForm(prev => ({ ...prev, type: e.target.value as 'work' | 'education' }))}
                        className="mr-2"
                      />
                      Work Experience
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="type"
                        value="education"
                        checked={experienceForm.type === 'education'}
                        onChange={(e) => setExperienceForm(prev => ({ ...prev, type: e.target.value as 'work' | 'education' }))}
                        className="mr-2"
                      />
                      Education
                    </label>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleExperienceSave} disabled={!experienceForm.title || !experienceForm.institution}>
                    <Save className="h-4 w-4 mr-2" />
                    {editingExperience ? 'Update Experience' : 'Save Experience'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setExperienceForm({});
                      setEditingExperience(null);
                      setShowExperienceForm(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {experience.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Experience Yet</h3>
                  <p className="text-gray-500 mb-4">Add your work experience and education</p>
                  <Button onClick={() => setShowExperienceForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Experience
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {experience.map((exp) => (
                <Card key={exp.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{exp.title}</h3>
                        <p className="text-sm text-gray-600 font-medium">{exp.institution}</p>
                        <p className="text-sm text-gray-500 mb-2">{exp.dateRange}</p>
                        <Badge variant={exp.type === 'work' ? 'default' : 'secondary'} className="capitalize">
                          {exp.type}
                        </Badge>
                        {exp.description && exp.description.length > 0 && (
                          <div className="mt-3">
                            <ul className="text-sm text-gray-600 space-y-1">
                              {exp.description.map((desc, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="text-gray-400 mr-2">•</span>
                                  {desc}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => {
                            setExperienceForm(exp);
                            setEditingExperience(exp.id);
                            setShowExperienceForm(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteExperience(exp.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Skills Overview</CardTitle>
              <CardDescription>
                Skills are managed as categories. Total skills: {skills.reduce((total, cat) => total + cat.skills.length, 0)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {skills.map((category) => (
                  <div key={category.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-2">{category.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      {category.skills.map((skill) => (
                        <Badge key={skill.id} variant="outline">
                          {skill.name} ({skill.level}%)
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}