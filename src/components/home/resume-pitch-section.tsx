"use client";

import { useState, useEffect } from 'react';
import { personalInfo, resumePitchSpecializations } from '@/data/portfolio-data';
import SectionWrapper from '@/components/layout/section-wrapper';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { generateResumePitch, type ResumePitchInput, type ResumePitchOutput } from '@/ai/flows/resume-pitch-generator';
import { Loader2, Wand2, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export default function ResumePitchSection() {
  const [resumeSummary, setResumeSummary] = useState(personalInfo.resumeSummary);
  const [selectedSpecialization, setSelectedSpecialization] = useState<string | null>(null);
  const [generatedPitch, setGeneratedPitch] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Effect to clear pitch and error when summary changes
  useEffect(() => {
    setGeneratedPitch(null);
    setError(null);
    setSelectedSpecialization(null);
  }, [resumeSummary]);

  const handleGeneratePitch = async (specialization: string) => {
    setSelectedSpecialization(specialization);
    setIsLoading(true);
    setError(null);
    setGeneratedPitch(null);

    try {
      const input: ResumePitchInput = { specialization, resumeSummary };
      const output: ResumePitchOutput = await generateResumePitch(input);
      setGeneratedPitch(output.pitch);
      toast({
        title: "Pitch Generated!",
        description: `Your resume pitch for ${specialization} is ready.`,
        variant: "default",
      });
    } catch (err) {
      console.error("Error generating resume pitch:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(`Failed to generate pitch: ${errorMessage}`);
      toast({
        title: "Error Generating Pitch",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SectionWrapper id="resume-pitch" title="AI Resume Pitch Generator" subtitle="Craft tailored resume pitches for different specializations using AI." className="bg-secondary/50">
      <Card className="max-w-3xl mx-auto shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl text-primary">
            <Wand2 className="h-7 w-7" />
            Customize Your Pitch
          </CardTitle>
          <CardDescription>
            Enter your resume summary below (or use the default). Then, select a specialization to generate a targeted pitch.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label htmlFor="resumeSummary" className="block text-sm font-medium text-foreground mb-1">
              Your Resume Summary
            </label>
            <Textarea
              id="resumeSummary"
              value={resumeSummary}
              onChange={(e) => setResumeSummary(e.target.value)}
              placeholder="Paste your resume summary here..."
              rows={8}
              className="shadow-sm focus:ring-accent focus:border-accent"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Select a Specialization:</p>
            <div className="flex flex-wrap gap-3">
              {resumePitchSpecializations.map((spec) => (
                <Button
                  key={spec}
                  variant={selectedSpecialization === spec ? "default" : "outline"}
                  onClick={() => handleGeneratePitch(spec)}
                  disabled={isLoading || !resumeSummary.trim()}
                  className={`transition-all duration-200 ${selectedSpecialization === spec ? 'bg-gradient-to-r from-[#FFA07A] to-[#FFDAB9] text-primary-foreground border-transparent' : ''}`}
                >
                  {isLoading && selectedSpecialization === spec && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {spec}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          {isLoading && (
            <div className="w-full text-center p-4 text-muted-foreground flex items-center justify-center">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating pitch for {selectedSpecialization}...
            </div>
          )}
          {error && !isLoading && (
            <div className="w-full p-4 text-destructive bg-destructive/10 border border-destructive/20 rounded-md flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 mt-0.5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          {generatedPitch && !isLoading && !error && (
            <Card className="w-full bg-primary/5 p-6 shadow-inner rounded-lg">
              <CardTitle className="text-lg font-semibold text-primary mb-2">
                Your AI-Generated Pitch for {selectedSpecialization}:
              </CardTitle>
              <CardDescription className="text-base text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {generatedPitch}
              </CardDescription>
            </Card>
          )}
        </CardFooter>
      </Card>
    </SectionWrapper>
  );
}
