'use client';

import { useState, useEffect } from 'react';
import { JobCard } from './job-card';
import { searchJobsAction, type JobSearchFilters, type Job } from '@/app/actions/adzuna-actions';
import { calculateJobMatchAction, type JobMatchScore } from '@/app/actions/job-match-action';
import { tailorResumeAction } from '@/app/actions/ai-actions';
import { suggestJobTitlesAction } from '@/app/actions/job-suggestions-action';
import { useSimplePortfolio } from '@/context/simple-portfolio-context';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Filter, Loader2, RefreshCw, Sparkles, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function JobSearch() {
    const { personalInfo } = useSimplePortfolio();
    const { user } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(false);
    const [analyzingMatch, setAnalyzingMatch] = useState(false);
    const [matchScores, setMatchScores] = useState<Map<string, JobMatchScore>>(new Map());
    const [sortByMatch, setSortByMatch] = useState(false);
    const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
    const [jobSuggestions, setJobSuggestions] = useState<string[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [filters, setFilters] = useState<JobSearchFilters>({
        what: '',
        where: 'Montreal',
        max_days_old: 14,
        country: 'ca',
        page: 1
    });

    // Load state from sessionStorage on mount
    useEffect(() => {
        const savedState = sessionStorage.getItem('jobSearchState');
        if (savedState) {
            try {
                const parsed = JSON.parse(savedState);
                if (parsed.jobs) setJobs(parsed.jobs);
                if (parsed.filters) setFilters(parsed.filters);
                if (parsed.matchScores) setMatchScores(new Map(parsed.matchScores));
                if (parsed.savedJobIds) setSavedJobIds(new Set(parsed.savedJobIds));
            } catch (e) {
                console.error('Failed to load job search state', e);
            }
        }
    }, []);

    // Save state to sessionStorage whenever it changes
    useEffect(() => {
        const stateToSave = {
            jobs,
            filters,
            matchScores: Array.from(matchScores.entries()),
            savedJobIds: Array.from(savedJobIds)
        };
        sessionStorage.setItem('jobSearchState', JSON.stringify(stateToSave));
    }, [jobs, filters, matchScores, savedJobIds]);

    const { toast } = useToast();

    const handleSaveToHistory = async (job: Job, matchScore: JobMatchScore) => {
        if (!user) {
            toast({ title: "Not authenticated", description: "Please sign in to save jobs", variant: "destructive" });
            return;
        }

        const firstResume = personalInfo.resumeSummaries?.[0];
        if (!firstResume || !firstResume.content) {
            toast({ title: "No resume found", description: "Please add a base resume first", variant: "destructive" });
            return;
        }

        try {
            toast({ title: "Generating application...", description: "Creating tailored resume and cover letter" });

            // Generate full tailored resume and cover letter
            const result = await tailorResumeAction({
                resume: firstResume.content,
                jobDescription: job.description,
                language: 'English', // Default to English, could be made configurable
            });

            if (!result.success || !result.data) {
                throw new Error(result.error || 'Failed to generate application');
            }

            const aiData = result.data;

            // Save to Firestore
            await addDoc(collection(db, `users/${user.uid}/applications`), {
                userId: user.uid,
                jobTitle: aiData.jobTitle,
                company: job.company,
                jobDescription: job.description,
                applicationLink: job.url || '',
                tailoredResume: aiData.resume,
                coverLetter: aiData.coverLetter,
                language: 'English',
                matchingScore: aiData.matchingScore,
                matchingSkills: aiData.matchingSkills,
                lackingSkills: aiData.lackingSkills,
                applied: false,
                createdAt: serverTimestamp(),
            });

            toast({
                title: "Saved to history!",
                description: "Application with tailored resume and cover letter saved successfully.",
                duration: 5000
            });

            // Mark job as saved
            setSavedJobIds(prev => new Set(prev).add(job.id));

        } catch (error) {
            console.error('Save to history error:', error);
            toast({
                title: "Failed to save",
                description: error instanceof Error ? error.message : "Could not save to history",
                variant: "destructive"
            });
            throw error;
        }
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            const result = await searchJobsAction(filters);
            if (result.success && result.data) {
                setJobs(result.data);
                if (result.data.length === 0) {
                    toast({ title: "No jobs found", description: "Try adjusting your search criteria." });
                }
            } else {
                toast({ title: "Error", description: result.error || "Failed to fetch jobs", variant: "destructive" });
            }
        } catch (error) {
            console.error("Search error:", error);
            toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setFilters({
            what: '',
            where: 'Montreal',
            max_days_old: 14,
            country: 'ca',
            page: 1
        });
        setJobs([]);
        setMatchScores(new Map());
        setSortByMatch(false);
    };

    const handleBestMatch = async () => {
        if (jobs.length === 0) {
            toast({ title: "No jobs to analyze", description: "Search for jobs first" });
            return;
        }

        // Get first resume
        const firstResume = personalInfo.resumeSummaries?.[0];
        if (!firstResume || !firstResume.content) {
            toast({
                title: "No resume found",
                description: "Please add a base resume in the Application Tracker tab first",
                variant: "destructive"
            });
            return;
        }

        setAnalyzingMatch(true);
        setSortByMatch(true);

        try {
            // Find next 10 unscored jobs
            const jobsToAnalyze = jobs.filter(job => !matchScores.has(job.id)).slice(0, 10);

            if (jobsToAnalyze.length === 0) {
                toast({
                    title: "All jobs analyzed",
                    description: "All current jobs have been scored. Search for more jobs to continue.",
                    duration: 5000
                });
                setAnalyzingMatch(false);
                return;
            }

            toast({
                title: "Analyzing jobs...",
                description: `Scoring ${jobsToAnalyze.length} job${jobsToAnalyze.length > 1 ? 's' : ''} against your resume`
            });

            const newScores = new Map(matchScores);

            // Analyze jobs in parallel (but limit to avoid overwhelming the API)
            const batchSize = 3;
            for (let i = 0; i < jobsToAnalyze.length; i += batchSize) {
                const batch = jobsToAnalyze.slice(i, i + batchSize);
                const results = await Promise.all(
                    batch.map(job =>
                        calculateJobMatchAction(
                            firstResume.content,
                            job.description,
                            job.title
                        )
                    )
                );

                batch.forEach((job, index) => {
                    const result = results[index];
                    if (result.success && result.data) {
                        newScores.set(job.id, result.data);
                    }
                });
            }

            setMatchScores(newScores);

            const totalScored = newScores.size;
            const remaining = jobs.length - totalScored;

            toast({
                title: "Analysis complete!",
                description: `Scored ${jobsToAnalyze.length} jobs (${totalScored}/${jobs.length} total). ${remaining > 0 ? `Click again to analyze ${Math.min(remaining, 10)} more.` : 'All jobs scored!'}`,
                duration: 5000
            });

        } catch (error) {
            console.error("Match analysis error:", error);
            toast({
                title: "Analysis failed",
                description: "Could not analyze jobs. Please try again.",
                variant: "destructive"
            });
        } finally {
            setAnalyzingMatch(false);
        }
    };

    const handleGenerateSuggestions = async () => {
        const firstResume = personalInfo.resumeSummaries?.[0];
        if (!firstResume || !firstResume.content) {
            toast({ title: "No resume found", description: "Please add a base resume first", variant: "destructive" });
            return;
        }

        setLoadingSuggestions(true);
        try {
            const result = await suggestJobTitlesAction({ resume: firstResume.content });
            if (result.success && result.data) {
                setJobSuggestions(result.data.suggestions);
                toast({ title: "Suggestions ready!", description: "Click any suggestion to search", duration: 3000 });
            } else {
                throw new Error(result.error || 'Failed to generate suggestions');
            }
        } catch (error) {
            console.error('Suggestions error:', error);
            toast({
                title: "Failed to generate suggestions",
                description: error instanceof Error ? error.message : "Please try again",
                variant: "destructive"
            });
        } finally {
            setLoadingSuggestions(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-card border rounded-lg p-4 shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-5 relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Job title, keywords, or company"
                            className="pl-9"
                            value={filters.what || ''}
                            onChange={(e) => setFilters({ ...filters, what: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <div className="md:col-span-4 relative">
                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="City, region, or postcode"
                            className="pl-9"
                            value={filters.where || ''}
                            onChange={(e) => setFilters({ ...filters, where: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <div className="md:col-span-3">
                        <Button onClick={handleSearch} disabled={loading} className="w-full">
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                            Find Jobs
                        </Button>
                    </div>
                </div>

                {/* AI Job Suggestions */}
                <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Lightbulb className="h-4 w-4" />
                            <span>AI Job Suggestions</span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleGenerateSuggestions}
                            disabled={loadingSuggestions}
                        >
                            {loadingSuggestions ? (
                                <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Generating...</>
                            ) : (
                                <><Sparkles className="mr-2 h-3 w-3" /> Get Suggestions</>
                            )}
                        </Button>
                    </div>
                    {jobSuggestions.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {jobSuggestions.map((suggestion, index) => (
                                <Button
                                    key={index}
                                    variant="secondary"
                                    size="sm"
                                    className="text-xs"
                                    onClick={() => {
                                        setFilters({ ...filters, what: suggestion });
                                        handleSearch();
                                    }}
                                >
                                    {suggestion}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-4 items-center pt-2 border-t">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Filters:</span>
                    </div>

                    <Select
                        value={filters.country}
                        onValueChange={(val) => setFilters({ ...filters, country: val })}
                    >
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                            <SelectValue placeholder="Country" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="fr">France</SelectItem>
                            <SelectItem value="gb">United Kingdom</SelectItem>
                            <SelectItem value="us">United States</SelectItem>
                            <SelectItem value="de">Germany</SelectItem>
                            <SelectItem value="ca">Canada</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.max_days_old?.toString() || "all"}
                        onValueChange={(val) => setFilters({ ...filters, max_days_old: val === "all" ? undefined : Number(val) })}
                    >
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                            <SelectValue placeholder="Date Posted" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Any time</SelectItem>
                            <SelectItem value="1">Last 24 hours</SelectItem>
                            <SelectItem value="3">Last 3 days</SelectItem>
                            <SelectItem value="7">Last 7 days</SelectItem>
                            <SelectItem value="14">Last 14 days</SelectItem>
                            <SelectItem value="30">Last 30 days</SelectItem>
                        </SelectContent>
                    </Select>

                    {jobs.length > 0 && (
                        <Button
                            variant={sortByMatch ? "default" : "outline"}
                            size="sm"
                            onClick={handleBestMatch}
                            disabled={analyzingMatch}
                            className="h-8 text-xs"
                        >
                            {analyzingMatch ? (
                                <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Analyzing...</>
                            ) : (
                                <><Sparkles className="mr-2 h-3 w-3" /> Best Match</>
                            )}
                        </Button>
                    )}

                    {(filters.what || filters.where || filters.max_days_old) && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto h-8 text-xs text-muted-foreground">
                            <RefreshCw className="mr-2 h-3 w-3" />
                            Reset Filters
                        </Button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-48 rounded-lg bg-muted/20 animate-pulse" />
                    ))}
                </div>
            ) : jobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(sortByMatch
                        ? [...jobs].sort((a, b) => {
                            const scoreA = matchScores.get(a.id)?.matchingScore ?? -1;
                            const scoreB = matchScores.get(b.id)?.matchingScore ?? -1;
                            return scoreB - scoreA; // Descending order
                        })
                        : jobs
                    ).map((job) => (
                        <JobCard
                            key={job.id}
                            job={job}
                            matchScore={matchScores.get(job.id)}
                            onSaveToHistory={handleSaveToHistory}
                            isSaved={savedJobIds.has(job.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-medium">No jobs found</h3>
                    <p className="text-sm">Try adjusting your search criteria to find relevant positions.</p>
                </div>
            )}
        </div>
    );
}
