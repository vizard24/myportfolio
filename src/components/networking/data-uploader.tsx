"use client";

import React, { useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLinkedInData, LinkedInDataType } from '@/context/linkedin-data-context';
import { Upload, FileText, CheckCircle2, AlertCircle, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface UploadBoxProps {
    title: string;
    description: string;
    count: number;
    type: LinkedInDataType;
    onUpload: (type: LinkedInDataType, file: File) => void;
    isParsing: boolean;
}

function UploadBox({ title, description, count, type, onUpload, isParsing }: UploadBoxProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpload(type, file);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg bg-card hover:bg-muted/50 transition-colors">
            <div className="mb-4 text-center">
                {count > 0 ? (
                    <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-2" />
                ) : (
                    <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                )}
                <h3 className="font-semibold">{title}</h3>
                {count > 0 ? (
                    <Badge variant="secondary" className="mt-2 bg-green-500/10 text-green-600">{count} Loaded</Badge>
                ) : (
                    <p className="text-sm text-muted-foreground mt-1 max-w-[150px] mx-auto">{description}</p>
                )}
            </div>
            <input type="file" accept=".csv" ref={inputRef} className="hidden" onChange={handleFileChange} disabled={isParsing} />
            <Button
                variant={count > 0 ? "outline" : "default"}
                onClick={() => inputRef.current?.click()}
                disabled={isParsing}
                className="w-full mt-auto"
            >
                {count > 0 ? "Update File" : "Upload File"}
            </Button>
        </div>
    );
}

export function DataUploader() {
    const { connections, messages, invitations, skills, projects, education, positions, recommendations, parseCSVData, isParsing, clearData } = useLinkedInData();
    const [isExpanded, setIsExpanded] = useState(false);

    const hasData = connections.length > 0 || messages.length > 0 || invitations.length > 0 ||
        skills.length > 0 || projects.length > 0 || education.length > 0 ||
        positions.length > 0 || recommendations.length > 0;

    const handleUploadClick = (type: LinkedInDataType, file: File) => {
        parseCSVData(file, type);
    };

    return (
        <Card className="mb-8 border-primary/20 shadow-md">
            <CardHeader className="bg-primary/5 pb-4 cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Upload className="h-5 w-5 text-primary" />
                            LinkedIn Data Sources
                            {!isExpanded ? <ChevronDown className="h-5 w-5 text-muted-foreground" /> : <ChevronUp className="h-5 w-5 text-muted-foreground" />}
                        </CardTitle>
                        <CardDescription className="mt-1">
                            Upload your exported LinkedIn CSV files to unlock networking insights. Your data is processed entirely in your browser.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <div className={cn("overflow-hidden transition-all duration-300", isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0")}>
                <CardContent className="pt-6">
                    <div className="flex justify-between mb-4">
                        <h4 className="font-medium text-lg">Core Contact Data</h4>
                        {hasData && (
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); clearData(); }} className="text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" /> Clear Memory
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <UploadBox
                            title="Connections.csv"
                            description="Required for Density & Dormant Ties"
                            count={connections.length}
                            type="connections"
                            onUpload={handleUploadClick}
                            isParsing={isParsing}
                        />
                        <UploadBox
                            title="messages.csv"
                            description="Required for Conversation Recovery"
                            count={messages.length}
                            type="messages"
                            onUpload={handleUploadClick}
                            isParsing={isParsing}
                        />
                        <UploadBox
                            title="Invitations.csv"
                            description="Required for Template Optimization"
                            count={invitations.length}
                            type="invitations"
                            onUpload={handleUploadClick}
                            isParsing={isParsing}
                        />
                    </div>

                    <h4 className="font-medium text-lg mb-4">Profile Evaluation Data</h4>
                    <p className="text-sm text-muted-foreground mb-4">Upload these files to let AI evaluate your LinkedIn profile based on recruiter standards.</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <UploadBox title="Skills.csv" description="List of your skills on LinkedIn" count={skills.length} type="skills" onUpload={handleUploadClick} isParsing={isParsing} />
                        <UploadBox title="Projects.csv" description="Projects section data" count={projects.length} type="projects" onUpload={handleUploadClick} isParsing={isParsing} />
                        <UploadBox title="Education.csv" description="Schools and degrees" count={education.length} type="education" onUpload={handleUploadClick} isParsing={isParsing} />
                        <UploadBox title="Positions.csv" description="Work experience history" count={positions.length} type="positions" onUpload={handleUploadClick} isParsing={isParsing} />
                        <UploadBox title="Recommendations_Received.csv" description="LinkedIn recommendations" count={recommendations.length} type="recommendations" onUpload={handleUploadClick} isParsing={isParsing} />
                    </div>

                    {!hasData ? (
                        <div className="mt-8 flex items-start gap-3 p-4 bg-muted/50 rounded-md text-sm text-muted-foreground">
                            <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <p>
                                <strong>How to get this data:</strong> Go to LinkedIn &gt; Settings & Privacy &gt; Data privacy &gt; Get a copy of your data. Check the specific boxes for all missing files above.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-8 flex items-start gap-3 p-4 bg-primary/10 border border-primary/20 rounded-md text-sm text-foreground">
                            <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <p>
                                <strong>Data uploaded successfully!</strong> Click on the tabs below to explore your networking and profile insights.
                            </p>
                        </div>
                    )}
                </CardContent>
            </div>

            {!isExpanded && (
                <CardFooter className="bg-muted/30 py-3 px-6 text-sm text-muted-foreground flex justify-between">
                    <div>{hasData ? "Files loaded in memory. Click to manage." : "Click to upload data"}</div>
                </CardFooter>
            )}
        </Card>
    );
}
