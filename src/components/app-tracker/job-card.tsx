import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Calendar, MapPin, Building2, Briefcase, Bookmark } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Job } from "@/app/actions/adzuna-actions";
import type { JobMatchScore } from "@/app/actions/job-match-action";
import { JobFitDialog } from "./job-fit-dialog";

interface JobCardProps {
    job: Job;
    matchScore?: JobMatchScore;
    onSaveToHistory?: (job: Job, matchScore: JobMatchScore) => Promise<void>;
    isSaved?: boolean;
}

export function JobCard({ job, matchScore, onSaveToHistory, isSaved }: JobCardProps) {
    const postedDate = new Date(job.datePosted);
    const timeAgo = formatDistanceToNow(postedDate, { addSuffix: true });

    return (
        <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg font-semibold line-clamp-2 flex-1" title={job.title}>
                        {job.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {isSaved && (
                            <Bookmark className="h-4 w-4 text-primary fill-primary" title="Saved to history" />
                        )}
                        <Button size="sm" asChild className="h-8">
                            <a href={job.url} target="_blank" rel="noopener noreferrer">
                                Apply <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                        </Button>
                    </div>
                </div>
                <div className="flex flex-col gap-1 text-sm text-muted-foreground mt-1">
                    <div className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        <span className="line-clamp-1">{job.company}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="line-clamp-1">{job.location}</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow pb-3">
                <p className="text-sm line-clamp-3 mb-3 text-muted-foreground">
                    {job.description}
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                    <Badge variant="secondary" className="font-normal opacity-80">
                        {job.category}
                    </Badge>
                    {job.salary && (
                        <Badge variant="secondary" className="font-normal opacity-80 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200">
                            <Briefcase className="h-3 w-3 mr-1" />
                            {job.salary}
                        </Badge>
                    )}
                </div>
            </CardContent>
            <CardFooter className="pt-0 border-t bg-muted/20 flex justify-between items-center px-6 py-3 mt-auto">
                <div className="flex items-center text-xs text-muted-foreground" title={postedDate.toLocaleDateString()}>
                    <Calendar className="h-3 w-3 mr-1" />
                    {timeAgo}
                </div>
                {matchScore && (
                    <JobFitDialog job={job} matchScore={matchScore} onSaveToHistory={onSaveToHistory} />
                )}
            </CardFooter>
        </Card>
    );
}
