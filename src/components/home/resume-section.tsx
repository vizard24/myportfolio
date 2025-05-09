
"use client";

import { useState, useEffect, useCallback } from 'react';
import { personalInfo, projectsData, experienceData, skillsData, resumePitchSpecializations as specializations } from '@/data/portfolio-data';
import SectionWrapper from '@/components/layout/section-wrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateTailoredResume, type TailoredResumeInput, type TailoredResumeOutput } from '@/ai/flows/tailored-resume-generator';
import { Loader2, AlertTriangle, FileText } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// Helper to strip complex objects for AI input, like Icon components
const stripFunctionsAndIcons = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(item => stripFunctionsAndIcons(item));
  } else if (typeof data === 'object' && data !== null) {
    const newData: any = {};
    for (const key in data) {
      if (typeof data[key] !== 'function' && key !== 'icon' && key !== 'imageHint' && key !== 'imageUrl') { // also remove imageUrl and imageHint as they are not needed for resume text
        newData[key] = stripFunctionsAndIcons(data[key]);
      } else if (key === 'icon' && data[key] && data[key].displayName) {
        // Keep icon name if it's a Lucide icon-like object, but it's safer to remove for text generation
        // For now, simply remove
      } else if (typeof data[key] !== 'function') {
         newData[key] = data[key]; // Keep other non-function properties
      }
    }
    return newData;
  }
  return data;
};


export default function ResumeSection() {
  const [activeSpecialization, setActiveSpecialization] = useState<string>(specializations[0]);
  const [generatedResumes, setGeneratedResumes] = useState<Record<string, string>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [errorStates, setErrorStates] = useState<Record<string, string | null>>({});
  const { toast } = useToast();

  const handleGenerateResume = useCallback(async (specialization: string) => {
    if (!specialization || generatedResumes[specialization] || loadingStates[specialization]) {
      return;
    }

    setLoadingStates(prev => ({ ...prev, [specialization]: true }));
    setErrorStates(prev => ({ ...prev, [specialization]: null }));

    try {
      // Prepare data for AI by stripping non-serializable parts like functions or React components (e.g., icons)
      const cleanPersonalInfo = stripFunctionsAndIcons(personalInfo);
      const cleanProjectsData = stripFunctionsAndIcons(projectsData);
      const cleanExperienceData = stripFunctionsAndIcons(experienceData);
      const cleanSkillsData = stripFunctionsAndIcons(skillsData);

      const input: TailoredResumeInput = {
        specialization,
        personalInfo: cleanPersonalInfo,
        projects: cleanProjectsData,
        experience: cleanExperienceData,
        skills: cleanSkillsData,
      };
      
      const output: TailoredResumeOutput = await generateTailoredResume(input);
      setGeneratedResumes(prev => ({ ...prev, [specialization]: output.resumeContent }));
      toast({
        title: "Resume Generated!",
        description: `Tailored resume for ${specialization} is ready.`,
        variant: "default",
      });
    } catch (err) {
      console.error(`Error generating resume for ${specialization}:`, err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorStates(prev => ({ ...prev, [specialization]: `Failed to generate resume: ${errorMessage}` }));
      toast({
        title: `Error Generating Resume for ${specialization}`,
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [specialization]: false }));
    }
  }, [generatedResumes, loadingStates, toast]);

  useEffect(() => {
    // Generate resume for the initially active specialization if not already generated
    if (activeSpecialization && !generatedResumes[activeSpecialization] && !loadingStates[activeSpecialization]) {
      handleGenerateResume(activeSpecialization);
    }
  }, [activeSpecialization, handleGenerateResume, generatedResumes, loadingStates]);


  return (
    <SectionWrapper id="resume" title="Tailored Resumes" subtitle="View AI-generated resume versions tailored for different specializations." className="bg-secondary/50">
      <Tabs value={activeSpecialization} onValueChange={setActiveSpecialization} className="max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-2 mb-6">
          {specializations.map((spec) => (
            <TabsTrigger key={spec} value={spec} disabled={loadingStates[spec]}>
              {loadingStates[spec] && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {spec}
            </TabsTrigger>
          ))}
        </TabsList>
        {specializations.map((spec) => (
          <TabsContent key={spec} value={spec} className="data-[state=active]:animate-in data-[state=active]:fade-in-90 data-[state=active]:duration-500">
            <Card className="shadow-xl rounded-xl min-h-[400px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl text-primary">
                  <FileText className="h-7 w-7" />
                  {spec} Resume
                </CardTitle>
                <CardDescription>
                  This resume is AI-generated and tailored for a {spec} role, based on the information presented in this portfolio.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingStates[spec] && (
                  <div className="w-full text-center p-10 text-muted-foreground flex flex-col items-center justify-center">
                    <Loader2 className="mb-2 h-8 w-8 animate-spin" />
                    Generating resume for {spec}...
                  </div>
                )}
                {errorStates[spec] && !loadingStates[spec] && (
                  <div className="w-full p-4 text-destructive bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
                    <p className="text-sm">{errorStates[spec]}</p>
                  </div>
                )}
                {generatedResumes[spec] && !loadingStates[spec] && !errorStates[spec] && (
                  <div className="prose prose-sm dark:prose-invert max-w-none bg-primary/5 p-6 shadow-inner rounded-lg">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-foreground/90 leading-relaxed">
                      {generatedResumes[spec]}
                    </pre>
                  </div>
                )}
                 {!generatedResumes[spec] && !loadingStates[spec] && !errorStates[spec] && (
                  <div className="w-full text-center p-10 text-muted-foreground">
                    <p>Select this specialization to generate the resume.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </SectionWrapper>
  );
}
