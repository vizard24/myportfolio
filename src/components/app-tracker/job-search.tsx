'use client';

import { useState, useEffect } from 'react';
import { JobCard } from './job-card';
import { searchAllJobsAction } from '@/app/actions/job-aggregator-action';
import { type JobSearchFilters, type Job } from '@/app/actions/adzuna-actions';
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
import { Search, MapPin, Filter, Loader2, RefreshCw, Sparkles, Lightbulb, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TargetPosition { id: string; title: string; }

// Lightweight keyword relevance check  — no AI needed, runs instantly
const STOP_WORDS = new Set(['the', 'a', 'an', 'and', 'or', 'of', 'in', 'at', 'for', 'to', 'is', 'are', 'was', 'be', 'with', 'as', 'by', 'on']);
function isRelevantToPosition(jobTitle: string, positionTitle: string): boolean {
    const keywords = positionTitle.toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 2 && !STOP_WORDS.has(w));
    if (keywords.length === 0) return false;
    const title = jobTitle.toLowerCase();
    return keywords.some(kw => title.includes(kw));
}

/** Gets the single base resume for a position from personalInfo */
function getResumeForPosition(posId: string, personalInfo: any): { id: string; title: string; content: string } | null {
    const posResumes = personalInfo.positionResumes as Record<string, any[]> | undefined;
    if (posResumes && posResumes[posId]?.[0]) return posResumes[posId][0];
    // Legacy fallback: first position uses resumeSummaries
    const positions = personalInfo.targetPositions as TargetPosition[] | undefined;
    if (!positions || positions[0]?.id === posId) {
        const legacy = personalInfo.resumeSummaries?.[0];
        if (legacy) return legacy;
    }
    return null;
}

