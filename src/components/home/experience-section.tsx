
"use client";

import React, { useState, useEffect } from 'react';
import type { Experience } from '@/data/portfolio-data';
import { experienceIcons, experienceIconNames } from '@/data/portfolio-data';
import { SectionWrapper } from '@/components/layout/section-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, GraduationCap, Pencil, PlusCircle, Save, Trash2, X, Smile } from 'lucide-react';
import { useAdminMode } from '@/context/admin-mode-context';
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useSimplePortfolio } from '@/context/simple-portfolio-context';


const iconColorClasses: Record<string, string> = {
  Briefcase: 'bg-blue-500',
  GraduationCap: 'bg-green-500',
  Award: 'bg-yellow-500',
  Building: 'bg-indigo-500',
  CodeXml: 'bg-purple-500',
  Default: 'bg-gradient-to-br from-[#FFA07A] to-[#FFDAB9]',
};


function ExperienceItem({ item: initialItem, onSave, onDelete }: { item: Experience; onSave: (updatedItem: Experience) => void; onDelete: (itemId: string) => void; }) {
  const { isAdminMode } = useAdminMode();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState(initialItem);

  useEffect(() => {
    if (!isAdminMode) {
      setIsEditing(false);
    }
  }, [isAdminMode]);

  useEffect(() => {
    setEditedItem(initialItem);
  }, [initialItem]);

  const Icon = experienceIcons[editedItem.iconName || 'Briefcase'] || (editedItem.type === 'work' ? Briefcase : GraduationCap);
  const iconColor = iconColorClasses[editedItem.iconName || 'Default'] || iconColorClasses.Default;

  const handleSave = () => {
    onSave(editedItem);
    setIsEditing(false);
    toast({
      title: "Experience Saved",
      description: "Your changes have been saved.",
    });
  };

  const handleCancel = () => {
    setEditedItem(initialItem);
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'description') {
      setEditedItem(prev => ({ ...prev, [name]: value.split('\n') }));
    } else {
      setEditedItem(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleIconChange = (iconName: string) => {
    setEditedItem(prev => ({ ...prev, iconName }));
  };

  const handleDeleteClick = () => {
    onDelete(initialItem.id);
    toast({
      title: "Experience Deleted",
      description: `"${initialItem.title}" has been removed.`,
      variant: "destructive"
    });
  }

  const descriptionAsString = Array.isArray(editedItem.description)
    ? editedItem.description.join('\n')
    : '';

  const currentItem = isEditing ? editedItem : initialItem;

  return (
    <div className="relative flex items-start pl-10 group">
      <span className={cn("absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-background shadow-md", iconColor)}>
        <Icon className="h-5 w-5 text-primary-foreground" />
      </span>
      <Card className="ml-4 flex-1 overflow-hidden transition-all duration-300 transform group-hover:scale-[1.02] relative">
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
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the entry for "{initialItem.title}".
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
            <div className="space-y-2">
              <div className='flex items-center gap-2'>
                <Select value={editedItem.iconName} onValueChange={handleIconChange}>
                  <SelectTrigger className="w-20 h-10">
                    <SelectValue placeholder="Icon" >
                      {experienceIcons[editedItem.iconName || 'Briefcase'] ?
                        React.createElement(experienceIcons[editedItem.iconName || 'Briefcase'], { className: 'h-5 w-5' }) :
                        <Smile className="h-5 w-5" />}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {experienceIconNames.map(name => {
                      const IconComponent = experienceIcons[name];
                      return (
                        <SelectItem key={name} value={name}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-5 w-5" />
                            <span>{name}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <Input name="title" value={editedItem.title} onChange={handleInputChange} placeholder="Title (e.g., Senior Software Engineer)" className="text-lg font-semibold h-auto" />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                <Input name="institution" value={editedItem.institution} onChange={handleInputChange} placeholder="Company / University" className="flex-1" />
                <span className="hidden sm:inline">&bull;</span>
                <Input name="dateRange" value={editedItem.dateRange} onChange={handleInputChange} placeholder="Date Range (e.g., Jan 2021 - Present)" />
              </div>
            </div>
          ) : (
            <>
              <CardTitle className="text-lg font-semibold text-primary">{currentItem.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{currentItem.institution} &bull; {currentItem.dateRange}</p>
            </>
          )}
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea
              name="description"
              value={descriptionAsString}
              onChange={handleInputChange}
              rows={4}
              placeholder="Enter description points, one per line."
              className="text-sm"
            />
          ) : (
            <ul className="list-disc list-inside space-y-1 text-sm text-foreground/80 leading-relaxed">
              {currentItem.description.map((desc, index) => (
                <li key={index}>{desc}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function ExperienceSection() {
  const { isAdminMode } = useAdminMode();
  const { toast } = useToast();
  const { experience, updateExperience, addExperience, deleteExperience } = useSimplePortfolio();

  // Ensure experience is always an array
  const safeExperience = Array.isArray(experience) ? experience : [];

  const handleAddExperience = async () => {
    const newExperience: Experience = {
      id: `exp-${Date.now()}`,
      type: 'work',
      title: 'New Position',
      institution: 'Company Name',
      dateRange: 'Start Date - End Date',
      description: ['Responsibility or achievement.'],
      iconName: 'Briefcase'
    };

    try {
      await addExperience(newExperience);
      toast({
        title: "Experience Added",
        description: "A new experience card has been created. Click the edit icon to start adding details.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add experience. Please try again.",
        variant: "destructive",
      });
    }
  }

  const handleUpdateExperience = async (updatedItem: Experience) => {
    try {
      await updateExperience(updatedItem);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update experience. Please try again.",
        variant: "destructive",
      });
    }
  }

  const handleDeleteExperience = async (itemId: string) => {
    try {
      await deleteExperience(itemId);
      toast({
        title: "Experience Deleted",
        description: "The experience has been removed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete experience. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <SectionWrapper
      id="experience"
      title="My Journey"
      subtitle="Education and professional experience that shaped my career."
      headerActions={
        isAdminMode ? (
          <Button variant="outline" size="sm" onClick={handleAddExperience}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Experience
          </Button>
        ) : null
      }
    >
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border hidden md:block" aria-hidden="true"></div>

        <div className="space-y-12">
          {safeExperience.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
                <h3 className="text-lg font-medium mb-2">No Experience Yet</h3>
                <p className="text-sm">
                  {isAdminMode
                    ? "Click the 'Add Experience' button above to add your professional journey."
                    : "Experience will appear here once it is added."
                  }
                </p>
              </div>
            </div>
          ) : (
            safeExperience.map((item) => (
              <ExperienceItem key={item.id} item={item} onSave={handleUpdateExperience} onDelete={handleDeleteExperience} />
            ))
          )}
        </div>
      </div>
    </SectionWrapper>
  );
}
