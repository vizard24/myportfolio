"use client";

import React, { useMemo } from 'react';
import { useLinkedInData } from '@/context/linkedin-data-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Building2 } from 'lucide-react';

export function CompanyDensitySection() {
    const { connections } = useLinkedInData();

    const densityData = useMemo(() => {
        if (!connections.length) return [];

        const counts: Record<string, number> = {};

        connections.forEach(conn => {
            if (!conn.company) return;
            // Clean up company names (remove common suffixes for better grouping)
            let company = conn.company.trim();
            // A very basic normalization, could be expanded
            const removeSuffixes = ['inc.', 'inc', 'llc', 'corp.', 'corp', 'limited', 'ltd.', 'ltd'];
            const parts = company.toLowerCase().split(' ');
            if (parts.length > 1 && removeSuffixes.includes(parts[parts.length - 1])) {
                parts.pop();
                company = parts.join(' ').replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
            }

            counts[company] = (counts[company] || 0) + 1;
        });

        // Convert to array and sort
        const sorted = Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .filter(item => item.count > 1); // Only show companies with >1 connection

        return sorted.slice(0, 20); // Top 20
    }, [connections]);

    if (!connections.length) {
        return (
            <div className="text-center py-12 border rounded-lg bg-card/50">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-medium">No Connection Data</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mt-2">Upload your Connections.csv to see a map of companies where you have the most influence.</p>
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Company Density Map</CardTitle>
                <CardDescription>
                    Identify companies where you have the highest density of connections. Use this to prioritize job applications where you can quickly secure an internal referral.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {densityData.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        Not enough data to map density (need multiple connections at the same company).
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={densityData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                                    <Tooltip cursor={{ fill: 'var(--muted)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <ScrollArea className="h-[300px] border rounded-md p-4 bg-muted/20">
                            <h4 className="font-semibold mb-4 text-sm text-muted-foreground uppercase tracking-wider">Top Targets Registry</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {densityData.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center p-3 bg-card border rounded-md shadow-sm">
                                        <span className="font-medium truncate mr-2" title={item.name}>{item.name}</span>
                                        <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-bold">{item.count}</span>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
