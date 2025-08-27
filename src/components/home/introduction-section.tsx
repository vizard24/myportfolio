
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { personalInfo as initialPersonalInfo } from '@/data/portfolio-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Github, Linkedin, Mail, Download, Pencil, Save, Upload, Twitter, Instagram } from 'lucide-react';
import SectionWrapper from '@/components/layout/section-wrapper';
import { useAdminMode } from '@/context/admin-mode-context';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { SocialIcons } from '@/components/layout/footer';

export default function IntroductionSection() {
  const { isAdminMode } = useAdminMode();
  const { toast } = useToast();
  const [personalInfo, setPersonalInfo] = useState(initialPersonalInfo);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const [resumeUrl, setResumeUrl] = useState('/resume.pdf');


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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPersonalInfo(prev => ({
          ...prev,
          profilePictureUrl: reader.result as string,
        }));
        toast({
          title: "Image Updated",
          description: "The profile picture has been updated locally.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageEditClick = () => {
    fileInputRef.current?.click();
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        const newResumeUrl = URL.createObjectURL(file);
        setResumeUrl(newResumeUrl);
        toast({
          title: "CV Updated",
          description: "The CV has been updated locally.",
        });
      } else {
         toast({
          title: "Invalid File Type",
          description: "Please upload a PDF file.",
          variant: "destructive",
        });
      }
    }
  };

  const handleResumeEditClick = () => {
    resumeInputRef.current?.click();
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
                  className="absolute bottom-4 right-4 rounded-full h-10 w-10 shadow-lg"
                  onClick={handleImageEditClick}
                  aria-label="Edit profile picture"
                >
                  <Pencil className="h-5 w-5" />
                </Button>
              </>
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
          
          {isEditing && (
            <Card className="mt-6 p-4 space-y-3 bg-primary/5">
                <h3 className="text-sm font-semibold text-primary">Edit Social Links</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                        <label htmlFor="email" className="font-medium text-muted-foreground">Email</label>
                        <Input name="contact.email" id="email" value={personalInfo.contact.email} onChange={handleNestedInputChange} placeholder="your@email.com"/>
                    </div>
                     <div className="space-y-1">
                        <label htmlFor="github" className="font-medium text-muted-foreground">GitHub</label>
                        <Input name="contact.github" id="github" value={personalInfo.contact.github} onChange={handleNestedInputChange} placeholder="https://github.com/user"/>
                    </div>
                     <div className="space-y-1">
                        <label htmlFor="linkedin" className="font-medium text-muted-foreground">LinkedIn</label>
                        <Input name="contact.linkedin" id="linkedin" value={personalInfo.contact.linkedin} onChange={handleNestedInputChange} placeholder="https://linkedin.com/in/user"/>
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="twitter" className="font-medium text-muted-foreground">X / Twitter</label>
                        <Input name="contact.twitter" id="twitter" value={personalInfo.contact.twitter} onChange={handleNestedInputChange} placeholder="https://x.com/user"/>
                    </div>
                     <div className="space-y-1">
                        <label htmlFor="instagram" className="font-medium text-muted-foreground">Instagram</label>
                        <Input name="contact.instagram" id="instagram" value={personalInfo.contact.instagram} onChange={handleNestedInputChange} placeholder="https://instagram.com/user"/>
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="medium" className="font-medium text-muted-foreground">Medium</label>
                        <Input name="contact.medium" id="medium" value={personalInfo.contact.medium} onChange={handleNestedInputChange} placeholder="https://medium.com/@user"/>
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="substack" className="font-medium text-muted-foreground">Substack</label>
                        <Input name="contact.substack" id="substack" value={personalInfo.contact.substack} onChange={handleNestedInputChange} placeholder="https://user.substack.com"/>
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="discord" className="font-medium text-muted-foreground">Discord</label>
                        <Input name="contact.discord" id="discord" value={personalInfo.contact.discord} onChange={handleNestedInputChange} placeholder="Discord username or invite link"/>
                    </div>
                </div>
            </Card>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button asChild size="lg" className="bg-gradient-to-r from-[#FFA07A] to-[#FFDAB9] text-primary-foreground hover:opacity-90 transition-opacity shadow-md">
              <Link href="#projects">
                View Projects
              </Link>
            </Button>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="lg" asChild className="shadow-md">
                    <Link href={resumeUrl} target="_blank" download="resume.pdf">
                        <Download className="mr-2 h-5 w-5" />
                        Download CV
                    </Link>
                </Button>
                {isEditing && (
                    <>
                        <input
                            type="file"
                            ref={resumeInputRef}
                            onChange={handleResumeChange}
                            className="hidden"
                            accept="application/pdf"
                        />
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-11 w-11"
                            onClick={handleResumeEditClick}
                            aria-label="Upload new CV"
                        >
                            <Upload className="h-5 w-5" />
                        </Button>
                    </>
                )}
            </div>
          </div>
          <div className="mt-8 flex justify-center md:justify-start space-x-6">
            <SocialIcons contact={personalInfo.contact} iconClassName="h-7 w-7" />
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}

