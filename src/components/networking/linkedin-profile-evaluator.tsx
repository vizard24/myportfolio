"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLinkedInData } from '@/context/linkedin-data-context';
import { useSimplePortfolio } from '@/context/simple-portfolio-context';
import { Sparkles, CheckCircle2, AlertTriangle, ShieldAlert, Award, Briefcase, GraduationCap, LibraryBig, Loader2, Target, Info } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface TargetPosition { id: string; title: string; }

export function LinkedInProfileEvaluator() {
    const { skills, projects, education, positions, recommendations, connections } = useLinkedInData();
    const { personalInfo } = useSimplePortfolio();

    // Extract positions from portfolio context
    const targetPositions: TargetPosition[] = (personalInfo as any)?.targetPositions || [];

    const [selectedPositionId, setSelectedPositionId] = useState<string>('');
    const [isEvaluating, setIsEvaluating] = useState(false);
    const [evaluationResult, setEvaluationResult] = useState<any>(null);

    // Persist result heavily in local storage.
    useEffect(() => {
        if (typeof window !== 'undefined' && selectedPositionId) {
            const saved = localStorage.getItem(`linkedin_eval_${selectedPositionId}`);
            if (saved) {
                try {
                    setEvaluationResult(JSON.parse(saved));
                } catch { }
            } else {
                setEvaluationResult(null); // Clear if switching to unevaluated pos
            }
        }
    }, [selectedPositionId]);

    useEffect(() => {
        if (targetPositions.length > 0 && !selectedPositionId) {
            setSelectedPositionId(targetPositions[0].id);
        }
    }, [targetPositions, selectedPositionId]);

    const hasData = connections.length > 0 || skills.length > 0 || projects.length > 0 || education.length > 0 || positions.length > 0 || recommendations.length > 0;

    // Simulate strict ATS/HR Evaluation based on selected target role and dataset
    const evaluateProfile = () => {
        setIsEvaluating(true);
        setTimeout(() => {
            let score = 100; // Start at 100, apply heavy penalties
            const strengths: { section: string; text: string }[] = [];
            const improvements: { section: string; text: string; severity: 'FATAL' | 'CRITICAL' | 'WARNING' }[] = [];

            // 7 Metrics for spiderweb (0-100 scale each):
            let alignmentVal = 0;
            let skillsVal = 0;
            let experienceVal = 0;
            let educationVal = 0;
            let projectsVal = 0;
            let recommendationsVal = 0;
            let networkVal = 0;

            // --- 0. Target Role Alignment (The most critical filter) ---
            const selectedPos = targetPositions.find(p => p.id === selectedPositionId);
            const targetTitle = selectedPos ? selectedPos.title.toLowerCase() : '';

            if (targetTitle) {
                // Check if target title keywords appear in either recent positions or skills
                const targetWords = targetTitle.split(/\s+/).filter(w => w.length > 2);
                const positionsText = positions.map((p: any) => p['Title'] || p['Position'] || "").join(' ').toLowerCase();
                const skillsText = skills.map((s: any) => s['Name'] || s['Skill'] || "").join(' ').toLowerCase();

                const hasRelevance = targetWords.some(w => positionsText.includes(w) || skillsText.includes(w));
                if (!hasRelevance) {
                    score -= 30; // Massive penalty for misalignment
                    alignmentVal = 10;
                    improvements.push({ section: "Role Alignment", severity: "FATAL", text: `Profile completely lacks alignment with target role "${selectedPos?.title}". Neither your recent positions nor skills contain core keywords for this role. HR will auto-reject.` });
                } else {
                    alignmentVal = 95;
                    strengths.push({ section: "Role Alignment", text: `Good baseline keyword alignment found for target role: "${selectedPos?.title}".` });
                }
            } else {
                alignmentVal = 0;
            }

            // --- 1. Skills Section (Strict filter) ---
            if (skills.length === 0) {
                score -= 25;
                skillsVal = 0;
                improvements.push({ section: "Skills Metrics", severity: "FATAL", text: "Skills section is empty. You are invisible to LinkedIn Recruiter search algorithms." });
            } else if (skills.length < 15) {
                score -= 10;
                skillsVal = 40;
                improvements.push({ section: "Skills Metrics", severity: "CRITICAL", text: `Only ${skills.length} skills listed. Top-tier candidates max out 50 skills to capture all possible boolean search variations used by recruiters. Add more.` });
            } else if (skills.length >= 40) {
                skillsVal = 100;
                strengths.push({ section: "Skills Metrics", text: `Excellent skill density (${skills.length} skills). High probability of matching recruiter boolean searches.` });
            } else {
                skillsVal = 70;
                improvements.push({ section: "Skills Metrics", severity: "WARNING", text: `Reasonable skill count (${skills.length}), but aim to get closer to the 50 limit to maximize SEO reach.` });
            }

            // --- 2. Positions / Experience ---
            if (positions.length === 0) {
                score -= 20;
                experienceVal = 0;
                improvements.push({ section: "Experience Narrative", severity: "FATAL", text: "No experience history found. Lack of verified work history is a massive red flag for trust." });
            } else if (positions.length === 1) {
                score -= 5;
                experienceVal = 60;
                improvements.push({ section: "Experience Narrative", severity: "WARNING", text: "Only one position listed. Ensure descriptions highlight impact metrics, not just responsibilities." });
            } else {
                experienceVal = 100;
                strengths.push({ section: "Experience Narrative", text: "Clear visual career progression established across multiple roles." });
            }

            // --- 3. Education ---
            if (education.length === 0) {
                score -= 10;
                educationVal = 0;
                improvements.push({ section: "Academic Credentials", severity: "CRITICAL", text: "Education section is missing. Many ATS systems hard-filter candidates lacking degree/certification verification." });
            } else {
                educationVal = 100;
                strengths.push({ section: "Academic Credentials", text: "Educational background is present, passing baseline credential filters." });
            }

            // --- 4. Projects (Proof of Competence) ---
            if (projects.length === 0) {
                score -= 15;
                projectsVal = 0;
                improvements.push({ section: "Proof of Work (Projects)", severity: "CRITICAL", text: "Zero projects listed. Modern technical hiring requires 'Proof of Work'. Without projects, you are relying solely on past employers' credibility." });
            } else if (projects.length < 3) {
                score -= 5;
                projectsVal = 50;
                improvements.push({ section: "Proof of Work (Projects)", severity: "WARNING", text: "Weak project portfolio. Top candidates show a consistent habit of building outside core roles. Add more projects." });
                strengths.push({ section: "Proof of Work (Projects)", text: "Has baseline project proof of work." });
            } else {
                projectsVal = 100;
                strengths.push({ section: "Proof of Work (Projects)", text: `Outstanding proof of work (${projects.length} projects). Signals high passion and competence to hiring managers.` });
            }

            // --- 5. Recommendations (Social Proof / Background checks) ---
            if (recommendations.length === 0) {
                score -= 15;
                recommendationsVal = 0;
                improvements.push({ section: "Social Proof", severity: "FATAL", text: "Zero recommendations. HR views profiles without recommendations as lacking professional advocacy. You must solicit at least 3 immediately." });
            } else if (recommendations.length < 3) {
                score -= 5;
                recommendationsVal = 60;
                improvements.push({ section: "Social Proof", severity: "WARNING", text: `Only ${recommendations.length} recommendation(s). Three is the minimum threshold to establish undeniable social proof.` });
                strengths.push({ section: "Social Proof", text: "Has some baseline social proof." });
            } else {
                recommendationsVal = 100;
                strengths.push({ section: "Social Proof", text: `Exceptional social proof (${recommendations.length} recommendations). Highly mitigates hiring risk for recruiters.` });
            }

            // --- 6. Network Reach ---
            if (connections.length === 0) {
                score -= 5;
                networkVal = 10;
                improvements.push({ section: "Network Extent", severity: "WARNING", text: "Connections file missing or empty. Top candidates exceed 500+ connections for maximum algorithm priority." });
            } else if (connections.length < 150) {
                score -= 5;
                networkVal = 40;
                improvements.push({ section: "Network Extent", severity: "WARNING", text: `Only ${connections.length} connections. A small network limits recruiter visibility in 2nd/3rd degree searches.` });
            } else if (connections.length > 500) {
                networkVal = 100;
                strengths.push({ section: "Network Extent", text: `Highly connected profile (>500 connections). Algorithm heavily promotes you to recruiters.` });
            } else {
                networkVal = 80;
                strengths.push({ section: "Network Extent", text: `Healthy network baseline (${connections.length} connections). Ensures decent discovery.` });
            }

            // Final score boundary guard
            score = Math.max(0, Math.min(100, score));

            const chartData = [
                { subject: 'Alignment', A: alignmentVal, fullMark: 100 },
                { subject: 'Skills', A: skillsVal, fullMark: 100 },
                { subject: 'Experience', A: experienceVal, fullMark: 100 },
                { subject: 'Education', A: educationVal, fullMark: 100 },
                { subject: 'Projects', A: projectsVal, fullMark: 100 },
                { subject: 'Recommendations', A: recommendationsVal, fullMark: 100 },
                { subject: 'Network', A: networkVal, fullMark: 100 },
            ];

            const resultData = {
                score,
                strengths,
                improvements,
                chartData
            };

            setEvaluationResult(resultData);
            if (typeof window !== 'undefined' && selectedPositionId) {
                localStorage.setItem(`linkedin_eval_${selectedPositionId}`, JSON.stringify(resultData));
            }

            setIsEvaluating(false);
        }, 1500);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="bg-primary/5 border-primary/10">
                    <CardHeader className="p-4 pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><Award className="w-4 h-4" /> Skills</CardTitle></CardHeader>
                    <CardContent className="p-4 pt-0 text-2xl font-bold">{skills.length}</CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/10">
                    <CardHeader className="p-4 pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><Briefcase className="w-4 h-4" /> Positions</CardTitle></CardHeader>
                    <CardContent className="p-4 pt-0 text-2xl font-bold">{positions.length}</CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/10">
                    <CardHeader className="p-4 pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><GraduationCap className="w-4 h-4" /> Education</CardTitle></CardHeader>
                    <CardContent className="p-4 pt-0 text-2xl font-bold">{education.length}</CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/10">
                    <CardHeader className="p-4 pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><LibraryBig className="w-4 h-4" /> Projects</CardTitle></CardHeader>
                    <CardContent className="p-4 pt-0 text-2xl font-bold">{projects.length}</CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/10">
                    <CardHeader className="p-4 pb-2"><CardTitle className="text-sm text-muted-foreground flex items-center gap-2"><Sparkles className="w-4 h-4" /> Recommendations</CardTitle></CardHeader>
                    <CardContent className="p-4 pt-0 text-2xl font-bold">{recommendations.length}</CardContent>
                </Card>
            </div>

            <Card className="shadow-md overflow-hidden border-primary/10 relative">
                <CardHeader className="bg-muted/30 pb-4 border-b">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div>
                                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                    Strictly-Typed HR Profile Evaluation
                                </CardTitle>
                                <CardDescription className="max-w-xl">
                                    Unforgiving ATS AI evaluation. We match your data firmly against elite HR hiring thresholds tailored to your target position.
                                </CardDescription>
                            </div>

                            {selectedPositionId && (
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary hover:bg-primary/10">
                                            <Info className="w-5 h-5" />
                                            <span className="sr-only">Visualise Ideal Profile</span>
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                                        <SheetHeader className="mb-6">
                                            <SheetTitle className="text-2xl">The Baseline of Excellence</SheetTitle>
                                            <SheetDescription className="text-base font-medium">
                                                To pass top-tier tech screening for: <strong className="text-foreground">{targetPositions.find(p => p.id === selectedPositionId)?.title}</strong>, your LinkedIn profile must evolve to match these non-negotiable standards.
                                            </SheetDescription>
                                        </SheetHeader>
                                        <div className="space-y-10 mt-6">
                                            <section>
                                                <h3 className="text-xl font-bold flex items-center gap-2 border-b pb-2 mb-4"><Award className="w-6 h-6 text-blue-500" /> 1. Skills Matrix (The SEO Engine)</h3>
                                                <p className="text-sm text-muted-foreground mb-4">Your Skills section drives LinkedIn's search algorithm and ATS matching. Recruiters never search by name; they run strict boolean queries.</p>
                                                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground mb-4">
                                                    <li><strong>Volume:</strong> Fully utilize all 50 available skill slots. Leaving slots empty reduces surface area for keyword hits.</li>
                                                    <li><strong>Target Density:</strong> Ensure the top 10-15 skills exactly mirror the hard skills demanded in target job descriptions.</li>
                                                    <li><strong>Variety:</strong> Blend Tools (e.g., Docker, Figma), Core Concepts (e.g., System Design, Data Structures), and Domain Context (e.g., E-commerce, B2B SaaS).</li>
                                                    <li><strong>Pinning:</strong> Your top 3 pinned skills MUST be hard technical skills, not generic soft skills.</li>
                                                </ul>
                                                <div className="bg-blue-500/5 border border-blue-500/20 rounded-md p-4 text-sm font-semibold text-blue-900 dark:text-blue-200">
                                                    Benchmark: Minimum 45 valid skills. Avoid "Leadership" or "Teamwork" unless backed heavily by context.
                                                </div>
                                            </section>

                                            <section>
                                                <h3 className="text-xl font-bold flex items-center gap-2 border-b pb-2 mb-4"><Briefcase className="w-6 h-6 text-green-500" /> 2. Experience Narratives (Impact over Responsibilities)</h3>
                                                <p className="text-sm text-muted-foreground mb-4">You are not a list of chores. Resumes get dismissed when they only list "what you were supposed to do" instead of "what you accomplished."</p>
                                                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground mb-4">
                                                    <li><strong>Progression:</strong> Demonstrate a linear jump in responsibilities, scale, and title over time.</li>
                                                    <li><strong>Metrics Driven:</strong> If a bullet point lacks a metric (%, $, weeks, users), rewrite it. Engineers scale systems; Marketers scale revenue. Show it.</li>
                                                    <li><strong>XYZ Formula:</strong> "Accomplished [X] as measured by [Y], by doing [Z]."</li>
                                                </ul>
                                                <div className="bg-green-500/5 border border-green-500/20 rounded-md p-4 text-sm font-medium flex flex-col gap-2 text-green-900 dark:text-green-200">
                                                    <strong>Example Top-Tier Bullet:</strong>
                                                    <span className="opacity-90">"• Decreased search query latency by 45% (200ms) by executing a Redis caching layer, handling 15,000 req/min during peak."</span>
                                                </div>
                                            </section>

                                            <section>
                                                <h3 className="text-xl font-bold flex items-center gap-2 border-b pb-2 mb-4"><LibraryBig className="w-6 h-6 text-orange-500" /> 3. Projects (Proof of Work)</h3>
                                                <p className="text-sm text-muted-foreground mb-4">Hiring is risky. Projects derisk you by showcasing undeniable, verified proof of competence independent of past employers.</p>
                                                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground mb-4">
                                                    <li><strong>Documentation:</strong> Projects must have accompanying articles, GitHub links, or case study PDFs attached directly to the section.</li>
                                                    <li><strong>Complexity:</strong> Build projects that solve real problems. Simple to-do list apps no longer qualify as proof of work.</li>
                                                </ul>
                                                <div className="bg-orange-500/5 border border-orange-500/20 rounded-md p-4 text-sm font-semibold text-orange-900 dark:text-orange-200">
                                                    Benchmark: 3+ fully documented projects proving targeted skills.
                                                </div>
                                            </section>

                                            <section>
                                                <h3 className="text-xl font-bold flex items-center gap-2 border-b pb-2 mb-4"><Sparkles className="w-6 h-6 text-red-500" /> 4. Social Validation (Recommendations)</h3>
                                                <p className="text-sm text-muted-foreground mb-4">Recruiters are skeptical by default. Written recommendations from former managers and peers act as pre-completed reference checks.</p>
                                                <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground mb-4">
                                                    <li><strong>Quality > Quantity:</strong> A recommendation highlighting your specific capacity to deliver under pressure is worth 10 generic "good teammate" endorsements.</li>
                                                    <li><strong>Mutuality:</strong> Give recommendations to receive them.</li>
                                                </ul>
                                                <div className="bg-red-500/5 border border-red-500/20 rounded-md p-4 text-sm font-semibold text-red-900 dark:text-red-200">
                                                    Benchmark: Minimum 3 written recommendations, ideally from supervisors.
                                                </div>
                                            </section>

                                            <section>
                                                <h3 className="text-xl font-bold flex items-center gap-2 border-b pb-2 mb-4"><Target className="w-6 h-6 text-purple-500" /> 5. Broad Network Physics</h3>
                                                <p className="text-sm text-muted-foreground mb-4">The LinkedIn algorithm ranks your profile higher in search results if you share 1st, 2nd, or 3rd degree connections with the searcher.</p>
                                                <div className="bg-purple-500/5 border border-purple-500/20 rounded-md p-4 text-sm font-semibold text-purple-900 dark:text-purple-200">
                                                    Benchmark: >500 Connections.
                                                </div>
                                            </section>
                                        </div>
                                    </SheetContent>
                                </Sheet>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                            {targetPositions.length > 0 ? (
                                <Select value={selectedPositionId} onValueChange={setSelectedPositionId}>
                                    <SelectTrigger className="w-full sm:w-[220px] bg-background">
                                        <div className="flex items-center gap-2">
                                            <Target className="w-4 h-4 text-primary" />
                                            <SelectValue placeholder="Target Position" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {targetPositions.map((pos) => (
                                            <SelectItem key={pos.id} value={pos.id}>
                                                {pos.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <span className="text-xs text-destructive flex items-center gap-1 font-medium bg-destructive/10 px-2 py-1.5 rounded border border-destructive/20">
                                    <AlertTriangle className="w-3 h-3" /> Add Position in App Tracker
                                </span>
                            )}

                            <Button onClick={evaluateProfile} disabled={isEvaluating || !hasData || !selectedPositionId}>
                                {isEvaluating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                {evaluationResult ? 'Re-evaluate' : 'Evaluate'}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    {!hasData ? (
                        <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg bg-muted/10 mx-auto max-w-2xl mt-4">
                            <ShieldAlert className="w-12 h-12 mx-auto mb-4 opacity-50 text-destructive" />
                            <h3 className="text-lg font-medium text-foreground">Missing Telemetry Data</h3>
                            <p className="mt-2 text-sm">Upload Skills, Positions, Education, Projects, and Recommendations CSVs in the panel above. The HR Assessor requires comprehensive signals to run.</p>
                        </div>
                    ) : !selectedPositionId ? (
                        <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg bg-muted/10 mx-auto max-w-2xl mt-4">
                            <Target className="w-12 h-12 mx-auto mb-4 opacity-50 text-primary" />
                            <h3 className="text-lg font-medium text-foreground">Target Role Required</h3>
                            <p className="mt-2 text-sm">You must define at least one Target Position in the <strong>App Tracker</strong> page. We need an objective standard to assess you against.</p>
                        </div>
                    ) : !evaluationResult ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>Data & Target synchronized. Ready to initiate strict profile scanning.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500 mt-4">

                            {/* Score & Spider Chart */}
                            <div className="flex flex-col items-center p-6 bg-muted/20 rounded-xl border border-border">
                                <h3 className="text-lg font-medium mb-2">Hireability Score</h3>
                                <div className="relative w-40 h-40 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="80" cy="80" r="70" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                                        <circle
                                            cx="80" cy="80" r="70" fill="transparent"
                                            stroke="currentColor" strokeWidth="8"
                                            className={
                                                evaluationResult.score >= 85 ? 'text-green-500' :
                                                    evaluationResult.score >= 65 ? 'text-yellow-500' : 'text-red-500'
                                            }
                                            strokeDasharray="439.8"
                                            strokeDashoffset={439.8 - (439.8 * evaluationResult.score) / 100}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute flex flex-col items-center justify-center">
                                        <span className={`text-5xl font-extrabold ${evaluationResult.score < 65 ? 'text-red-500' : evaluationResult.score < 85 ? 'text-yellow-500' : 'text-green-500'}`}>
                                            {evaluationResult.score}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">/ 100</span>
                                    </div>
                                </div>
                                <div className="mt-8 w-full h-[220px]">
                                    <h4 className="text-center text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Assessment Vectors</h4>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={evaluationResult.chartData}>
                                            <PolarGrid stroke="currentColor" className="opacity-20" strokeDasharray="3 3" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 10, opacity: 0.7 }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                            <Radar name="Performance" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} />
                                            <RechartsTooltip
                                                contentStyle={{ borderRadius: '8px', fontSize: '12px', background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Strengths & Improvements */}
                            <div className="lg:col-span-2 space-y-6">
                                {evaluationResult.improvements.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-destructive border-b border-destructive/20 pb-2">
                                            <AlertTriangle className="w-5 h-5" /> Critical Vulnerabilities Detected
                                        </h3>
                                        <ul className="space-y-3">
                                            {evaluationResult.improvements.map((imp: any, i: number) => {
                                                const isFatal = imp.severity === "FATAL";
                                                const isCritical = imp.severity === "CRITICAL";
                                                return (
                                                    <li key={i} className={`flex flex-col gap-1.5 p-3.5 rounded-lg border shadow-sm ${isFatal ? 'bg-destructive/10 border-destructive/30 text-destructive-foreground' :
                                                        isCritical ? 'bg-orange-500/10 border-orange-500/30 text-orange-700 dark:text-orange-400' :
                                                            'bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-400'
                                                        }`}>
                                                        <span className={`text-xs font-bold uppercase tracking-wider opacity-80 ${isFatal ? 'text-destructive-foreground' : isCritical ? "text-orange-700 dark:text-orange-400" : "text-yellow-700 dark:text-yellow-400"}`}>
                                                            {imp.section}
                                                        </span>
                                                        <span className="text-sm font-medium leading-relaxed">
                                                            {imp.text}
                                                        </span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-green-600 border-b border-green-500/20 pb-2 mt-8">
                                        <CheckCircle2 className="w-5 h-5" /> Defensive Strengths
                                    </h3>
                                    {evaluationResult.strengths.length === 0 ? (
                                        <p className="text-sm text-muted-foreground italic">No substantial strengths detected against elite criteria.</p>
                                    ) : (
                                        <ul className="space-y-3">
                                            {evaluationResult.strengths.map((str: any, i: number) => (
                                                <li key={i} className="flex flex-col gap-1.5 bg-green-500/5 p-3.5 rounded-lg border border-green-500/20 shadow-sm">
                                                    <span className="text-xs font-bold uppercase tracking-wider text-green-700 dark:text-green-500 opacity-80">{str.section}</span>
                                                    <span className="text-sm font-medium text-foreground">{str.text}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>

                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
