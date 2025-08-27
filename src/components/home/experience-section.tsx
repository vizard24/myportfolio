
"use client";

import { experienceData as initialExperienceData, type Experience } from '@/data/portfolio-data';
import SectionWrapper from '@/components/layout/section-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, GraduationCap, Pencil, PlusCircle, Save, Trash2, X } from 'lucide-react';
import { useAdminMode } from '@/context/admin-mode-context';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
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

function ExperienceItem({ item: initialItem, onSave, onDelete }: { item: Experience; onSave: (updatedItem: Experience) => void; onDelete: (itemId: string) => void; }) {
  const { isAdminMode } = useAdminMode();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedItem, setEditedItem] = useState(initialItem);
  
  const Icon = initialItem.icon || (initialItem.type === 'work' ? Briefcase : GraduationCap);

  const handleSave = () => {
    onSave(editedItem);
    setIsEditing(false);
    toast({
      title: "Experience Saved",
      description: "Your changes have been saved locally.",
    });
  };

  const handleCancel = () => {
    setEditedItem(initialItem);
    setIsEditing(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
     if (name === 'description') {
      // Convert textarea string back to string array for list items
      setEditedItem(prev => ({...prev, [name]: value.split('\n')}));
    } else {
      setEditedItem(prev => ({...prev, [name]: value}));
    }
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
    : editedItem.description;


  return (
    <div className="relative flex items-start pl-10 group">
      <span className="absolute left-0 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#FFA07A] to-[#FFDAB9] ring-4 ring-background shadow-md">
        <Icon className="h-5 w-5 text-primary-foreground" />
      </span>
      <Card className="ml-4 flex-1 overflow-hidden shadow-md rounded-lg transition-all duration-300 group-hover:shadow-xl transform group-hover:scale-[1.02] relative">
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
                <Input name="title" value={editedItem.title} onChange={handleInputChange} placeholder="Title (e.g., Senior Software Engineer)" className="text-lg font-semibold h-auto"/>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                  <Input name="institution" value={editedItem.institution} onChange={handleInputChange} placeholder="Company / University" className="flex-1"/>
                  <span className="hidden sm:inline">&bull;</span>
                  <Input name="dateRange" value={editedItem.dateRange} onChange={handleInputChange} placeholder="Date Range (e.g., Jan 2021 - Present)" />
                </div>
              </div>
            ) : (
              <>
                <CardTitle className="text-lg font-semibold text-primary">{initialItem.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{initialItem.institution} &bull; {initialItem.dateRange}</p>
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
          ) : typeof initialItem.description === 'string' ? (
            <p className="text-sm text-foreground/80 leading-relaxed">{initialItem.description}</p>
          ) : (
            <ul className="list-disc list-inside space-y-1 text-sm text-foreground/80 leading-relaxed">
              {initialItem.description.map((desc, index) => (
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
    const [experience, setExperience] = useState<Experience[]>(initialExperienceData);

    const handleAddExperience = () => {
       const newExperience: Experience = {
            id: `exp-${Date.now()}`,
            type: 'work',
            title: 'New Position',
            institution: 'Company Name',
            dateRange: 'Start Date - End Date',
            description: ['Responsibility or achievement.'],
            icon: Briefcase
        };
        setExperience(prev => [newExperience, ...prev]);
        toast({
            title: "Experience Added",
            description: "A new experience card has been created. Click the edit icon to start adding details.",
        });
    }

    const handleUpdateExperience = (updatedItem: Experience) => {
        setExperience(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    }

    const handleDeleteExperience = (itemId: string) => {
        setExperience(prev => prev.filter(item => item.id !== itemId));
    }

  return (
    <SectionWrapper 
      id="experience" 
      title="My Journey" 
      subtitle="Education and professional experience that shaped my career." 
      className="bg-secondary/50"
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
          {experience.map((item) => (
            <ExperienceItem key={item.id} item={item} onSave={handleUpdateExperience} onDelete={handleDeleteExperience} />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
