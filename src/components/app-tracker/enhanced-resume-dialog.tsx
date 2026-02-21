'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
    AlertCircle,
    TrendingUp,
    Zap,
    Download,
    Target,
    Brain,
    BarChart3,
    AlertTriangle,
    RefreshCw,
    Save,
    Clock,
    History,
    Sparkles,
    Eye,
    Pencil,
} from 'lucide-react';
import { critiqueResumeAction, rewriteResumeAction } from '@/app/actions/ai-actions';
import type { ResumeCritique } from '@/ai/schemas/resume-critique-schema';
import { useToast } from '@/hooks/use-toast';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

interface EnhancedResumeDialogProps {
    applicationId: string;
    resume: string;
    jobDescription: string;
    matchingScore: number;
    matchingSkills: string[];
    lackingSkills: string[];
    initialCritique?: ResumeCritique | null;
    onResumeUpdate: (resume: string) => Promise<void>;
    onCritiqueUpdate: (critique: ResumeCritique) => Promise<void>;
}

const priorityColors = {
    HIGH: 'destructive',
    MEDIUM: 'default',
    LOW: 'secondary',
} as const;

const strengthColors = {
    'World-Class': 'text-green-600',
    Strong: 'text-green-500',
    Average: 'text-yellow-600',
    'Below Par': 'text-orange-600',
    'Red Flags': 'text-red-600',
};

interface AnalysisHistoryItem {
    id: string;
    timestamp: number;
    critique: ResumeCritique;
    score: number;
}

interface DiffLine {
    type: 'added' | 'removed' | 'unchanged';
    text: string;
}

const computeSimpleDiff = (oldText: string, newText: string): DiffLine[] => {
    const oldLines = oldText.split('\n');
    const newLines = newText.split('\n');
    const diff: DiffLine[] = [];

    // Very naive diff logic for demonstration purposes (since we can't use complex diff libs)
    // Real diffing usually involves LCS algorithm. Here we just mark new lines as added
    // and missing old lines as removed, without perfect alignment.
    // For a better experience without a library, we can just show the new text in green if it's completely new.

    // Attempting a simple LCS-like alignment is too complex for this snippet.
    // Let's rely on a simpler approach:
    // If a line exists in both, keep it. 
    // If it's in New but not Old, it's Added. 
    // If it's in Old but not New, it's Removed.
    // This messes up order if identical lines appear multiple times, but let's try a linear scan approach.

    let i = 0, j = 0;
    while (i < oldLines.length || j < newLines.length) {
        if (i < oldLines.length && j < newLines.length && oldLines[i] === newLines[j]) {
            diff.push({ type: 'unchanged', text: oldLines[i] });
            i++;
            j++;
        } else if (j < newLines.length && (i >= oldLines.length || !oldLines.slice(i).includes(newLines[j]))) {
            diff.push({ type: 'added', text: newLines[j] });
            j++;
        } else if (i < oldLines.length) {
            diff.push({ type: 'removed', text: oldLines[i] });
            i++;
        } else {
            j++;
        }
    }
    return diff;
};

