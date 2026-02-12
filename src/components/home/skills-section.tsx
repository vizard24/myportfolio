
"use client";

import React, { useState, useEffect } from 'react';
import { techIcons, type SkillCategory, type Skill } from '@/data/portfolio-data';
import { SectionWrapper } from '@/components/layout/section-wrapper';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAdminMode } from '@/context/admin-mode-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Pencil, PlusCircle, Save, X, Trash2, Smile } from 'lucide-react';
import { useSimplePortfolio } from '@/context/simple-portfolio-context';
import type { LucideIcon } from 'lucide-react';

function SkillItem({ skill, isEditing, onUpdate, onDelete }: { skill: Skill; isEditing: boolean; onUpdate: (updatedSkill: Skill) => void; onDelete: (skillId: string) => void; }) {
  const Icon = skill.iconName ? techIcons[skill.iconName] : null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...skill, name: e.target.value });
  };

  const handleLevelChange = (value: number[]) => {
    onUpdate({ ...skill, level: value[0] });
  };

  const handleIconChange = (iconName: string) => {
    onUpdate({ ...skill, iconName: iconName as keyof typeof techIcons });
  };


  return (
    <div className="mb-4 group">
      {isEditing ? (
        <div className="flex items-center gap-2 mb-2">
          <Select value={skill.iconName?.toString() || ''} onValueChange={handleIconChange}>
            <SelectTrigger className="w-12 h-8">
              <SelectValue>
                {Icon ? <Icon className="h-4 w-4" /> : <Smile className="h-4 w-4" />}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Object.entries(techIcons).map(([name, IconComponent]) => (
                <SelectItem key={name} value={name}>
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4" />
                    <span>{name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input value={skill.name} onChange={handleNameChange} className="h-8 text-sm" />
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => onDelete(skill.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center gap-2">
            {Icon && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Icon className="h-5 w-5 text-primary" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{skill.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <span className="text-sm font-medium text-foreground">{skill.name}</span>
          </div>
          <span className="text-xs text-muted-foreground">{skill.level}%</span>
        </div>
      )}

      {isEditing ? (
        <div className="flex items-center gap-2">
          <Slider value={[skill.level]} onValueChange={handleLevelChange} className="flex-1" />
          <span className="text-xs text-muted-foreground w-8 text-right">{skill.level}%</span>
        </div>
      ) : (
        <Progress value={skill.level} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-[#FFA07A] [&>div]:to-[#FFDAB9]" />
      )}
    </div>
  );
}

function SkillCategoryCard({ category: initialCategory, onSave, onDelete }: { category: SkillCategory; onSave: (updatedCategory: SkillCategory) => void; onDelete: (categoryId: string) => void; }) {
  const { isAdminMode } = useAdminMode();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedCategory, setEditedCategory] = useState(initialCategory);

  useEffect(() => {
    if (!isAdminMode) {
      setIsEditing(false);
    }
  }, [isAdminMode]);

  useEffect(() => {
    setEditedCategory(initialCategory);
  }, [initialCategory]);

  const handleSave = () => {
    onSave(editedCategory);
    setIsEditing(false);
    toast({
      title: "Skill Category Saved",
      description: "Your changes have been saved.",
    });
  };

  const handleCancel = () => {
    setEditedCategory(initialCategory);
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    onDelete(initialCategory.id);
    toast({
      title: "Category Deleted",
      description: `"${initialCategory.name}" has been removed.`,
      variant: "destructive"
    });
  };

  const handleSkillUpdate = (updatedSkill: Skill) => {
    setEditedCategory(prev => ({
      ...prev,
      skills: prev.skills.map(s => s.id === updatedSkill.id ? updatedSkill : s)
    }));
  };

  const handleSkillDelete = (skillId: string) => {
    setEditedCategory(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s.id !== skillId)
    }));
  };

  const handleAddSkill = () => {
    const newSkill: Skill = {
      id: `skill-${Date.now()}`,
      name: 'New Skill',
      level: 50,
      iconName: 'Default',
    };
    setEditedCategory(prev => ({ ...prev, skills: [...prev.skills, newSkill] }));
  };

  const currentCategory = isEditing ? editedCategory : initialCategory;

  return (
    <Card className="transform transition-all duration-300 hover:-translate-y-1 relative group/card">
      {isAdminMode && !isEditing && (
        <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-primary z-10" onClick={() => setIsEditing(true)}>
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
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the "{initialCategory.name}" category and all its skills.
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
      <CardHeader>
        {isEditing ? (
          <Input
            value={editedCategory.name}
            onChange={(e) => setEditedCategory(prev => ({ ...prev, name: e.target.value }))}
            className="text-xl font-semibold text-center h-auto"
          />
        ) : (
          <CardTitle className="text-xl font-semibold text-primary text-center">{currentCategory.name}</CardTitle>
        )}
      </CardHeader>
      <CardContent>
        {currentCategory.skills.map((skill) => (
          <SkillItem key={skill.id} skill={skill} isEditing={isEditing} onUpdate={handleSkillUpdate} onDelete={handleSkillDelete} />
        ))}
        {isEditing && (
          <Button variant="outline" size="sm" className="w-full mt-4" onClick={handleAddSkill}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Skill
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function SkillsSection() {
  const { isAdminMode } = useAdminMode();
  const { toast } = useToast();
  const { skills, updateSkills } = useSimplePortfolio();

  // Ensure skills is always an array
  const safeSkills = Array.isArray(skills) ? skills : [];

  const handleAddCategory = async () => {
    const newCategory: SkillCategory = {
      id: `cat-${Date.now()}`,
      name: 'New Category',
      skills: [],
    };

    try {
      await updateSkills([...safeSkills, newCategory]);
      toast({
        title: "Category Added",
        description: "A new skill category has been created. Click the edit icon to start adding skills.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add skill category. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCategory = async (updatedCategory: SkillCategory) => {
    try {
      await updateSkills(safeSkills.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update skill category. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await updateSkills(safeSkills.filter(cat => cat.id !== categoryId));
      toast({
        title: "Category Deleted",
        description: "The skill category has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete skill category. Please try again.",
        variant: "destructive",
      });
    }
  };


  return (
    <SectionWrapper
      id="skills"
      title="Technical Skills"
      subtitle="A snapshot of my expertise across various technologies."
      headerActions={
        isAdminMode ? (
          <Button variant="outline" size="sm" onClick={handleAddCategory}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Skill Category
          </Button>
        ) : null
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {safeSkills.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-muted-foreground mb-4">
              <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h3 className="text-lg font-medium mb-2">No Skills Yet</h3>
              <p className="text-sm">
                {isAdminMode
                  ? "Click the 'Add Skill Category' button above to showcase your expertise."
                  : "Skills will appear here once they are added."
                }
              </p>
            </div>
          </div>
        ) : (
          safeSkills.map((category) => (
            <SkillCategoryCard
              key={category.id}
              category={category}
              onSave={handleUpdateCategory}
              onDelete={handleDeleteCategory}
            />
          ))
        )}
      </div>
    </SectionWrapper>
  );
}