export function JobSearch() {
    const { personalInfo } = useSimplePortfolio();
    const { user } = useAuth();
    const { toast } = useToast();

    // Positions from App Tracker
    const positions: TargetPosition[] = (personalInfo as any).targetPositions || [];

    // Read sessionStorage once at mount — avoids race between load & save effects
    const _ss = (() => {
        if (typeof window === 'undefined') return null;
        try { return JSON.parse(sessionStorage.getItem('jobSearchState') || 'null'); }
        catch { return null; }
    })();

    const [selectedPositionId, setSelectedPositionId] = useState<string>(
        _ss?.selectedPositionId || positions[0]?.id || ''
    );
    // Sync when personalInfo loads (e.g. first Firebase fetch)
    useEffect(() => {
        if (positions.length > 0 && !positions.find(p => p.id === selectedPositionId)) {
            setSelectedPositionId(positions[0].id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [(personalInfo as any).targetPositions]);

    const [jobs, setJobs] = useState<Job[]>(_ss?.jobs || []);
    const [loading, setLoading] = useState(false);
    const [analyzingMatch, setAnalyzingMatch] = useState(false);
    const [matchScores, setMatchScores] = useState<Map<string, JobMatchScore>>(
        _ss?.matchScores ? new Map(_ss.matchScores) : new Map()
    );
    const [sortByMatch, setSortByMatch] = useState<boolean>(_ss?.sortByMatch || false);
    const [savedJobIds, setSavedJobIds] = useState<Set<string>>(
        _ss?.savedJobIds ? new Set(_ss.savedJobIds) : new Set()
    );
    const [savingJobIds, setSavingJobIds] = useState<Set<string>>(new Set());
    const [jobSuggestions, setJobSuggestions] = useState<string[]>(_ss?.jobSuggestions || []);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [filters, setFilters] = useState<JobSearchFilters>(_ss?.filters || {
        what: '',
        where: 'Montreal',
        max_days_old: 14,
        country: 'ca',
        page: 1
    });

    // Save to sessionStorage whenever anything meaningful changes
    useEffect(() => {
        sessionStorage.setItem('jobSearchState', JSON.stringify({
            jobs, filters, sortByMatch, jobSuggestions,
            matchScores: Array.from(matchScores.entries()),
            savedJobIds: Array.from(savedJobIds),
            selectedPositionId,
        }));
    }, [jobs, filters, matchScores, savedJobIds, selectedPositionId, sortByMatch, jobSuggestions]);

    /** Save a job card directly → generate tailored app → save to Firestore with positionId */
    const handleSaveJob = async (job: Job) => {
        if (!user) {
            toast({ title: "Not authenticated", description: "Please sign in to save jobs", variant: "destructive" });
            return;
        }
        const resume = getResumeForPosition(selectedPositionId, personalInfo);
        if (!resume || !resume.content) {
            toast({ title: "No base resume", description: "Add a base resume to the selected position in App Tracker first.", variant: "destructive" });
            return;
        }

        setSavingJobIds(prev => new Set(prev).add(job.id));
        try {
            toast({ title: "Generating application…", description: "Tailoring resume & cover letter for this job." });

            const result = await tailorResumeAction({
                resume: resume.content,
                jobDescription: job.description,
                language: 'English',
            });

            if (!result.success || !result.data) throw new Error(result.error || 'Failed to generate application');

            const aiData = result.data;

            await addDoc(collection(db, `users/${user.uid}/applications`), {
                userId: user.uid,
                jobTitle: aiData.jobTitle || job.title,
                company: job.company,
                jobDescription: job.description,
                applicationLink: job.url || '',
                tailoredResume: aiData.resume,
                coverLetter: aiData.coverLetter,
                language: 'English',
                matchingScore: aiData.matchingScore,
                matchingSkills: aiData.matchingSkills,
                lackingSkills: aiData.lackingSkills,
                positionId: selectedPositionId,
                applied: false,
                createdAt: serverTimestamp(),
            });

            setSavedJobIds(prev => new Set(prev).add(job.id));
            toast({ title: "Saved to App Tracker!", description: `Saved under "${positions.find(p => p.id === selectedPositionId)?.title || 'your position'}" in the application history.`, duration: 5000 });
        } catch (error) {
            toast({ title: "Failed to save", description: error instanceof Error ? error.message : "Could not save to history", variant: "destructive" });
        } finally {
            setSavingJobIds(prev => { const s = new Set(prev); s.delete(job.id); return s; });
        }
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            const result = await searchAllJobsAction(filters);
            if (result.success && result.data) {
                setJobs(result.data);
                if (result.data.length === 0) toast({ title: "No jobs found", description: "Try adjusting your search criteria." });
            } else {
                toast({ title: "Error", description: result.error || "Failed to fetch jobs", variant: "destructive" });
            }
        } catch { toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" }); }
        finally { setLoading(false); }
    };

    const clearFilters = () => {
        setFilters({ what: '', where: 'Montreal', max_days_old: 14, country: 'ca', page: 1 });
        setJobs([]); setMatchScores(new Map()); setSortByMatch(false);
    };

    const handleBestMatch = async () => {
        if (jobs.length === 0) { toast({ title: "No jobs to analyze", description: "Search for jobs first" }); return; }

        const resume = getResumeForPosition(selectedPositionId, personalInfo);
        if (!resume || !resume.content) {
            toast({ title: "No resume for this position", description: "Add a base resume to the selected position in App Tracker first.", variant: "destructive" });
            return;
        }

        setAnalyzingMatch(true); setSortByMatch(true);
        try {
            const jobsToAnalyze = jobs.filter(job => !matchScores.has(job.id)).slice(0, 10);
            if (jobsToAnalyze.length === 0) {
                toast({ title: "All jobs analyzed", description: "Search for more jobs to continue.", duration: 5000 });
                setAnalyzingMatch(false); return;
            }
            toast({ title: "Analyzing jobs…", description: `Scoring ${jobsToAnalyze.length} job${jobsToAnalyze.length > 1 ? 's' : ''} against "${resume.title}"` });

            const newScores = new Map(matchScores);
            const batchSize = 3;
            for (let i = 0; i < jobsToAnalyze.length; i += batchSize) {
                const batch = jobsToAnalyze.slice(i, i + batchSize);
                const results = await Promise.all(batch.map(job => calculateJobMatchAction(resume.content, job.description, job.title)));
                batch.forEach((job, idx) => { if (results[idx].success && results[idx].data) newScores.set(job.id, results[idx].data!); });
            }
            setMatchScores(newScores);
            const remaining = jobs.length - newScores.size;
            toast({ title: "Analysis complete!", description: `${newScores.size}/${jobs.length} scored.${remaining > 0 ? ` Click again for ${Math.min(remaining, 10)} more.` : ''}`, duration: 5000 });
        } catch { toast({ title: "Analysis failed", description: "Could not analyze jobs. Please try again.", variant: "destructive" }); }
        finally { setAnalyzingMatch(false); }
    };

    const handleGenerateSuggestions = async () => {
        const resume = getResumeForPosition(selectedPositionId, personalInfo);
        if (!resume || !resume.content) {
            toast({ title: "No resume found", description: "Add a base resume to the selected position first.", variant: "destructive" }); return;
        }
        setLoadingSuggestions(true);
        try {
            const result = await suggestJobTitlesAction({ resume: resume.content });
            if (result.success && result.data) {
                setJobSuggestions(result.data.suggestions);
                toast({ title: "Suggestions ready!", description: "Click any suggestion to search", duration: 3000 });
            } else throw new Error(result.error || 'Failed to generate suggestions');
        } catch (error) {
            toast({ title: "Failed to generate suggestions", description: error instanceof Error ? error.message : "Please try again", variant: "destructive" });
        } finally { setLoadingSuggestions(false); }
    };

    return (
        <div className="space-y-6">
            <div className="bg-card border rounded-lg p-4 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-center w-full">
                    <div className="relative w-full flex-[5]">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Job title, keywords, or company" className="pl-9" value={filters.what || ''} onChange={(e) => setFilters({ ...filters, what: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                    </div>
                    <div className="relative w-full flex-[4]">
                        <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="City, region, or postcode" className="pl-9" value={filters.where || ''} onChange={(e) => setFilters({ ...filters, where: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
                    </div>
                    <div className="w-full flex-[3]">
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
                            <Lightbulb className="h-4 w-4" /><span>AI Job Suggestions</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleGenerateSuggestions} disabled={loadingSuggestions}>
                            {loadingSuggestions ? <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Generating...</> : <><Sparkles className="mr-2 h-3 w-3" /> Get Suggestions</>}
                        </Button>
                    </div>
                    {jobSuggestions.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {jobSuggestions.map((suggestion, index) => (
                                <Button key={index} variant="secondary" size="sm" className="text-xs" onClick={() => { setFilters({ ...filters, what: suggestion }); handleSearch(); }}>{suggestion}</Button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Filters row */}
                <div className="flex flex-wrap gap-3 items-center pt-2 border-t">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Filters:</span>
                    </div>

                    {/* Position selector */}
                    {positions.length > 0 && (
                        <div className="flex items-center gap-1.5">
                            <Target className="h-4 w-4 text-primary" />
                            <div className="flex flex-wrap gap-1">
                                {positions.map(pos => (
                                    <button
                                        key={pos.id}
                                        onClick={() => setSelectedPositionId(pos.id)}
                                        className={`rounded-full border px-3 py-0.5 text-xs font-medium transition-all ${selectedPositionId === pos.id
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-card text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                                            }`}
                                    >
                                        {pos.title}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <Select value={filters.country} onValueChange={(val) => setFilters({ ...filters, country: val })}>
                        <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Country" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="fr">France</SelectItem>
                            <SelectItem value="gb">United Kingdom</SelectItem>
                            <SelectItem value="us">United States</SelectItem>
                            <SelectItem value="de">Germany</SelectItem>
                            <SelectItem value="ca">Canada</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filters.max_days_old?.toString() || "all"} onValueChange={(val) => setFilters({ ...filters, max_days_old: val === "all" ? undefined : Number(val) })}>
                        <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue placeholder="Date Posted" /></SelectTrigger>
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
                        <Button variant={sortByMatch ? "default" : "outline"} size="sm" onClick={handleBestMatch} disabled={analyzingMatch} className="h-8 text-xs">
                            {analyzingMatch ? <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Analyzing...</> : <><Sparkles className="mr-2 h-3 w-3" /> Best Match</>}
                        </Button>
                    )}

                    {(filters.what || filters.where || filters.max_days_old) && (
                        <Button variant="ghost" size="sm" onClick={clearFilters} className="ml-auto h-8 text-xs text-muted-foreground">
                            <RefreshCw className="mr-2 h-3 w-3" /> Reset Filters
                        </Button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-48 rounded-lg bg-muted/20 animate-pulse" />)}
                </div>
            ) : jobs.length > 0 ? (() => {
                const selectedPos = positions.find(p => p.id === selectedPositionId);
                const posTitle = selectedPos?.title ?? '';

                // Split into relevant / other
                const sortedJobs = sortByMatch
                    ? [...jobs].sort((a, b) => (matchScores.get(b.id)?.matchingScore ?? -1) - (matchScores.get(a.id)?.matchingScore ?? -1))
                    : jobs;
                const relevantJobs = sortedJobs.filter(j => isRelevantToPosition(j.title, posTitle));
                const otherJobs = sortedJobs.filter(j => !isRelevantToPosition(j.title, posTitle));

                const renderCard = (job: Job) => (
                    <JobCard
                        key={job.id}
                        job={job}
                        matchScore={matchScores.get(job.id)}
                        onSaveToHistory={(j) => handleSaveJob(j)}
                        onDirectSave={handleSaveJob}
                        isSaved={savedJobIds.has(job.id)}
                        isSaving={savingJobIds.has(job.id)}
                    />
                );

                return (
                    <div className="space-y-8">
                        {/* ── Relevant section ── */}
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-sm font-semibold text-primary">Relevant to &ldquo;{posTitle}&rdquo;</span>
                                <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">{relevantJobs.length}</span>
                                <div className="flex-1 h-px bg-border" />
                            </div>
                            {relevantJobs.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {relevantJobs.map(renderCard)}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                                    <p className="text-sm">No results matched &ldquo;{posTitle}&rdquo; — try a different position or search term.</p>
                                </div>
                            )}
                        </div>

                        {/* ── Other results section ── */}
                        {otherJobs.length > 0 && (
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex-1 h-px bg-border" />
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Other results</span>
                                    <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">{otherJobs.length}</span>
                                    <div className="flex-1 h-px bg-border" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {otherJobs.map(renderCard)}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })() : (
                <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                    <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-medium">No jobs found</h3>
                    <p className="text-sm">Try adjusting your search criteria to find relevant positions.</p>
                </div>
            )}
        </div>
    );
}
