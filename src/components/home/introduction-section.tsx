
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { personalInfo as initialPersonalInfo } from '@/data/portfolio-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Github, Linkedin, Mail, Download, Pencil, Save } from 'lucide-react';
import SectionWrapper from '@/components/layout/section-wrapper';
import { useAdminMode } from '@/context/admin-mode-context';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function IntroductionSection() {
  const { isAdminMode } = useAdminMode();
  const { toast } = useToast();
  const [personalInfo, setPersonalInfo] = useState(initialPersonalInfo);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isAdminMode) {
      setIsEditing(false);
      // Optionally reset changes if not saved
      // setPersonalInfo(initialPersonalInfo);
    }
  }, [isAdminMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNestedInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const [parent, child] = name.split('.');
    setPersonalInfo(prev => ({
      ...prev,
      [parent]: {
        // @ts-ignore
        ...prev[parent],
        [child]: value,
      },
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save the data to a backend/CMS
    console.log("Saving data:", personalInfo);
    toast({
      title: "Content Saved",
      description: "Your changes have been saved locally.",
    });
  };

  return (
    <SectionWrapper id="home" className="bg-secondary/50">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-12 items-center">
        <div className="md:col-span-2 flex justify-center">
          <div className="relative">
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
            {isAdminMode && (
              <Button variant="outline" size="icon" className="absolute bottom-4 right-4 rounded-full h-10 w-10 shadow-lg">
                <Pencil className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
        <div className="md:col-span-3 text-center md:text-left">
          {isAdminMode && !isEditing && (
            <div className="flex justify-center md:justify-start gap-2 mb-4">
               <Button onClick={() => setIsEditing(true)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit Intro
              </Button>
            </div>
          )}
           {isEditing && (
            <div className="flex justify-center md:justify-start gap-2 mb-4">
              <Button onClick={handleSave} >
                <Save className="mr-2 h-4 w-4" /> Save
              </Button>
               <Button onClick={() => {setIsEditing(false); setPersonalInfo(initialPersonalInfo);}} variant="ghost">
                Cancel
              </Button>
            </div>
          )}
          
          <div className="relative">
            {isEditing ? (
              <Input 
                name="name" 
                value={personalInfo.name} 
                onChange={handleInputChange}
                className="text-4xl font-bold tracking-tight text-primary sm:text-5xl lg:text-6xl mb-4 h-auto"
              />
            ) : (
              <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl lg:text-6xl">
                {personalInfo.name}
              </h1>
            )}
          </div>

          <div className="relative mt-4">
            {isEditing ? (
              <Input 
                name="title" 
                value={personalInfo.title} 
                onChange={handleInputChange}
                className="text-xl text-muted-foreground sm:text-2xl"
              />
            ) : (
              <p className="text-xl text-muted-foreground sm:text-2xl">
                {personalInfo.title}
              </p>
            )}
          </div>
          
          <div className="relative mt-6">
            {isEditing ? (
              <Textarea 
                name="introduction" 
                value={personalInfo.introduction} 
                onChange={handleInputChange} 
                className="text-base leading-relaxed text-foreground/80"
                rows={4}
              />
            ) : (
              <p className="text-base leading-relaxed text-foreground/80">
                {personalInfo.introduction}
              </p>
            )}
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button asChild size="lg" className="bg-gradient-to-r from-[#FFA07A] to-[#FFDAB9] text-primary-foreground hover:opacity-90 transition-opacity shadow-md">
              <Link href="#projects">
                View Projects
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="shadow-md">
              <Link href="/resume.pdf" target="_blank" download>
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