export function EnhancedResumeDialog({
    applicationId,
    resume,
    jobDescription,
    matchingScore,
    matchingSkills,
    lackingSkills,
    initialCritique,
    onResumeUpdate,
    onCritiqueUpdate,
}: EnhancedResumeDialogProps) {
    const [editedResume, setEditedResume] = useState(resume);
    const [critique, setCritique] = useState<ResumeCritique | null>(initialCritique || null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
    const [isAutoImproving, setIsAutoImproving] = useState(false);
    const [diffLines, setDiffLines] = useState<DiffLine[] | null>(null);
    const [showDiff, setShowDiff] = useState(false);
    const { toast } = useToast();

    // Load history from localStorage
    useEffect(() => {
        const loadHistory = () => {
            try {
                const savedHistory = localStorage.getItem(`resume_analysis_history_${applicationId}`);
                if (savedHistory) {
                    const parsed = JSON.parse(savedHistory);
                    setHistory(parsed);
                }
            } catch (error) {
                console.error("Failed to load history:", error);
            }
        };
        loadHistory();
    }, [applicationId]);

    const addToHistory = (newCritique: ResumeCritique, score: number) => {
        const newItem: AnalysisHistoryItem = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            critique: newCritique,
            score: score
        };

        const updatedHistory = [newItem, ...history];
        setHistory(updatedHistory);
        localStorage.setItem(`resume_analysis_history_${applicationId}`, JSON.stringify(updatedHistory));
    };

    const handleHistorySelect = (historyId: string) => {
        const selectedItem = history.find(item => item.id === historyId);
        if (selectedItem) {
            setCritique(selectedItem.critique);
            toast({
                title: "History Loaded",
                description: `Viewing analysis from ${format(selectedItem.timestamp, 'PP p')}`,
            });
        }
    };

    // Debug: Log initial critique
    useEffect(() => {
        console.log('EnhancedResumeDialog mounted with initialCritique:', initialCritique ? 'EXISTS' : 'NULL');
        console.log('Application ID:', applicationId);
    }, []);

    // Manual save handler
    // Manual save handler
    const handleSave = async () => {
        setIsSaving(true);
        try {
            // 1. If we are in Diff View, switch back to Edit View first
            if (showDiff) {
                setShowDiff(false);
                setDiffLines(null);
            }

            // 2. Save the formatted resume text (the "new version") to Firestore
            // This updates the 'tailoredResume' field for this application package
            await onResumeUpdate(editedResume);

            // 3. Save the critique analysis to Firestore
            if (critique) {
                await onCritiqueUpdate(critique);
            }

            toast({
                title: 'Saved Successfully',
                description: 'Resume text and analysis have been updated in the database.',
            });
        } catch (error: any) {
            console.error('Failed to save:', error);
            toast({
                title: 'Save Failed',
                description: error?.message || 'Could not save changes.',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleRefreshCritique = async () => {
        setIsRefreshing(true);
        try {
            const result = await critiqueResumeAction({
                resume: editedResume,
                jobDescription,
                matchingScore,
                matchingSkills,
                lackingSkills,
            });

            if (result.success && result.data) {
                setCritique(result.data);
                addToHistory(result.data, matchingScore);
                await onCritiqueUpdate(result.data);
                toast({
                    title: 'Analysis Complete',
                    description: 'Resume critique has been refreshed.',
                });
            } else {
                throw new Error(result.error || 'Failed to analyze resume');
            }
        } catch (error) {
            console.error('Critique error:', error);
            toast({
                title: 'Analysis Failed',
                description: 'Could not generate critique. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsRefreshing(false);
        }
    };

    const downloadAsText = () => {
        const blob = new Blob([editedResume], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tailored-resume.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    const clearHistory = () => {
        if (confirm("Are you sure you want to clear the analysis history?")) {
            localStorage.removeItem(`resume_analysis_history_${applicationId}`);
            setHistory([]);
            toast({
                title: "History Cleared",
                description: "Analysis history has been removed.",
            });
        }
    };

    const handleAutoImprove = async () => {
        setIsAutoImproving(true);
        // Save current version for diff comparison later if needed
        const currentVersion = editedResume;

        try {
            if (!critique) {
                toast({
                    title: "Analysis Required",
                    description: "Please run an analysis first.",
                    variant: "destructive"
                });
                return;
            }

            const result = await rewriteResumeAction({
                currentResume: editedResume,
                jobDescription,
                critique
            });

            if (result.success && result.data) {
                const improvedResume = result.data.improvedResume;
                setEditedResume(improvedResume);

                // Compute diff
                const diff = computeSimpleDiff(currentVersion, improvedResume);
                setDiffLines(diff);
                setShowDiff(true);

                toast({
                    title: "Resume Improved!",
                    description: `Applied ${result.data.improvementsMade.length} improvements based on the critique.`,
                });
            } else {
                throw new Error(result.error || "Failed to auto-improve resume.");
            }
        } catch (error) {
            console.error("Auto-improve error:", error);
            toast({
                title: "Improvement Failed",
                description: "Could not auto-improve the resume. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsAutoImproving(false);
        }
    };

    // Show empty state with refresh button if no critique
    if (!critique) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center space-y-4">
                    <Brain className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">No analysis available yet</p>
                    <Button onClick={handleRefreshCritique} disabled={isRefreshing}>
                        {isRefreshing ? (
                            <><Brain className="h-4 w-4 mr-2 animate-pulse" /> Analyzing...</>
                        ) : (
                            <><RefreshCw className="h-4 w-4 mr-2" /> Run Analysis</>
                        )}
                    </Button>
                    {history.length > 0 && (
                        <div className="mt-8 border-t pt-6 w-full max-w-sm mx-auto">
                            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center justify-center gap-2">
                                <History className="h-4 w-4" /> Past Analyses
                            </h4>
                            <div className="space-y-2">
                                {history.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group" onClick={() => handleHistorySelect(item.id)}>
                                        <div className="flex flex-col items-start">
                                            <span className="text-sm font-medium">{format(item.timestamp, 'MMM d, h:mm a')}</span>
                                            <span className={`text-xs ${strengthColors[item.critique.overallAssessment.strengthLevel]}`}>
                                                Score: {item.score}% - {item.critique.overallAssessment.strengthLevel}
                                            </span>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-4 w-full text-xs text-muted-foreground hover:text-destructive"
                                onClick={clearHistory}
                            >
                                Clear History
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const highPriorityItems = critique.improvements.filter((i) => i.priority === 'HIGH');
    const mediumPriorityItems = critique.improvements.filter((i) => i.priority === 'MEDIUM');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* LEFT COLUMN: Smart Feedback */}
            <ScrollArea className="h-[80vh] pr-4">
                <div className="space-y-6">
                    {/* Match Score Header */}
                    <Card className="border-2 border-primary/20 bg-primary/5">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground mb-1">Current Match Score</p>
                                    <p className="text-4xl font-bold text-primary">{matchingScore}%</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground mb-1">Strength Level</p>
                                    <p className={`text-lg font-bold ${strengthColors[critique.overallAssessment.strengthLevel]}`}>
                                        {critique.overallAssessment.strengthLevel}
                                    </p>
                                </div>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={handleRefreshCritique}
                                    disabled={isRefreshing}
                                    title="Refresh Analysis"
                                >
                                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="default"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    title="Save to Database"
                                >
                                    <Save className={`h-4 w-4 ${isSaving ? 'animate-pulse' : ''}`} />
                                </Button>
                                {critique && (
                                    <Button
                                        size="icon"
                                        variant="default"
                                        className="bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20"
                                        onClick={handleAutoImprove}
                                        disabled={isAutoImproving || isRefreshing}
                                        title="Auto-Fix Resume (AI)"
                                    >
                                        <Sparkles className={`h-4 w-4 ${isAutoImproving ? 'animate-spin' : ''}`} />
                                    </Button>
                                )}
                            </div>

                            {history.length > 0 && (
                                <div className="mt-4 border-t pt-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <History className="h-4 w-4" />
                                            <span>Analysis History:</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Select onValueChange={handleHistorySelect}>
                                                <SelectTrigger className="w-[180px] h-8 text-xs">
                                                    <SelectValue placeholder="View past analysis..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {history.map((item) => (
                                                        <SelectItem key={item.id} value={item.id} className="text-xs">
                                                            {format(item.timestamp, 'MMM d, h:mm a')} ({item.score}%)
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                onClick={clearHistory}
                                                title="Clear History"
                                            >
                                                <span className="sr-only">Clear History</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <Separator className="my-4" />
                            <div className="space-y-2">
                                <p className="text-sm font-semibold text-foreground">Brutal Assessment:</p>
                                <p className="text-sm text-muted-foreground italic border-l-4 border-destructive pl-3">
                                    "{critique.overallAssessment.verdict}"
                                </p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    <strong>vs. Competition:</strong> {critique.overallAssessment.competitivePosition}
                                </p>
                            </div>
                        </CardContent >
                    </Card >

                    {/* Critical Gaps */}
                    {
                        critique.criticalGaps.length > 0 && (
                            <Card className="border-l-4 border-l-destructive">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <AlertTriangle className="h-5 w-5 text-destructive" />
                                        Critical Dealbreakers
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {critique.criticalGaps.map((gap, idx) => (
                                        <div key={idx} className="flex items-start gap-2">
                                            <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                                            <p className="text-sm text-muted-foreground flex-1">{gap}</p>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )
                    }

                    {/* HIGH Priority Improvements */}
                    {
                        highPriorityItems.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-orange-500" />
                                    <h3 className="font-semibold text-lg">High-Impact Fixes (Do Now)</h3>
                                </div>
                                {highPriorityItems.map((item, idx) => (
                                    <Card key={idx} className="border-l-4 border-l-orange-500">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <Badge variant={priorityColors[item.priority]} className="mb-2">
                                                        {item.category}
                                                    </Badge>
                                                    <CardTitle className="text-base">{item.title}</CardTitle>
                                                </div>
                                                <div className="flex items-center gap-1 ml-2">
                                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                                    <span className="text-sm font-bold text-green-600">+{item.estimatedImpact}</span>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3 pt-0">
                                            <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-md border border-red-200 dark:border-red-800">
                                                <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">❌ What's Wrong:</p>
                                                <p className="text-sm text-red-700 dark:text-red-300">{item.criticism}</p>
                                            </div>
                                            <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-md border border-green-200 dark:border-green-800">
                                                <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">✅ Fix It:</p>
                                                <p className="text-sm text-green-700 dark:text-green-300">{item.suggestion}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )
                    }

                    {/* MEDIUM Priority Improvements */}
                    {
                        mediumPriorityItems.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Target className="h-5 w-5 text-blue-500" />
                                    <h3 className="font-semibold text-lg">Polish & Optimize</h3>
                                </div>
                                {mediumPriorityItems.slice(0, 3).map((item, idx) => (
                                    <Card key={idx} className="border-l-2 border-l-blue-400">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <Badge variant="outline" className="mb-2 text-xs">
                                                        {item.category}
                                                    </Badge>
                                                    <CardTitle className="text-sm">{item.title}</CardTitle>
                                                </div>
                                                <span className="text-xs text-muted-foreground">+{item.estimatedImpact}</span>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <p className="text-xs text-muted-foreground mb-2">
                                                <strong>Issue:</strong> {item.criticism}
                                            </p>
                                            <p className="text-xs text-foreground">
                                                <strong>Fix:</strong> {item.suggestion}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )
                    }

                    {/* Psychological Insights */}
                    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Brain className="h-5 w-5 text-purple-600" />
                                Psychological Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium">Readability (6-second scan)</span>
                                    <span className="font-bold">{critique.psychologicalInsights.readabilityScore}%</span>
                                </div>
                                <Progress value={critique.psychologicalInsights.readabilityScore} className="h-2" />
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-medium">Authority Tone</span>
                                    <span className="font-bold">{critique.psychologicalInsights.authorityTone}%</span>
                                </div>
                                <Progress value={critique.psychologicalInsights.authorityTone} className="h-2" />
                            </div>
                            <div className="pt-2">
                                <p className="text-xs font-semibold mb-1">Unique Value Proposition:</p>
                                <p className="text-sm text-muted-foreground italic">"{critique.psychologicalInsights.valueProposition}"</p>
                            </div>
                            {critique.psychologicalInsights.subconsciousFlags.length > 0 && (
                                <div className="pt-2">
                                    <p className="text-xs font-semibold mb-2 text-orange-600">⚠️ Subconscious Red Flags:</p>
                                    <ul className="space-y-1">
                                        {critique.psychologicalInsights.subconsciousFlags.map((flag, idx) => (
                                            <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                                                <span className="text-orange-500">•</span>
                                                <span>{flag}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* KPI Optimization */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <BarChart3 className="h-5 w-5 text-blue-600" />
                                KPI & Metrics Analysis
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="text-center p-3 bg-muted/50 rounded-lg">
                                    <p className="text-2xl font-bold text-primary">{critique.kpiOptimization.metricsPresent}%</p>
                                    <p className="text-xs text-muted-foreground mt-1">Metrics</p>
                                </div>
                                <div className="text-center p-3 bg-muted/50 rounded-lg">
                                    <p className="text-2xl font-bold text-primary">{critique.kpiOptimization.actionVerbStrength}%</p>
                                    <p className="text-xs text-muted-foreground mt-1">Action Verbs</p>
                                </div>
                                <div className="text-center p-3 bg-muted/50 rounded-lg">
                                    <p className="text-2xl font-bold text-primary">{critique.kpiOptimization.industrySynergy}%</p>
                                    <p className="text-xs text-muted-foreground mt-1">Industry Fit</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-semibold mb-2">Recommended KPI Improvements:</p>
                                <ul className="space-y-1">
                                    {critique.kpiOptimization.recommendations.map((rec, idx) => (
                                        <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                                            <span className="text-blue-500">→</span>
                                            <span>{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div >
            </ScrollArea >

            {/* RIGHT COLUMN: Resume Editor */}
            < div className="flex flex-col h-[80vh] border rounded-lg bg-card" >
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold text-lg">Your Resume</h3>
                    <div className="flex items-center gap-2">
                        {diffLines && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setShowDiff(!showDiff)}
                                className={showDiff ? "bg-muted" : ""}
                            >
                                {showDiff ? <><Pencil className="h-3 w-3 mr-2" /> Edit</> : <><Eye className="h-3 w-3 mr-2" /> View Changes</>}
                            </Button>
                        )}
                        <Button size="icon" variant="outline" onClick={downloadAsText} title="Download as .TXT">
                            <Download className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                {
                    showDiff && diffLines ? (
                        <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed bg-background">
                            {diffLines.map((line, idx) => {
                                if (line.type === 'added') {
                                    return <div key={idx} className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-1 border-l-2 border-green-500 whitespace-pre-wrap">+ {line.text}</div>;
                                } else if (line.type === 'removed') {
                                    return <div key={idx} className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 px-1 border-l-2 border-red-500 whitespace-pre-wrap line-through opacity-70">- {line.text}</div>;
                                } else {
                                    return <div key={idx} className="px-1 text-muted-foreground whitespace-pre-wrap">{line.text}</div>;
                                }
                            })}
                        </div>
                    ) : (
                        <Textarea
                            value={editedResume}
                            onChange={(e) => setEditedResume(e.target.value)}
                            className="flex-1 resize-none rounded-none border-0 font-mono text-xs leading-relaxed focus-visible:ring-0"
                            placeholder="Edit your resume here..."
                        />
                    )
                }
            </div >
        </div >
    );
}
