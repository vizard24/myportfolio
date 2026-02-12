"use client";

import React, { useState } from 'react';
import { useSimplePortfolio } from '@/context/simple-portfolio-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Experience } from '@/data/portfolio-data';

export function ExperienceManager() {
    const { experience, addExperience, updateExperience, deleteExperience } = useSimplePortfolio();
    const { toast } = useToast();

    const [experienceForm, setExperienceForm] = useState<Partial<Experience>>({});
    const [editingExperience, setEditingExperience] = useState<string | null>(null);
    const [showExperienceForm, setShowExperienceForm] = useState(false);

    const handleExperienceSave = async () => {
        if (!experienceForm.title || !experienceForm.institution) {
            toast({ title: "Error", description: "Title and institution are required", variant: "destructive" });
            return;
        }

        try {
            const exp: Experience = {
                id: editingExperience || `exp-${Date.now()}`,
                type: experienceForm.type || 'work',
                title: experienceForm.title,
                institution: experienceForm.institution,
                dateRange: experienceForm.dateRange || '',
                description: experienceForm.description || [],
                iconName: experienceForm.iconName,
            };

            if (editingExperience) {
                await updateExperience(exp);
                toast({ title: "Success", description: "Experience updated" });
            } else {
                await addExperience(exp);
                toast({ title: "Success", description: "Experience added" });
            }

            setExperienceForm({});
            setEditingExperience(null);
            setShowExperienceForm(false);
        } catch (error) {
            toast({ title: "Error", description: "Failed to save experience", variant: "destructive" });
        }
    };

    const deleteExp = async (id: string) => {
        try {
            await deleteExperience(id);
            toast({ title: "Success", description: "Experience deleted" });
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete experience", variant: "destructive" });
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Experience ({experience.length})</h2>
                <Button onClick={() => setShowExperienceForm(!showExperienceForm)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Experience
                </Button>
            </div>

            {showExperienceForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>{editingExperience ? 'Edit Experience' : 'Add New Experience'}</CardTitle>
                        <CardDescription>
                            {editingExperience ? 'Update experience information' : 'Add your work or education experience'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="exp-title">Title *</Label>
                            <Input
                                id="exp-title"
                                placeholder="e.g., Software Developer, Bachelor of Computer Science"
                                value={experienceForm.title || ''}
                                onChange={(e) => setExperienceForm(prev => ({ ...prev, title: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label htmlFor="exp-institution">Institution/Company *</Label>
                            <Input
                                id="exp-institution"
                                placeholder="e.g., Google, University of Montreal"
                                value={experienceForm.institution || ''}
                                onChange={(e) => setExperienceForm(prev => ({ ...prev, institution: e.target.value }))}
                            />
                        </div>
                        <div>
                            <Label htmlFor="exp-date">Date Range</Label>
                            <Input
                                id="exp-date"
                                value={experienceForm.dateRange || ''}
                                onChange={(e) => setExperienceForm(prev => ({ ...prev, dateRange: e.target.value }))}
                                placeholder="e.g., Jan 2020 - Dec 2022, Sep 2018 - May 2022"
                            />
                        </div>
                        <div>
                            <Label>Type</Label>
                            <div className="flex gap-4 mt-2">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="type"
                                        value="work"
                                        checked={experienceForm.type === 'work'}
                                        onChange={(e) => setExperienceForm(prev => ({ ...prev, type: e.target.value as 'work' | 'education' }))}
                                        className="mr-2"
                                    />
                                    Work Experience
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="type"
                                        value="education"
                                        checked={experienceForm.type === 'education'}
                                        onChange={(e) => setExperienceForm(prev => ({ ...prev, type: e.target.value as 'work' | 'education' }))}
                                        className="mr-2"
                                    />
                                    Education
                                </label>
                            </div>
                        </div>
                        <div className="flex gap-2 pt-4">
                            <Button onClick={handleExperienceSave} disabled={!experienceForm.title || !experienceForm.institution}>
                                <Save className="h-4 w-4 mr-2" />
                                {editingExperience ? 'Update Experience' : 'Save Experience'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setExperienceForm({});
                                    setEditingExperience(null);
                                    setShowExperienceForm(false);
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {experience.length === 0 ? (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-8">
                            <div className="text-gray-400 mb-4">
                                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Experience Yet</h3>
                            <p className="text-gray-500 mb-4">Add your work experience and education</p>
                            <Button onClick={() => setShowExperienceForm(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Your First Experience
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {experience.map((exp) => (
                        <Card key={exp.id}>
                            <CardContent className="pt-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">{exp.title}</h3>
                                        <p className="text-sm text-gray-600 font-medium">{exp.institution}</p>
                                        <p className="text-sm text-gray-500 mb-2">{exp.dateRange}</p>
                                        <Badge variant={exp.type === 'work' ? 'default' : 'secondary'} className="capitalize">
                                            {exp.type}
                                        </Badge>
                                        {exp.description && exp.description.length > 0 && (
                                            <div className="mt-3">
                                                <ul className="text-sm text-gray-600 space-y-1">
                                                    {exp.description.map((desc, index) => (
                                                        <li key={index} className="flex items-start">
                                                            <span className="text-gray-400 mr-2">•</span>
                                                            {desc}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setExperienceForm(exp);
                                                setEditingExperience(exp.id);
                                                setShowExperienceForm(true);
                                            }}
                                        >
                                            Edit
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => deleteExp(exp.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
