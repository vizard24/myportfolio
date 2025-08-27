"use client";

import { useState } from 'react';
import { resumePitchSpecializations as specializations, staticResumesData } from '@/data/portfolio-data';
import SectionWrapper from '@/components/layout/section-wrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText } from 'lucide-react';

export default function ResumeSection() {
  const [activeSpecialization, setActiveSpecialization] = useState<string>(specializations[0]);

  return (
    <SectionWrapper id="resume" title="Tailored Resumes" subtitle="View resume versions tailored for different specializations." className="bg-secondary/50">
      <Tabs value={activeSpecialization} onValueChange={setActiveSpecialization} className="max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-2 mb-6">
          {specializations.map((spec) => (
            <TabsTrigger key={spec} value={spec}>
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
                  This resume is tailored for a {spec} role, based on the information presented in this portfolio.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none bg-primary/5 p-6 shadow-inner rounded-lg">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-foreground/90 leading-relaxed">
                    {staticResumesData[spec] || "Resume content coming soon."}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </SectionWrapper>
  );
}
