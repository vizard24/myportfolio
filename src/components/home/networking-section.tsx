"use client";

import React, { useState, useMemo } from 'react';
import { useLinkedInData } from '@/context/linkedin-data-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { parse } from 'date-fns';
import { Search, ExternalLink, ChevronLeft, ChevronRight, Briefcase, Building, Calendar, Star, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useSimplePortfolio } from '@/context/simple-portfolio-context';
import { Switch } from '@/components/ui/switch';

export default function NetworkingSection() {
    const { connections, education } = useLinkedInData();
    const { personalInfo } = useSimplePortfolio();
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [contactedIds, setContactedIds] = useState<Set<string>>(new Set());
    const rowsPerPage = 10;

    React.useEffect(() => {
        try {
            const saved = localStorage.getItem('smartcrm_contacted');
            if (saved) {
                setContactedIds(new Set(JSON.parse(saved)));
            }
        } catch (e) {
            console.error('Failed to load contacted state', e);
        }
    }, []);

    const toggleContacted = (id: string) => {
        setContactedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            localStorage.setItem('smartcrm_contacted', JSON.stringify(Array.from(next)));
            return next;
        });
    };

    const SENIOR_TITLES = ['founder', 'ceo', 'cto', 'president', 'vp', 'vice president', 'director', 'head', 'lead', 'principal', 'senior', 'partner', 'talent', 'recruiter'];

    const processedData = useMemo(() => {
        let filtered = [...connections];

        const targetPositions: { id: string; title: string; }[] = (personalInfo as any)?.targetPositions || [];
        const targetRoles = targetPositions.map(p => p.title.toLowerCase());
        const mySchools = education.map((e: any) => (e['School Name'] || e['School'] || e['Name'] || '').toLowerCase()).filter((s: string) => s.length > 2);

        const BIG_COMPANIES = ['google', 'amazon', 'microsoft', 'apple', 'meta', 'facebook', 'ibm', 'oracle', 'cisco', 'intel', 'netflix', 'salesforce', 'adobe', 'sap', 'tesla', 'nvidia', 'jpmorgan', 'goldman sachs', 'morgan stanley', 'citi', 'deloitte', 'pwc', 'ey', 'kpmg', 'accenture', 'uber', 'airbnb', 'stripe', 'paypal', 'visa', 'mastercard', 'aws', 'bank of', 'tencent', 'alibaba', 'bell', 'hydro', 'cgi', 'randstad'];

        // 1. Text Search filtering
        if (searchQuery.trim()) {
            const lowerQ = searchQuery.toLowerCase();
            filtered = filtered.filter(c =>
                c.firstName.toLowerCase().includes(lowerQ) ||
                c.lastName.toLowerCase().includes(lowerQ) ||
                (c.company && c.company.toLowerCase().includes(lowerQ)) ||
                (c.position && c.position.toLowerCase().includes(lowerQ))
            );
        }

        // 2. Sorting
        filtered.sort((a, b) => {
            // Helper to parse date safely
            const getDate = (dateStr: string) => {
                try {
                    return parse(dateStr, 'dd MMM yyyy', new Date()).getTime();
                } catch {
                    return 0;
                }
            };

            // Helper to determine seniority weight
            const getSeniorityWeight = (position: string) => {
                const posLower = position.toLowerCase();
                if (posLower.includes('ceo') || posLower.includes('founder') || posLower.includes('president')) return 4;
                if (posLower.includes('vp') || posLower.includes('vice president') || posLower.includes('partner')) return 3;
                if (posLower.includes('director') || posLower.includes('head')) return 2;
                if (posLower.includes('lead') || posLower.includes('principal') || posLower.includes('manager') || posLower.includes('recruiter') || posLower.includes('talent')) return 1;
                return 0;
            };

            if (sortBy === 'highest_value') {
                const weightA = getSeniorityWeight(a.position);
                const weightB = getSeniorityWeight(b.position);
                if (weightA !== weightB) {
                    return weightB - weightA; // Higher weight first
                }
                // If same weight, sort by date desc
                return getDate(b.connectedOn) - getDate(a.connectedOn);
            }

            if (sortBy === 'target_position') {
                const getTargetWeight = (pos: string) => {
                    if (!pos) return 0;
                    const p = pos.toLowerCase();
                    let maxMatch = 0;
                    for (const role of targetRoles) {
                        const words = role.split(/\s+/).filter((w: string) => w.length > 2);
                        let matches = 0;
                        for (const w of words) {
                            if (p.includes(w)) matches++;
                        }
                        if (matches > maxMatch) maxMatch = matches;
                    }
                    return maxMatch;
                };
                const wA = getTargetWeight(a.position);
                const wB = getTargetWeight(b.position);
                if (wA !== wB) return wB - wA; // Higher match first
                return getDate(b.connectedOn) - getDate(a.connectedOn);
            }

            if (sortBy === 'same_education') {
                const getEduWeight = (company: string, position: string) => {
                    const text = `${company || ''} ${position || ''}`.toLowerCase();
                    for (const school of mySchools) {
                        if (text.includes(school)) return 1;
                    }
                    if (text.includes('université') || text.includes('university') || text.includes('college')) return 0.5;
                    return 0;
                };
                const wA = getEduWeight(a.company, a.position);
                const wB = getEduWeight(b.company, b.position);
                if (wA !== wB) return wB - wA; // Higher weight first
                return getDate(b.connectedOn) - getDate(a.connectedOn);
            }

            if (sortBy === 'biggest_company') {
                const getCompWeight = (company: string) => {
                    if (!company) return 0;
                    const cLower = company.toLowerCase();
                    for (const big of BIG_COMPANIES) {
                        if (cLower.includes(big)) return 2;
                    }
                    if (cLower.includes('inc') || cLower.includes('corp') || cLower.includes('group') || cLower.includes('tech') || cLower.includes('ltd')) return 1;
                    return 0;
                };
                const wA = getCompWeight(a.company);
                const wB = getCompWeight(b.company);
                if (wA !== wB) return wB - wA; // Higher weight first
                return getDate(b.connectedOn) - getDate(a.connectedOn);
            }

            if (sortBy === 'newest') {
                return getDate(b.connectedOn) - getDate(a.connectedOn); // Newest first
            }

            if (sortBy === 'oldest') {
                return getDate(a.connectedOn) - getDate(b.connectedOn); // Oldest first
            }

            return 0;
        });

        return filtered;
    }, [connections, searchQuery, sortBy, personalInfo, education]);

    // Pagination Calculation
    const totalPages = Math.ceil(processedData.length / rowsPerPage);
    const paginatedData = processedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    // Reset pagination when filter changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, sortBy]);

    return (
        <Card className="shadow-md overflow-hidden border-primary/10">
            <CardHeader className="bg-muted/30 pb-4 border-b">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-500" />
                            Smart CRM
                        </CardTitle>
                        <CardDescription>
                            Explore your {connections.length} uploaded connections with smart filters.
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                            <Link href="/application-tracker">
                                App Tracker
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Filter and Sort Toolbar */}
                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, company, or position..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <div className="w-full sm:w-[220px]">
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger>
                                <SelectValue placeholder="Sort by..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="newest">Newest Connections</SelectItem>
                                <SelectItem value="oldest">Oldest Connections</SelectItem>
                                <SelectItem value="highest_value">Highest Value (Senior/Recruiters)</SelectItem>
                                <SelectItem value="target_position">Closest to target position</SelectItem>
                                <SelectItem value="same_education">Same Education</SelectItem>
                                <SelectItem value="biggest_company">Biggest Company</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                {connections.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                        <p>No connections data available.</p>
                        <p className="text-sm mt-1">Please upload your Connections.csv file via the uploader above to populate this CRM table.</p>
                    </div>
                ) : processedData.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                        <p>No connections matched your search.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="w-[250px]">Name</TableHead>
                                    <TableHead>Position</TableHead>
                                    <TableHead>Company</TableHead>
                                    <TableHead className="w-[150px] text-right">Connected On</TableHead>
                                    <TableHead className="w-[100px] text-center">Contacted</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedData.map((contact, idx) => (
                                    <TableRow key={idx} className="hover:bg-muted/30">
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <span>{contact.firstName} {contact.lastName}</span>
                                                {contact.url && (
                                                    <a href={contact.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80" title="View LinkedIn Profile">
                                                        <ExternalLink className="h-3.5 w-3.5" />
                                                    </a>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Briefcase className="w-3 h-3 text-muted-foreground shrink-0" />
                                                <span className="line-clamp-1">{contact.position || <span className="text-muted-foreground italic text-xs">Not specified</span>}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Building className="w-3 h-3 text-muted-foreground shrink-0" />
                                                <span className="line-clamp-1">{contact.company || <span className="text-muted-foreground italic text-xs">Not specified</span>}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1.5 text-muted-foreground text-sm">
                                                <Calendar className="w-3 h-3" />
                                                {contact.connectedOn}
                                            </div>
                                        </TableCell>
                                        <TableCell align="center">
                                            <div className="flex justify-center items-center w-full relative">
                                                <Switch
                                                    checked={contactedIds.has(contact.url || `${contact.firstName}-${contact.lastName}-${contact.company}`)}
                                                    onCheckedChange={() => toggleContacted(contact.url || `${contact.firstName}-${contact.lastName}-${contact.company}`)}
                                                    className="data-[state=checked]:bg-green-500"
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>

            {/* Pagination Controls */}
            {processedData.length > 0 && (
                <CardContent className="py-4 border-t flex items-center justify-between text-sm">
                    <div className="text-muted-foreground shrink-0">
                        Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, processedData.length)} of {processedData.length} entries
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 shadow-none"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                        </Button>
                        <div className="px-2 font-medium">Page {currentPage} of {totalPages}</div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 shadow-none"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                        >
                            Next <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
