
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Download, Pencil, Save, Upload, Eye, EyeOff, MessageSquare } from 'lucide-react';
import SectionWrapper from '@/components/layout/section-wrapper';
import { useAdminMode } from '@/context/admin-mode-context';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { SocialIcons } from '@/components/layout/footer';
import { useMessages } from '@/context/message-context';
import { ViewMessagesDialog } from '@/components/admin/view-messages-dialog';
import { usePortfolioData } from '@/context/portfolio-data-context';

export default function IntroductionSection() {
  const { isAdminMode } = useAdminMode();
  const { hasUnreadMessages } = useMessages();
  const { toast } = useToast();
  const { personalInfo, setPersonalInfo, resetPersonalInfo } = usePortfolioData();
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);
  const [resumeUrl, setResumeUrl] = useState('/resume.pdf');
  const [editedInfo, setEditedInfo] = useState(personalInfo);


  useEffect(() => {
    if (!isAdminMode) {
      setIsEditing(false);
    }
  }, [isAdminMode]);

  useEffect(() => {
    setEditedInfo(personalInfo);
  }, [personalInfo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedInfo(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNestedInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const [parent, child] = name.split('.');
    setEditedInfo(prev => ({
      ...prev,
      // @ts-ignore
      [parent]: {
        // @ts-ignore
        ...prev[parent],
        [child]: { ...prev[parent][child], url: value },
      },
    }));
  };

  const toggleLinkVisibility = (linkKey: keyof typeof personalInfo.contact) => {
    setEditedInfo(prev => ({
        ...prev,
        contact: {
            ...prev.contact,
            [linkKey]: {
                ...prev.contact[linkKey],
                visible: !prev.contact[linkKey].visible,
            },
        },
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    setPersonalInfo(editedInfo);
    toast({
      title: "Content Saved",
      description: "Your changes have been saved.",
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedInfo(personalInfo);
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedInfo(prev => ({
          ...prev,
          profilePictureUrl: reader.result as string,
        }));
        toast({
          title: "Image Updated",
          description: "The profile picture has been updated. Save to confirm.",
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
          description: "The CV has been updated locally for this session.",
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
  
  const socialLinkConfig = [
    { key: 'email', label: 'Email' },
    { key: 'github', label: 'GitHub' },
    { key: 'linkedin', label: 'LinkedIn' },
    { key: 'twitter', label: 'X / Twitter' },
    { key: 'instagram', label: 'Instagram' },
    { key: 'medium', label: 'Medium' },
    { key: 'substack', label: 'Substack' },
    { key: 'discord', label: 'Discord' },
  ];


  return (
    <SectionWrapper id="home" className="bg-secondary/50">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-12 items-center">
        <div className="md:col-span-2 flex justify-center">
          <div className="relative">
            <Card className="w-64 h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 rounded-full overflow-hidden shadow-xl transform transition-all duration-500 hover:scale-105">
              <Image
                src={isEditing ? editedInfo.profilePictureUrl : personalInfo.profilePictureUrl}
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
               <Button onClick={handleCancel} variant="ghost">
                Cancel
              </Button>
            </div>
          )}
          
          <div className="relative">
            {isEditing ? (
              <Input 
                name="name" 
                value={editedInfo.name} 
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
                value={editedInfo.title} 
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
                value={editedInfo.introduction} 
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
                    {socialLinkConfig.map(({ key, label }) => {
                       const linkKey = key as keyof typeof editedInfo.contact;
                       const link = editedInfo.contact[linkKey];
                       return (
                           <div className="space-y-1" key={key}>
                               <label htmlFor={key} className="font-medium text-muted-foreground">{label}</label>
                               <div className="flex items-center gap-2">
                                   <Button size="icon" variant="outline" className="h-9 w-9" onClick={() => toggleLinkVisibility(linkKey)}>
                                     {link.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                   </Button>
                                   <Input 
                                       name={`contact.${key}`}
                                       id={key}
                                       value={link.url}
                                       onChange={handleNestedInputChange}
                                       placeholder={key === 'email' ? "your@email.com" : `https://${key}.com/user`}
                                       disabled={!link.visible}
                                   />
                               </div>
                           </div>
                       );
                    })}
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
                {isAdminMode && (
                    <ViewMessagesDialog>
                        <Button variant="outline" size="lg" className={hasUnreadMessages ? 'glow-orange' : ''}>
                            <MessageSquare className="mr-2 h-5 w-5" />
                            Messages
                        </Button>
                    </ViewMessagesDialog>
                )}
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
