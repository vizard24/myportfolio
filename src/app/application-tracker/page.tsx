
'use client';

import { useState, useId, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { useSimplePortfolio } from '@/context/simple-portfolio-context';
import { tailorResumeAndCoverLetter } from '@/ai/flows/resume-flow';
import { analyzeSkillsFromJobs } from '@/ai/flows/skills-analysis-flow';
import type { SkillAnalysis } from '@/ai/schemas/skills-analysis-schema';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader, PlusCircle, Trash2, Wand2, ShieldOff, CheckCircle, FileText, Languages, Briefcase, ExternalLink, Download, BrainCircuit, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, UnderlineType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';
import { formatDocument, type FormattedDocument } from '@/ai/flows/document-formatter-flow';
import { EnhancedDocumentDisplay } from '@/components/ui/enhanced-document-display';

// AI-Enhanced Word Document Generator
async function createAIEnhancedWordDocument(formattedDoc: FormattedDocument, documentType: 'resume' | 'cover-letter'): Promise<Document> {
  const paragraphs: Paragraph[] = [];

  // Add name as header if available
  if (formattedDoc.name) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: formattedDoc.name,
            bold: true,
            size: 36,
            color: "1a365d",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
  }

  // Add contact information
  if (formattedDoc.contact) {
    const contactInfo = [];
    if (formattedDoc.contact.email) contactInfo.push(formattedDoc.contact.email);
    if (formattedDoc.contact.phone) contactInfo.push(formattedDoc.contact.phone);
    if (formattedDoc.contact.location) contactInfo.push(formattedDoc.contact.location);
    if (formattedDoc.contact.linkedin) contactInfo.push(formattedDoc.contact.linkedin);

    if (contactInfo.length > 0) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: contactInfo.join(' | '),
              size: 20,
              color: "4a5568",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      );
    }
  }

  // Add sections
  for (const section of formattedDoc.sections) {
    // Section header
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: section.title.toUpperCase(),
            bold: true,
            size: 24,
            color: "2d3748",
            underline: {
              type: UnderlineType.SINGLE,
              color: "4299e1",
            },
          }),
        ],
        spacing: { before: 400, after: 200 },
      })
    );

    // Section content
    for (const item of section.content) {
      let textRun: TextRun;
      
      switch (item.type) {
        case 'job-title':
          textRun = new TextRun({
            text: item.text,
            bold: true,
            size: 22,
            color: "2d3748",
          });
          break;
        case 'company':
          textRun = new TextRun({
            text: item.text,
            italics: true,
            size: 20,
            color: "4a5568",
          });
          break;
        case 'date':
          textRun = new TextRun({
            text: item.text,
            size: 18,
            color: "718096",
          });
          break;
        case 'bullet':
          paragraphs.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: `• ${item.text}`,
                  size: 20,
                  color: "2d3748",
                }),
              ],
              indent: { left: 400 },
              spacing: { after: 100 },
            })
          );
          continue;
        case 'skill-category':
          textRun = new TextRun({
            text: item.text,
            bold: true,
            size: 20,
            color: "2d3748",
          });
          break;
        default:
          textRun = new TextRun({
            text: item.text,
            size: 20,
            color: "2d3748",
            bold: item.emphasis === 'bold',
            italics: item.emphasis === 'italic',
          });
      }

      paragraphs.push(
        new Paragraph({
          children: [textRun],
          spacing: { after: 150 },
        })
      );
    }
  }

  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: paragraphs,
      },
    ],
  });
}

