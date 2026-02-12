'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ShieldOff, FileText, Loader2, Save, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import type { Job } from "@/app/actions/adzuna-actions";
import type { JobMatchScore } from "@/app/actions/job-match-action";

interface JobFitDialogProps {
    job: Job;
    matchScore: JobMatchScore;
    onSaveToHistory?: (job: Job, matchScore: JobMatchScore) => Promise<void>;
}

export function JobFitDialog({ job, matchScore, onSaveToHistory }: JobFitDialogProps) {
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [descriptionExpanded, setDescriptionExpanded] = useState(false);

    // Truncate description if not expanded
    const shouldTruncate = job.description.length > 400;
    const displayDescription = descriptionExpanded || !shouldTruncate
        ? job.description
        : job.description.slice(0, 400) + '...';

    const handleSave = async () => {
        if (!onSaveToHistory) return;

        setSaving(true);
        try {
            await onSaveToHistory(job, matchScore);
            setOpen(false);
        } catch (error) {
            console.error('Failed to save:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Badge
                    variant="secondary"
                    className="flex-shrink-0 text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
                    title="Click for detailed fit analysis"
                >
                    {matchScore.matchingScore}% Match
                </Badge>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{job.title}</DialogTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{job.company}</span>
                        <span>•</span>
                        <span>{job.location}</span>
                    </div>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Match Score Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Fit Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col md:flex-row items-center gap-6">
                            <div className="flex flex-col items-center gap-2">
                                <div className="relative h-24 w-24">
                                    <svg className="h-full w-full" viewBox="0 0 36 36">
                                        <path className="text-muted/20" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                                        <path className="text-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray={`${matchScore.matchingScore}, 100`} />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-2xl font-bold text-primary">{matchScore.matchingScore}%</span>
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-primary">Match Score</p>
                            </div>
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                                <div>
                                    <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" /> Matching Skills
                                    </h4>
                                    <div className="flex flex-wrap gap-1">
                                        {matchScore.matchingSkills.map(skill => (
                                            <Badge key={skill} variant="secondary">{skill}</Badge>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                                        <ShieldOff className="h-4 w-4 text-amber-500" /> Lacking Skills
                                    </h4>
                                    <div className="flex flex-wrap gap-1">
                                        {matchScore.lackingSkills.map(skill => (
                                            <Badge key={skill} variant="outline">{skill}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Job Description */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Job Description
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="prose prose-sm max-w-none">
                                <p className="whitespace-pre-wrap text-sm">{displayDescription}</p>
                            </div>
                            {shouldTruncate && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                                    className="mt-2 w-full"
                                >
                                    {descriptionExpanded ? (
                                        <><ChevronUp className="mr-2 h-4 w-4" /> Show Less</>
                                    ) : (
                                        <><ChevronDown className="mr-2 h-4 w-4" /> Show More</>
                                    )}
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex justify-between gap-2 pt-4 border-t">
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            Close
                        </Button>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                asChild
                            >
                                <a href={job.url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="mr-2 h-4 w-4" /> Apply
                                </a>
                            </Button>
                            <Button onClick={handleSave} disabled={saving || !onSaveToHistory}>
                                {saving ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                                ) : (
                                    <><Save className="mr-2 h-4 w-4" /> Save to History</>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
