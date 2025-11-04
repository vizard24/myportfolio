"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Download, Pencil, Save, Upload, Eye, EyeOff, MessageSquare, X, Loader } from 'lucide-react';
import { useAdminMode } from '@/context/admin-mode-context';
import { AnimatedSection } from '@/components/ui/animated-section';
import { IntroSkeleton } from '@/components/ui/loading-skeletons';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { SocialIcons } from '@/components/layout/footer';
import { useMessages } from '@/context/message-context';
import { ViewMessagesDialog } from '@/components/admin/view-messages-dialog';
import { useSimplePortfolio } from '@/context/simple-portfolio-context';

export default function IntroductionSection() {
  const { isAdminMode } = useAdminMode();
  const { hasUnreadMessages } = useMessages();
  const { toast } = useToast();
  const { personalInfo, updatePersonalInfo, loading: isPortfolioLoading, saving } = useSimplePortfolio();
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
    if (parent === 'contact' && child) {
      setEditedInfo(prev => ({
        ...prev,
        contact: {
          ...prev.contact,
          [child]: { ...prev.contact[child as keyof typeof prev.contact], url: value },
        },
      }));
    }
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

  const handleSave = async () => {
    try {
      await updatePersonalInfo(editedInfo);
      setIsEditing(false);
      toast({
        title: "Content Saved",
        description: "Your changes have been saved.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedInfo(personalInfo);
  };

  if (isPortfolioLoading && isAdminMode) {
    return (
      <section id="home" className="py-16 md:py-24 bg-secondary/50 dark:bg-secondary/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-xl">
          <IntroSkeleton />
        </div>
      </section>
    );
  }

  return (
    <section id="home" className="py-12 sm:py-16 lg:py-24 bg-secondary/50 dark:bg-secondary/20">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 max-w-7xl">
        <div className="flex flex-col lg:flex-row lg:items-center gap-12 lg:gap-16">
          <AnimatedSection animation="scale-up" delay={200}>
            <div className="flex justify-center lg:flex-shrink-0">
              <div className="relative">
                <Card className="w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 rounded-full overflow-hidden shadow-xl transform transition-all duration-500 hover:scale-105 hover:shadow-2xl dark:shadow-2xl dark:shadow-primary/20">
                  {personalInfo.profilePictureUrl ? (
                    <Image
                      src={personalInfo.profilePictureUrl}
                      alt={personalInfo.name}
                      width={288}
                      height={288}
                      priority
                      className="object-cover w-full h-full"
                      data-ai-hint={personalInfo.profilePictureHint}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <span className="text-6xl font-bold text-primary/60">
                        {personalInfo.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </Card>
                {isAdminMode && (
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full shadow-lg"
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Edit profile picture"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
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
                  }}
                  className="hidden"
                />
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={400}>
            <div className="flex-1 space-y-6 text-center lg:text-left min-w-0 mt-8 lg:mt-0 max-w-2xl lg:max-w-none">
              {isEditing ? (
                <div className="space-y-4">
                  <Input
                    name="name"
                    value={editedInfo.name}
                    onChange={handleInputChange}
                    className="text-2xl font-bold"
                    placeholder="Your Name"
                  />
                  <Input
                    name="title"
                    value={editedInfo.title}
                    onChange={handleInputChange}
                    className="text-xl"
                    placeholder="Your Title"
                  />
                  <Textarea
                    name="introduction"
                    value={editedInfo.introduction}
                    onChange={handleInputChange}
                    className="min-h-[120px]"
                    placeholder="Your introduction..."
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? <Loader className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      Save
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-primary">
                      {personalInfo.name}
                    </h1>
                    {isAdminMode && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                        aria-label="Edit introduction"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <h2 className="text-xl md:text-2xl text-muted-foreground">
                    {personalInfo.title}
                  </h2>
                  <p className="text-lg leading-relaxed text-muted-foreground max-w-2xl">
                    {personalInfo.introduction}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-all duration-300">
                  <Link href={resumeUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="h-5 w-5 mr-2" />
                    Download CV
                  </Link>
                </Button>
                {isAdminMode && hasUnreadMessages && (
                  <ViewMessagesDialog>
                    <Button variant="outline" size="lg" className="relative">
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Messages
                      <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                        !
                      </span>
                    </Button>
                  </ViewMessagesDialog>
                )}
              </div>

              <div className="mt-8 flex justify-center lg:justify-start space-x-6">
                <SocialIcons contact={personalInfo.contact} iconClassName="h-7 w-7" />
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}