// Fallback Professional Word Document Generator
async function createProfessionalWordDocument(content: string, documentType: 'resume' | 'cover-letter'): Promise<Document> {
  // Parse the content to extract structured information
  const lines = content.split('\n').filter(line => line.trim());
  const paragraphs: Paragraph[] = [];
  
  // Add document title
  const title = documentType === 'resume' ? 'Professional Resume' : 'Cover Letter';
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: title,
          bold: true,
          size: 32,
          color: "2E3440",
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  let currentSection = '';
  let isFirstLine = true;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // Detect if this is a section header (all caps, or ends with colon, or common resume sections)
    const isHeader = /^[A-Z\s]+:?$/.test(trimmedLine) || 
                    ['EXPERIENCE', 'EDUCATION', 'SKILLS', 'CONTACT', 'SUMMARY', 'OBJECTIVE'].some(section => 
                      trimmedLine.toUpperCase().includes(section)
                    ) ||
                    trimmedLine.endsWith(':');

    if (isHeader) {
      // Add section header
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmedLine.replace(':', ''),
              bold: true,
              size: 24,
              color: "3B4252",
              underline: {
                type: UnderlineType.SINGLE,
                color: "5E81AC",
              },
            }),
          ],
          spacing: { before: 300, after: 200 },
        })
      );
      currentSection = trimmedLine;
    } else if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-') || trimmedLine.startsWith('*')) {
      // Bullet point
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `• ${trimmedLine.substring(1).trim()}`,
              size: 22,
              color: "2E3440",
            }),
          ],
          indent: { left: 400 },
          spacing: { after: 100 },
        })
      );
    } else if (isFirstLine && documentType === 'resume') {
      // First line is likely the name - make it prominent
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmedLine,
              bold: true,
              size: 28,
              color: "2E3440",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      );
      isFirstLine = false;
    } else {
      // Regular paragraph
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: trimmedLine,
              size: 22,
              color: "2E3440",
            }),
          ],
          spacing: { after: 150 },
        })
      );
    }
  }

  // Create the document
  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,    // 1 inch
              right: 1440,  // 1 inch
              bottom: 1440, // 1 inch
              left: 1440,   // 1 inch
            },
          },
        },
        children: paragraphs,
      },
    ],
  });
}

// Job Description Dialog Component
function JobDescriptionDialog({ jobDescription, jobTitle }: { jobDescription: string; jobTitle: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          View Job Description
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Original Job Description</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Job posting used to generate the tailored resume and cover letter for: <strong>{jobTitle}</strong>
          </p>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] w-full">
          <div className="p-4 bg-muted/50 rounded-md border">
            <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
              {jobDescription}
            </pre>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronDown, ChevronUp } from 'lucide-react'


type Language = 'French' | 'English';

function SkillsAnalysisDisplay({ marketSkills }: { marketSkills: SkillAnalysis }) {
    const [showAllTechnical, setShowAllTechnical] = useState(false);
    const [showAllSoft, setShowAllSoft] = useState(false);

    const displayedTechnicalSkills = showAllTechnical ? marketSkills.technicalSkills : marketSkills.technicalSkills.slice(0, 5);
    const displayedSoftSkills = showAllSoft ? marketSkills.softSkills : marketSkills.softSkills.slice(0, 5);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
                <h3 className="font-semibold mb-3 text-primary">Technical Skills</h3>
                <ul className="space-y-2 text-sm">
                    {displayedTechnicalSkills.map(skill => (
                        <li key={skill.skill} className="flex justify-between items-center">
                            <span>{skill.skill}</span>
                            <Badge variant="secondary">{skill.count} occurrence(s)</Badge>
                        </li>
                    ))}
                </ul>
                {marketSkills.technicalSkills.length > 5 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAllTechnical(!showAllTechnical)}
                        className="mt-3 text-xs text-muted-foreground hover:text-primary"
                    >
                        {showAllTechnical ? (
                            <>
                                <ChevronUp className="h-3 w-3 mr-1" />
                                Show Less
                            </>
                        ) : (
                            <>
                                <ChevronDown className="h-3 w-3 mr-1" />
                                Show All ({marketSkills.technicalSkills.length})
                            </>
                        )}
                    </Button>
                )}
            </div>
            <div>
                <h3 className="font-semibold mb-3 text-primary">Soft Skills</h3>
                <ul className="space-y-2 text-sm">
                    {displayedSoftSkills.map(skill => (
                        <li key={skill.skill} className="flex justify-between items-center">
                            <span>{skill.skill}</span>
                            <Badge variant="secondary">{skill.count} occurrence(s)</Badge>
                        </li>
                    ))}
                </ul>
                {marketSkills.softSkills.length > 5 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAllSoft(!showAllSoft)}
                        className="mt-3 text-xs text-muted-foreground hover:text-primary"
                    >
                        {showAllSoft ? (
                            <>
                                <ChevronUp className="h-3 w-3 mr-1" />
                                Show Less
                            </>
                        ) : (
                            <>
                                <ChevronDown className="h-3 w-3 mr-1" />
                                Show All ({marketSkills.softSkills.length})
                            </>
                        )}
                    </Button>
                )}
            </div>
        </div>
    );
}

