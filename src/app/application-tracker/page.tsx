
'use client';

import { useState, useId } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { usePortfolioData } from '@/context/portfolio-data-context';
import { tailorResumeAndCoverLetter } from '@/ai/flows/resume-flow';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader, PlusCircle, Trash2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Application {
  id: string;
  jobDescription: string;
  tailoredResume?: string;
  coverLetter?: string;
  isLoading: boolean;
}

function ApplicationTrackerPage() {
  const { personalInfo } = usePortfolioData();
  const { toast } = useToast();
  const [baseResume, setBaseResume] = useState(personalInfo.resumeSummary);
  const [applications, setApplications] = useState<Application[]>([]);
  const uniqueId = useId();


  const addApplication = () => {
    setApplications(prev => [...prev, { id: `app-${uniqueId}-${prev.length}`, jobDescription: '', isLoading: false }]);
  };

  const removeApplication = (id: string) => {
    setApplications(prev => prev.filter(app => app.id !== id));
  };
  
  const handleJobDescriptionChange = (id: string, value: string) => {
    setApplications(prev => prev.map(app => app.id === id ? { ...app, jobDescription: value } : app));
  };

  const handleGenerate = async (id: string) => {
    const application = applications.find(app => app.id === id);
    if (!application || !application.jobDescription) {
      toast({
        title: "Job Description Missing",
        description: "Please paste the job description before generating.",
        variant: "destructive",
      });
      return;
    }
    if (!baseResume) {
        toast({
            title: "Base Resume Missing",
            description: "Please paste your base resume before generating.",
            variant: "destructive",
        });
        return;
    }

    setApplications(prev => prev.map(app => app.id === id ? { ...app, isLoading: true } : app));

    try {
      const result = await tailorResumeAndCoverLetter({
        resume: baseResume,
        jobDescription: application.jobDescription,
      });

      setApplications(prev => prev.map(app => app.id === id ? {
        ...app,
        tailoredResume: result.resume,
        coverLetter: result.coverLetter,
        isLoading: false,
      } : app));
      
      toast({
        title: "Content Generated!",
        description: "Your tailored resume and cover letter are ready.",
      });

    } catch (error) {
      console.error("AI generation failed:", error);
      toast({
        title: "Generation Failed",
        description: "The AI could not generate the content. Please try again.",
        variant: "destructive",
      });
      setApplications(prev => prev.map(app => app.id === id ? { ...app, isLoading: false } : app));
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl lg:text-6xl text-center mb-4">
          AI Application Tracker
        </h1>
        <p className="text-xl text-muted-foreground sm:text-2xl text-center mb-12">
          Tailor your resume and cover letter for any job in seconds.
        </p>

        <Card className="mb-8">
            <CardHeader>
                <CardTitle>Your Base Resume</CardTitle>
            </CardHeader>
            <CardContent>
                <Textarea
                    value={baseResume}
                    onChange={(e) => setBaseResume(e.target.value)}
                    placeholder="Paste your master resume here..."
                    rows={10}
                    className="text-sm"
                />
            </CardContent>
        </Card>

        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">Job Applications</h2>
            {applications.map((app, index) => (
                <Card key={app.id} className="overflow-hidden">
                   <div className="p-6">
                     <label className="text-sm font-medium text-muted-foreground mb-2 block">
                        Job Description #{index + 1}
                    </label>
                     <Textarea
                        value={app.jobDescription}
                        onChange={(e) => handleJobDescriptionChange(app.id, e.target.value)}
                        placeholder="Paste the job description here..."
                        rows={6}
                        className="mb-4"
                     />
                     <div className="flex justify-between items-center">
                        <Button onClick={() => handleGenerate(app.id)} disabled={app.isLoading}>
                            {app.isLoading ? (
                                <>
                                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="mr-2 h-4 w-4" />
                                    Generate Tailored Content
                                </>
                            )}
                        </Button>
                         <Button variant="ghost" size="icon" onClick={() => removeApplication(app.id)}>
                            <Trash2 className="h-5 w-5 text-destructive" />
                         </Button>
                     </div>
                   </div>
                   {(app.tailoredResume || app.coverLetter) && (
                     <Accordion type="single" collapsible className="w-full bg-secondary/30">
                        <AccordionItem value="item-1">
                            <AccordionTrigger className="px-6 text-primary font-semibold">
                                View Generated Content
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pt-2 pb-6 space-y-6">
                                {app.tailoredResume && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2 text-primary">Tailored Resume</h3>
                                        <div className="p-4 bg-background rounded-md border whitespace-pre-wrap text-sm font-mono">{app.tailoredResume}</div>
                                    </div>
                                )}
                                {app.coverLetter && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2 text-primary">Cover Letter</h3>
                                         <div className="p-4 bg-background rounded-md border whitespace-pre-wrap text-sm font-mono">{app.coverLetter}</div>
                                    </div>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                   )}
                </Card>
            ))}

            <Button variant="outline" onClick={addApplication} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Application
            </Button>
        </div>

      </main>
      <Footer />
    </div>
  );
}


export default function ApplicationTrackerPageWrapper() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <Loader className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  if (!user) {
    // Redirect to home if not logged in
    router.replace('/');
    return null;
  }
  
  return <ApplicationTrackerPage />;
}
