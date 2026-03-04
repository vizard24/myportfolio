"use client";

import React, { useState } from 'react';
import { useSimplePortfolio } from '@/context/simple-portfolio-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Wand2, User, Briefcase, GraduationCap, Code2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { PersonalInfoSection } from './personal-info';
import { ProjectsManager } from './projects-manager';
import { ExperienceManager } from './experience-manager';
import { SkillsManager } from './skills-manager';

export function ProfileManager() {
    const { personalInfo, addExperience, addProject, updateSkills, skills } = useSimplePortfolio();
    const { toast } = useToast();
    const [isExtracting, setIsExtracting] = useState(false);
    const [selectedPositionId, setSelectedPositionId] = useState<string>('');

    const targetPositions: { id: string; title: string; }[] = (personalInfo as any)?.targetPositions || [];

    const handleExtractFromResume = async () => {
        if (!selectedPositionId) {
            toast({ title: "Select a position", description: "Please select a target position to extract the resume from.", variant: "destructive" });
            return;
        }

        const positionResumes = (personalInfo as any).positionResumes as Record<string, { content: string }[]> | undefined;
        let resumeContent = '';

        if (positionResumes && positionResumes[selectedPositionId] && positionResumes[selectedPositionId].length > 0) {
            resumeContent = positionResumes[selectedPositionId][0].content;
        } else if (targetPositions.length > 0 && selectedPositionId === targetPositions[0].id) {
            // Fallback to legacy resumeSummaries if it's the very first targeted position
            const legacy = personalInfo.resumeSummaries || [];
            if (legacy.length > 0) resumeContent = legacy[0].content;
        }

        if (!resumeContent) {
            toast({ title: "No Base Resume", description: "No base resume found for this position in the App Tracker.", variant: "destructive" });
            return;
        }

        setIsExtracting(true);

        try {
            // --- Simulated Heuristic Extraction (Could be replaced with AI Action later) ---
            // Just as an immediate convenience, we'll extract simple experience blocks from markdown if possible
            const lines = resumeContent.split('\n');
            let currentSection = '';
            let currentExp: any = null;

            for (const line of lines) {
                const l = line.trim().toLowerCase();
                if (l.includes('experience') && line.startsWith('#')) currentSection = 'experience';
                else if (l.includes('education') && line.startsWith('#')) currentSection = 'education';
                else if (l.includes('skills') && line.startsWith('#')) currentSection = 'skills';
                else if (l.includes('projects') && line.startsWith('#')) currentSection = 'projects';

                // Basic simplistic parse for demo
                if (currentSection === 'experience' && line.startsWith('### ')) {
                    if (currentExp) {
                        await addExperience({ id: Date.now().toString() + Math.random(), type: 'work', title: currentExp.title, institution: currentExp.company, dateRange: currentExp.date, description: currentExp.desc, iconName: 'Briefcase' });
                    }
                    const parts = line.replace('###', '').split('|');
                    currentExp = { title: parts[0]?.trim() || 'Role', company: parts[1]?.trim() || 'Company', date: parts[2]?.trim() || 'Date', desc: [] };
                } else if (currentSection === 'experience' && line.startsWith('-') && currentExp) {
                    currentExp.desc.push(line.replace('-', '').trim());
                }
            }
            if (currentExp && currentExp.title) {
                await addExperience({ id: Date.now().toString() + Math.random(), type: 'work', title: currentExp.title, institution: currentExp.company, dateRange: currentExp.date, description: currentExp.desc, iconName: 'Briefcase' });
            }

            toast({
                title: "Extraction Complete",
                description: "Data successfully parsed from base resume into Portfolio sections.",
            });

        } catch (e: any) {
            toast({ title: "Failed to extract", description: e.message, variant: "destructive" });
        } finally {
            setIsExtracting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Public Profile</h2>
                    <p className="text-muted-foreground mt-1">Configure all information visible on your portfolio.</p>
                </div>

                <Card className="w-full md:w-[400px] border-primary/20 bg-primary/5">
                    <CardContent className="p-4 flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                            <Wand2 className="w-4 h-4 text-primary" />
                            <span className="text-sm font-semibold">Auto-fill from Base Resume</span>
                        </div>
                        <div className="flex gap-2">
                            <Select value={selectedPositionId} onValueChange={setSelectedPositionId}>
                                <SelectTrigger className="flex-1 bg-background text-xs">
                                    <SelectValue placeholder="Select target role..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {targetPositions.map(pos => (
                                        <SelectItem key={pos.id} value={pos.id} className="text-xs">
                                            {pos.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button size="sm" onClick={handleExtractFromResume} disabled={isExtracting || !selectedPositionId}>
                                {isExtracting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Fill"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-8">
                    <TabsTrigger value="personal" className="flex items-center gap-2"><User className="w-4 h-4" /> <span className="hidden sm:inline">Personal</span></TabsTrigger>
                    <TabsTrigger value="projects" className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> <span className="hidden sm:inline">Projects</span></TabsTrigger>
                    <TabsTrigger value="experience" className="flex items-center gap-2"><GraduationCap className="w-4 h-4" /> <span className="hidden sm:inline">Experience</span></TabsTrigger>
                    <TabsTrigger value="skills" className="flex items-center gap-2"><Code2 className="w-4 h-4" /> <span className="hidden sm:inline">Skills</span></TabsTrigger>
                </TabsList>

                <TabsContent value="personal" className="m-0"><PersonalInfoSection /></TabsContent>
                <TabsContent value="projects" className="m-0"><ProjectsManager /></TabsContent>
                <TabsContent value="experience" className="m-0"><ExperienceManager /></TabsContent>
                <TabsContent value="skills" className="m-0"><SkillsManager /></TabsContent>
            </Tabs>

        </div>
    );
}