interface Application {
  id: string;
  jobDescription: string;
  applicationLink: string;
  language: Language;
  selectedResumeId: string;
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
    applicationLink?: string;
    tailoredResume: string;
    coverLetter: string;
    language: string;
    matchingScore: number;
    matchingSkills: string[];
    lackingSkills: string[];
    createdAt: { seconds: number; nanoseconds: number; } | Date;
}

function DocumentDisplayDialog({ title, content, onDownload }: { title: string; content: string; onDownload: () => void; }) {
    const documentType = title.toLowerCase().includes('resume') ? 'resume' : 'cover-letter';
    
    return (
        <Dialog>
            <Card className="w-full h-full hover:bg-muted/50 transition-colors flex flex-col">
                <CardHeader className="flex-row items-center justify-between">
                    <CardTitle className="text-lg">{title}</CardTitle>
                    <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onDownload(); }}>
                        <Download className="mr-2 h-4 w-4" /> AI-Enhanced DOCX
                    </Button>
                </CardHeader>
                <CardContent className="flex-grow overflow-hidden">
                    <DialogTrigger asChild>
                        <div className="h-48 overflow-hidden relative cursor-pointer hover:bg-muted/30 rounded p-3 transition-colors border border-border/50 bg-white">
                            <div className="scale-[0.6] origin-top-left transform -ml-2 -mt-2">
                                <EnhancedDocumentDisplay 
                                    content={content} 
                                    documentType={documentType}
                                    className="text-xs"
                                />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card via-card/80 to-transparent" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/5 transition-opacity rounded">
                                <span className="text-sm font-medium bg-background/95 px-4 py-2 rounded-lg shadow-lg border">
                                    Click to view full document
                                </span>
                            </div>
                        </div>
                    </DialogTrigger>
                </CardContent>
            </Card>
            <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold text-slate-800">{title}</DialogTitle>
                </DialogHeader>
                <div className="flex-grow overflow-hidden bg-white rounded-lg border">
                    <ScrollArea className="h-full">
                        <div className="p-8">
                            <EnhancedDocumentDisplay 
                                content={content} 
                                documentType={documentType}
                            />
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}


