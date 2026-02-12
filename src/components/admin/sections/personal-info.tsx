"use client";

import React, { useState, useEffect } from 'react';
import { useSimplePortfolio } from '@/context/simple-portfolio-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { PersonalInfo } from '@/data/portfolio-data';

export function PersonalInfoSection() {
    const { personalInfo, updatePersonalInfo } = useSimplePortfolio();
    const { toast } = useToast();
    const [personalForm, setPersonalForm] = useState<PersonalInfo>(personalInfo);

    useEffect(() => {
        setPersonalForm(personalInfo);
    }, [personalInfo]);

    const handlePersonalInfoSave = async () => {
        try {
            await updatePersonalInfo(personalForm);
            toast({ title: "Success", description: "Personal info updated" });
        } catch (error) {
            toast({ title: "Error", description: "Failed to update personal info", variant: "destructive" });
        }
    };

    return (
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
    );
}
