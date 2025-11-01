
'use client';

import { useState, useId, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { usePortfolioData } from '@/context/portfolio-data-context';
import { tailorResumeAndCoverLetter } from '@/ai/flows/resume-flow';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader, PlusCircle, Trash2, Wand2, Star, ShieldOff, CheckCircle, FileText, Languages, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

type Language = 'French' | 'English';

interface Application {
  id: string;
  jobDescription: string;
  language: Language;
  tailoredResume?: string;
  coverLetter?: string;
  jobTitle?: string;
  matchingScore?: number;
  matchingSkills?: string[];
  lackingSkills?: string[];
  isLoading: boolean;
}

interface SavedApplication {
    id: string;
    jobTitle: string;
    jobDescription: string;
    language: string;
    matchingScore: number;
    createdAt: { seconds: number; nanoseconds: number; } | Date;
}

function ApplicationTrackerPage() {
  const { user } = useAuth();
  const { personalInfo, setPersonalInfo } = usePortfolioData();
  const { toast } = useToast();
  const [baseResume, setBaseResume] = useState(personalInfo.resumeSummary);
  const [applications, setApplications] = useState<Application[]>([]);
  const [history, setHistory] = useState<SavedApplication[]>([]);
  const uniqueId = useId();

  useEffect(() => {
    setPersonalInfo({ ...personalInfo, resumeSummary: baseResume });
  }, [baseResume]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, `users/${user.uid}/applications`), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const historyData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedApplication));
        setHistory(historyData);
    });
    return () => unsubscribe();
  }, [user]);

  const addApplication = () => {
    setApplications(prev => [...prev, { id: `app-${uniqueId}-${prev.length}`, jobDescription: '', language: 'French', isLoading: false }]);
  };

  const removeApplication = (id: string) => {
    setApplications(prev => prev.filter(app => app.id !== id));
  };
  
  const handleJobDescriptionChange = (id: string, value: string) => {
    setApplications(prev => prev.map(app => app.id === id ? { ...app, jobDescription: value } : app));
  };

  const handleLanguageChange = (id: string, language: Language) => {
    setApplications(prev => prev.map(app => app.id === id ? { ...app, language } : app));
  };

  const handleGenerate = async (id: string) => {
    const application = applications.find(app => app.id === id);
    if (!application || !application.jobDescription) {
      toast({ title: "Job Description Missing", description: "Please paste the job description before generating.", variant: "destructive" });
      return;
    }
    if (!baseResume) {
      toast({ title: "Base Resume Missing", description: "Please paste your base resume before generating.", variant: "destructive" });
      return;
    }

    setApplications(prev => prev.map(app => app.id === id ? { ...app, isLoading: true } : app));

    try {
      const result = await tailorResumeAndCoverLetter({
        resume: baseResume,
        jobDescription: application.jobDescription,
        language: application.language,
      });

      const fullResult = {
        ...application,
        ...result,
        isLoading: false,
      };

      setApplications(prev => prev.map(app => app.id === id ? fullResult : app));
      
      if (user) {
        await addDoc(collection(db, `users/${user.uid}/applications`), {
            userId: user.uid,
            jobTitle: result.jobTitle,
            jobDescription: application.jobDescription,
            tailoredResume: result.resume,
            coverLetter: result.coverLetter,
            language: application.language,
            matchingScore: result.matchingScore,
            matchingSkills: result.matchingSkills,
            lackingSkills: result.lackingSkills,
            createdAt: serverTimestamp(),
        });
      }

      toast({ title: "Content Generated!", description: "Your tailored resume and cover letter are ready and saved." });
    } catch (error) {
      console.error("AI generation failed:", error);
      toast({ title: "Generation Failed", description: "The AI could not generate the content. Please try again.", variant: "destructive" });
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
          Tailor your resume and generate cover letters for any job in seconds.
        </p>

        <Card className="mb-8">
            <CardHeader>
                <CardTitle>Your Base Resume</CardTitle>
            </CardHeader>
            <CardContent>
                <Textarea
                    value={baseResume}
                    onChange={(e) => setBaseResume(e.target.value)}
                    placeholder="Paste your master resume here... Your content will be saved automatically."
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
                        <div className="flex items-center gap-4">
                            <Button onClick={() => handleGenerate(app.id)} disabled={app.isLoading}>
                                {app.isLoading ? (
                                    <><Loader className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                                ) : (
                                    <><Wand2 className="mr-2 h-4 w-4" /> Generate Tailored Content</>
                                )}
                            </Button>
                             <div className="flex items-center space-x-2">
                                <Label htmlFor={`lang-switch-${app.id}`} className={app.language === 'English' ? 'text-muted-foreground' : 'text-primary'}>FR</Label>
                                <Switch
                                    id={`lang-switch-${app.id}`}
                                    checked={app.language === 'English'}
                                    onCheckedChange={(checked) => handleLanguageChange(app.id, checked ? 'English' : 'French')}
                                />
                                <Label htmlFor={`lang-switch-${app.id}`} className={app.language === 'French' ? 'text-muted-foreground' : 'text-primary'}>EN</Label>
                            </div>
                        </div>
                         <Button variant="ghost" size="icon" onClick={() => removeApplication(app.id)}>
                            <Trash2 className="h-5 w-5 text-destructive" />
                         </Button>
                     </div>
                   </div>
                   {(app.tailoredResume || app.coverLetter) && (
                     <Accordion type="single" collapsible className="w-full bg-secondary/30">
                        <AccordionItem value="item-1">
                            <AccordionTrigger className="px-6 text-primary font-semibold">
                                {app.jobTitle ? `View Generated Content for: ${app.jobTitle}` : 'View Generated Content'}
                            </AccordionTrigger>
                            <AccordionContent className="px-6 pt-2 pb-6 space-y-6">
                                {typeof app.matchingScore === 'number' && (
                                    <Card>
                                        <CardHeader><CardTitle className="text-lg">Fit Analysis</CardTitle></CardHeader>
                                        <CardContent className="flex flex-col md:flex-row items-center gap-6">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="relative h-24 w-24">
                                                    <svg className="h-full w-full" viewBox="0 0 36 36">
                                                        <path className="text-muted/20" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                                        <path className="text-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${app.matchingScore}, 100`} />
                                                    </svg>
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-2xl font-bold text-primary">{app.matchingScore}%</span>
                                                    </div>
                                                </div>
                                                 <p className="text-sm font-medium text-primary">Match Score</p>
                                            </div>
                                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                                <div>
                                                    <h4 className="font-semibold text-sm flex items-center gap-2 mb-2"><CheckCircle className="h-4 w-4 text-green-500" /> Matching Skills</h4>
                                                    <div className="flex flex-wrap gap-1">
                                                        {app.matchingSkills?.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-sm flex items-center gap-2 mb-2"><ShieldOff className="h-4 w-4 text-amber-500" /> Lacking Skills</h4>
                                                     <div className="flex flex-wrap gap-1">
                                                        {app.lackingSkills?.map(skill => <Badge key={skill} variant="outline">{skill}</Badge>)}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
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

        <div className="mt-16">
            <h2 className="text-2xl font-bold text-primary mb-4">Application History</h2>
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Job Title</TableHead>
                                <TableHead>Match Score</TableHead>
                                <TableHead>Language</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.length > 0 ? history.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell className="font-medium flex items-center gap-2"><Briefcase className="h-4 w-4 text-muted-foreground" /> {item.jobTitle}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Progress value={item.matchingScore} className="h-2 w-20" />
                                            <span>{item.matchingScore}%</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Languages className="h-4 w-4 text-muted-foreground" /> {item.language}
                                        </div>
                                    </TableCell>
                                    <TableCell>{item.createdAt ? format(new Date((item.createdAt as any).seconds * 1000), 'MMM d, yyyy') : 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            {/* In a future step, this could link to a detailed view */}
                                            <a href="#">View</a>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                                        No application history yet. Generate content to see it here.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
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
    router.replace('/');
    return null;
  }
  
  return <ApplicationTrackerPage />;
}