function ApplicationDetailDialog({ application }: { application: SavedApplication }) {
    const { toast } = useToast();

    const handleDownloadWord = async (content: string, fileName: string, documentType: 'resume' | 'cover-letter') => {
        toast({ title: 'Generating Word Document...', description: 'AI is enhancing the format...' });
        try {
            // Use AI to format the document professionally
            const formattedDoc = await formatDocument(content, documentType);
            const doc = await createAIEnhancedWordDocument(formattedDoc, documentType);
            
            // Generate and download the document
            const blob = await Packer.toBlob(doc);
            saveAs(blob, `${fileName}.docx`);
            
            toast({ title: 'Professional Document Downloaded!', description: `AI-enhanced ${fileName}.docx has been saved.` });
        } catch (error) {
            console.error('AI-enhanced document generation failed, falling back to basic format:', error);
            // Fallback to basic formatting
            try {
                const doc = await createProfessionalWordDocument(content, documentType);
                const blob = await Packer.toBlob(doc);
                saveAs(blob, `${fileName}.docx`);
                toast({ title: 'Document Downloaded!', description: `${fileName}.docx has been saved.` });
            } catch (fallbackError) {
                console.error('Fallback document generation also failed:', fallbackError);
                toast({ title: 'Download Failed', description: 'Could not generate Word document. Please try again.', variant: 'destructive' });
            }
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <FileText className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle>{application.jobTitle}</DialogTitle>
                        {application.jobDescription && (
                            <JobDescriptionDialog 
                                jobDescription={application.jobDescription} 
                                jobTitle={application.jobTitle || 'Untitled Job'} 
                            />
                        )}
                    </div>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <DocumentDisplayDialog
                            title="Tailored Resume"
                            content={application.tailoredResume}
                            onDownload={() => handleDownloadWord(application.tailoredResume, `${application.jobTitle}-Resume`, 'resume')}
                        />
                        <DocumentDisplayDialog
                            title="Cover Letter"
                            content={application.coverLetter}
                            onDownload={() => handleDownloadWord(application.coverLetter, `${application.jobTitle}-CoverLetter`, 'cover-letter')}
                        />
                    </div>
                </div>
                 <div className="flex-shrink-0 pt-4 border-t">
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">Fit Analysis</CardTitle>
                            {application.jobDescription && (
                                <JobDescriptionDialog 
                                    jobDescription={application.jobDescription} 
                                    jobTitle={application.jobTitle || 'Untitled Job'} 
                                />
                            )}
                        </CardHeader>
                        <CardContent className="flex flex-col md:flex-row items-center gap-6">
                            <div className="flex flex-col items-center gap-2">
                                <div className="relative h-24 w-24">
                                    <svg className="h-full w-full" viewBox="0 0 36 36">
                                        <path className="text-muted/20" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                        <path className="text-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${application.matchingScore}, 100`} />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-2xl font-bold text-primary">{application.matchingScore}%</span>
                                    </div>
                                </div>
                                    <p className="text-sm font-medium text-primary">Match Score</p>
                            </div>
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                <div>
                                    <h4 className="font-semibold text-sm flex items-center gap-2 mb-2"><CheckCircle className="h-4 w-4 text-green-500" /> Matching Skills</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {application.matchingSkills?.map(skill => <Badge key={skill} variant="secondary">{skill}</Badge>)}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm flex items-center gap-2 mb-2"><ShieldOff className="h-4 w-4 text-amber-500" /> Lacking Skills</h4>
                                        <div className="flex flex-wrap gap-1">
                                        {application.lackingSkills?.map(skill => <Badge key={skill} variant="outline">{skill}</Badge>)}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function ApplicationTrackerPage() {
  const { user } = useAuth();
  const { personalInfo, updatePersonalInfo, saving } = useSimplePortfolio();
  const { toast } = useToast();
  const [baseResumes, setBaseResumes] = useState(() => {
    // Initialize with at least one resume
    const resumes = personalInfo.resumeSummaries || [];
    if (resumes.length === 0) {
      return [{
        id: 'resume-1',
        title: 'Resume 1',
        content: ''
      }];
    }
    return resumes;
  });
  
  // Update baseResumes when personalInfo changes (when data loads from Firebase)
  useEffect(() => {
    if (personalInfo.resumeSummaries && personalInfo.resumeSummaries.length > 0) {
      console.log('📥 Updating baseResumes from personalInfo:', personalInfo.resumeSummaries);
      setBaseResumes(personalInfo.resumeSummaries);
    }
  }, [personalInfo.resumeSummaries]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [history, setHistory] = useState<SavedApplication[]>([]);
  const [marketSkills, setMarketSkills] = useState<SkillAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const uniqueId = useId();

  // Save resumes to database
  const saveResumes = async () => {
    try {
      console.log('💾 Saving resumes to database...', {
        baseResumes,
        personalInfoBefore: personalInfo,
        user: user?.email
      });
      
      // Create updated personal info with new resume summaries
      const updatedPersonalInfo = {
        ...personalInfo,
        resumeSummaries: baseResumes
      };
      
      console.log('📤 Updating personal info with resumes...', updatedPersonalInfo);
      await updatePersonalInfo(updatedPersonalInfo);
      
      console.log('✅ Resumes saved successfully');
      toast({
        title: "Resumes Saved",
        description: "Your base resumes have been saved successfully.",
      });
    } catch (error) {
      console.error('❌ Failed to save resumes:', error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save resumes. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResumeTitleChange = (id: string, newTitle: string) => {
    setBaseResumes(prev => prev.map(r => r.id === id ? { ...r, title: newTitle } : r));
  };
  
  const handleResumeContentChange = (id: string, newContent: string) => {
    setBaseResumes(prev => prev.map(r => r.id === id ? { ...r, content: newContent } : r));
  };
  
  const addBaseResume = () => {
    if (baseResumes.length < 3) {
      const newResume = {
        id: `resume-${Date.now()}`,
        title: `Resume ${baseResumes.length + 1}`,
        content: ''
      };
      setBaseResumes(prev => [...prev, newResume]);
      toast({
        title: "New Resume Added",
        description: "A new base resume has been added.",
      });
    }
  };

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, `users/${user.uid}/applications`), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const historyData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavedApplication));
        setHistory(historyData);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const runAnalysis = async () => {
        if (history.length > 0) {
            setIsAnalyzing(true);
            try {
                const jobDescriptions = history.map(app => app.jobDescription);
                const result = await analyzeSkillsFromJobs({ jobDescriptions });
                setMarketSkills(result);
            } catch (error) {
                console.error("Failed to analyze market skills:", error);
                toast({
                    title: "Skills Analysis Failed",
                    description: "Could not analyze job description history.",
                    variant: "destructive"
                });
            } finally {
                setIsAnalyzing(false);
            }
        }
    };
    runAnalysis();
  }, [history]);

  const addApplication = () => {
    setApplications(prev => [...prev, { id: `app-${uniqueId}-${prev.length}`, jobDescription: '', applicationLink: '', language: 'French', selectedResumeId: baseResumes[0].id, isLoading: false }]);
  };

  const removeApplication = (id: string) => {
    setApplications(prev => prev.filter(app => app.id !== id));
  };
  
  const handleInputChange = (id: string, field: 'jobDescription' | 'applicationLink', value: string) => {
    setApplications(prev => prev.map(app => app.id === id ? { ...app, [field]: value } : app));
  };

  const handleLanguageChange = (id: string, language: Language) => {
    setApplications(prev => prev.map(app => app.id === id ? { ...app, language } : app));
  };

  const handleResumeSelectionChange = (id: string, resumeId: string) => {
    setApplications(prev => prev.map(app => app.id === id ? { ...app, selectedResumeId: resumeId } : app));
  };

  const handleDeleteHistoryItem = async (id: string) => {
    if (!user) return;
    try {
        await deleteDoc(doc(db, `users/${user.uid}/applications`, id));
        toast({
            title: "Application Deleted",
            description: "The application has been removed from your history.",
        });
    } catch (error) {
        console.error("Error deleting document: ", error);
        toast({
            title: "Deletion Failed",
            description: "Could not delete the application. Please try again.",
            variant: "destructive",
        });
    }
  };

  const handleGenerate = async (id: string) => {
    const application = applications.find(app => app.id === id);
    const selectedResume = baseResumes.find(r => r.id === application?.selectedResumeId);

    if (!application || !application.jobDescription) {
      toast({ title: "Job Description Missing", description: "Please paste the job description before generating.", variant: "destructive" });
      return;
    }
    if (!selectedResume || !selectedResume.content) {
      toast({ title: "Base Resume Missing", description: "Please select a valid base resume and ensure it has content.", variant: "destructive" });
      return;
    }

    setApplications(prev => prev.map(app => app.id === id ? { ...app, isLoading: true } : app));

    try {
      const result = await tailorResumeAndCoverLetter({
        resume: selectedResume.content,
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
            applicationLink: application.applicationLink,
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
            <CardTitle>Your Base Resumes</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={baseResumes[0]?.id || 'resume-1'} className="w-full">
                <div className="flex items-center gap-2">
                    <TabsList>
                        {baseResumes.map(resume => (
                        <TabsTrigger key={resume.id} value={resume.id}>
                            <Input
                            value={resume.title}
                            onChange={(e) => handleResumeTitleChange(resume.id, e.target.value)}
                            className="border-none focus-visible:ring-0 text-center bg-transparent h-auto p-0"
                            />
                        </TabsTrigger>
                        ))}
                    </TabsList>
                    {baseResumes.length < 3 && (
                        <Button variant="ghost" size="icon" onClick={addBaseResume}>
                            <PlusCircle className="h-5 w-5" />
                        </Button>
                    )}
                </div>
              {baseResumes.map(resume => (
                <TabsContent key={resume.id} value={resume.id} className="mt-4">
                  <Textarea
                    value={resume.content}
                    onChange={(e) => handleResumeContentChange(resume.id, e.target.value)}
                    placeholder={`Paste the content for your "${resume.title}" resume here...`}
                    rows={10}
                    className="text-sm"
                  />
                </TabsContent>
              ))}
            </Tabs>
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={saveResumes} disabled={saving} className="flex items-center gap-2">
                {saving ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {saving ? 'Saving...' : 'Save Resumes'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">Job Applications</h2>
            {applications.map((app, index) => (
                <Card key={app.id} className="overflow-hidden">
                   <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor={`job-desc-${app.id}`} className="text-sm font-medium text-muted-foreground mb-2 block">
                                Job Description #{index + 1}
                            </label>
                            <Textarea
                                id={`job-desc-${app.id}`}
                                value={app.jobDescription}
                                onChange={(e) => handleInputChange(app.id, 'jobDescription', e.target.value)}
                                placeholder="Paste the job description here..."
                                rows={6}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor={`apply-link-${app.id}`} className="text-sm font-medium text-muted-foreground mb-2 block">
                                    Application Link (Optional)
                                </label>
                                <Input
                                    id={`apply-link-${app.id}`}
                                    value={app.applicationLink}
                                    onChange={(e) => handleInputChange(app.id, 'applicationLink', e.target.value)}
                                    placeholder="https://www.linkedin.com/jobs/view/..."
                                />
                            </div>
                            <div>
                                <label htmlFor={`resume-select-${app.id}`} className="text-sm font-medium text-muted-foreground mb-2 block">
                                    Base Resume to Use
                                </label>
                                <Select value={app.selectedResumeId} onValueChange={(value) => handleResumeSelectionChange(app.id, value)}>
                                    <SelectTrigger id={`resume-select-${app.id}`}>
                                        <SelectValue placeholder="Select a base resume" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {baseResumes.map(resume => (
                                            <SelectItem key={resume.id} value={resume.id}>{resume.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

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
                                        <CardHeader className="flex flex-row items-center justify-between">
                                            <CardTitle className="text-lg">Fit Analysis</CardTitle>
                                            {app.jobDescription && (
                                                <JobDescriptionDialog jobDescription={app.jobDescription} jobTitle={app.jobTitle || 'Untitled Job'} />
                                            )}
                                        </CardHeader>
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
                                <TableHead className="w-0 p-0 text-right"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.length > 0 ? history.map(item => (
                                <TableRow key={item.id} className="group">
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
                                    <TableCell className="p-2 text-right">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end items-center space-x-1">
                                            <ApplicationDetailDialog application={item} />
                                            {item.applicationLink && (
                                                <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                                                    <a href={item.applicationLink} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="h-4 w-4" />
                                                    </a>
                                                </Button>
                                            )}
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-8 w-8">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete the application for "{item.jobTitle}".
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteHistoryItem(item.id)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
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

        <div className="mt-16">
            <h2 className="text-2xl font-bold text-primary mb-4 flex items-center gap-2">
                <BrainCircuit className="h-7 w-7" />
                Market Skills Analysis
            </h2>
            <Card>
                <CardHeader>
                    <CardTitle>Top Required Skills</CardTitle>
                    <p className="text-muted-foreground text-sm">
                        Based on the {history.length} job description(s) you've saved. This analysis updates automatically.
                    </p>
                </CardHeader>
                <CardContent>
                    {isAnalyzing ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Loader className="h-4 w-4 animate-spin" />
                            <span>Analyzing job descriptions...</span>
                        </div>
                    ) : marketSkills ? (
                        <SkillsAnalysisDisplay marketSkills={marketSkills} />
                    ) : (
                        <p className="text-muted-foreground text-sm">
                            No skills data to display. Add job descriptions to start the analysis.
                        </p>
                    )}
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

    