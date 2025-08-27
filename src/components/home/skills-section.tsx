
"use client";

import React, { useState, useEffect } from 'react';
import { techIcons, type SkillCategory, type Skill } from '@/data/portfolio-data';
import SectionWrapper from '@/components/layout/section-wrapper';
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
import { usePortfolioData } from '@/context/portfolio-data-context';

function SkillItem({ skill, isEditing, onUpdate, onDelete }: { skill: Skill; isEditing: boolean; onUpdate: (updatedSkill: Skill) => void; onDelete: (skillId: string) => void; }) {
  const iconName = Object.keys(techIcons).find(key => techIcons[key as keyof typeof techIcons].displayName === (skill.icon as any)?.displayName);
  const Icon = iconName ? techIcons[iconName as keyof typeof techIcons] : null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...skill, name: e.target.value });
  };
  
  const handleLevelChange = (value: number[]) => {
      onUpdate({ ...skill, level: value[0] });
  };

  const handleIconChange = (iconName: string) => {
    const iconKey = iconName as keyof typeof techIcons;
    onUpdate({ ...skill, icon: techIcons[iconKey] });
  };


  return (
    <div className="mb-4 group">
       {isEditing ? (
            <div className="flex items-center gap-2 mb-2">
                <Select value={Object.keys(techIcons).find(key => techIcons[key as keyof typeof techIcons] === skill.icon)} onValueChange={handleIconChange}>
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
      description: "Your changes have been saved locally.",
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
        icon: Smile,
    };
    setEditedCategory(prev => ({ ...prev, skills: [...prev.skills, newSkill]}));
  };

  const currentCategory = isEditing ? editedCategory : initialCategory;

  return (
    <Card className="shadow-lg rounded-xl transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 relative group/card">
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
                onChange={(e) => setEditedCategory(prev => ({...prev, name: e.target.value}))}
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
    const { skills, setSkills } = usePortfolioData();

    const handleAddCategory = () => {
        const newCategory: SkillCategory = {
            id: `cat-${Date.now()}`,
            name: 'New Category',
            skills: [],
        };
        setSkills([...skills, newCategory]);
        toast({
            title: "Category Added",
            description: "A new skill category has been created. Click the edit icon to start adding skills.",
        });
    };

    const handleUpdateCategory = (updatedCategory: SkillCategory) => {
        setSkills(skills.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat));
    };

    const handleDeleteCategory = (categoryId: string) => {
        setSkills(skills.filter(cat => cat.id !== categoryId));
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
        {skills.map((category) => (
          <SkillCategoryCard 
            key={category.id} 
            category={category}
            onSave={handleUpdateCategory}
            onDelete={handleDeleteCategory}
          />
        ))}
      </div>
    </SectionWrapper>
  );
}
