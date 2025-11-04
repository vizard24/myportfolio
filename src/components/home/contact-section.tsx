
"use client";

import React from 'react';
import { SectionWrapper } from '@/components/layout/section-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Mail, Linkedin, MessageSquare } from 'lucide-react';
import { useAdminMode } from '@/context/admin-mode-context';
import { useToast } from '@/hooks/use-toast';
import { personalInfo } from '@/data/portfolio-data';
import { useMessages } from '@/context/message-context';
import { ViewMessagesDialog } from '@/components/admin/view-messages-dialog';

export default function ContactSection() {
    const { isAdminMode } = useAdminMode();
    const { toast } = useToast();
    const { addMessage, hasUnreadMessages } = useMessages();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const message = formData.get('message') as string;

        addMessage({ name, email, message });
        
        toast({
            title: "Message Sent!",
            description: "Thank you for reaching out. Your message has been saved.",
        });
        e.currentTarget.reset();
    };

  return (
    <SectionWrapper 
        id="contact" 
        title="Get In Touch" 
        subtitle="I'm open to discussing new projects, creative ideas, or opportunities to be part of your vision."
        className="bg-secondary/50"
        headerActions={
            isAdminMode ? (
                <ViewMessagesDialog>
                     <Button variant="outline" size="sm" className={hasUnreadMessages ? 'glow-orange' : ''}>
                        <MessageSquare className="mr-2 h-4 w-4" /> Your Messages
                    </Button>
                </ViewMessagesDialog>
            ) : null
        }
    >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <Card className="shadow-lg rounded-xl">
                <CardHeader>
                    <CardTitle className="text-xl font-semibold text-primary">Send me a message</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                             <label htmlFor="name" className="text-sm font-medium text-muted-foreground">Name</label>
                            <Input id="name" name="name" type="text" placeholder="Your Name" required />
                        </div>
                        <div className="space-y-1">
                             <label htmlFor="email" className="text-sm font-medium text-muted-foreground">Email</label>
                            <Input id="email" name="email" type="email" placeholder="Your Email" required />
                        </div>
                        <div className="space-y-1">
                             <label htmlFor="message" className="text-sm font-medium text-muted-foreground">Message</label>
                            <Textarea id="message" name="message" placeholder="Your Message" rows={5} required />
                        </div>
                        <Button type="submit" className="w-full bg-gradient-to-r from-[#FFA07A] to-[#FFDAB9] text-primary-foreground hover:opacity-90 transition-opacity">
                            <Send className="mr-2 h-4 w-4" /> Send Message
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <div className="space-y-6 flex flex-col justify-center">
                <h3 className="text-xl font-semibold text-primary">Contact Information</h3>
                <p className="text-muted-foreground">
                    Feel free to reach out via email or connect with me on social media. I'm always happy to chat!
                </p>
                <div className="space-y-4 text-sm">
                    {personalInfo.contact.email.visible && (
                         <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-primary" />
                            <a href={`mailto:${personalInfo.contact.email.url}`} className="text-foreground hover:text-primary transition-colors">
                                {personalInfo.contact.email.url}
                            </a>
                        </div>
                    )}
                    {personalInfo.contact.linkedin.visible && (
                        <div className="flex items-center gap-3">
                            <Linkedin className="h-5 w-5 text-primary" />
                             <a href={personalInfo.contact.linkedin.url} target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors">
                                Connect on LinkedIn
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </SectionWrapper>
  );
}
