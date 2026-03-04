"use client";

import React, { useMemo } from 'react';
import { useLinkedInData } from '@/context/linkedin-data-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { differenceInMonths } from 'date-fns';
import { parse } from 'date-fns';
import { Users, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DormantTiesSection() {
    const { connections, messages } = useLinkedInData();

    const dormantTies = useMemo(() => {
        if (!connections.length) return [];

        const targetTitles = ['senior', 'lead', 'manager', 'director', 'vp', 'president', 'founder', 'recruiter', 'talent', 'acquisition'];

        // 1. Filter by target titles
        const valuableConnections = connections.filter(conn => {
            if (!conn.position) return false;
            const pos = conn.position.toLowerCase();
            return targetTitles.some(title => pos.includes(title));
        });

        // 2. Filter by connections older than 1 year (dormant)
        // Note: connectedOn format is usually "DD MMM YYYY" e.g., "15 Feb 2021"
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        const oldConnections = valuableConnections.filter(conn => {
            if (!conn.connectedOn) return false;
            try {
                const connectedDate = parse(conn.connectedOn, 'dd MMM yyyy', new Date());
                return connectedDate < oneYearAgo;
            } catch (e) {
                return false;
            }
        });

        // 3. (Optional but powerful) Exclude anyone we've messaged recently
        // We check the messages array to see if their name appears in recent 'To' or 'From'
        const recentMessages = messages.filter(msg => {
            if (!msg.date) return false;
            try {
                // Message dates are often "YYYY-MM-DD HH:mm:ss UTC"
                const msgDate = new Date(msg.date);
                return msgDate > oneYearAgo;
            } catch (e) {
                return false;
            }
        });

        const recentCorrespondents = new Set(
            recentMessages.flatMap(msg => [msg.from, msg.to])
        );

        const trulyDormant = oldConnections.filter(conn => {
            const fullName = `${conn.firstName} ${conn.lastName}`;
            return !recentCorrespondents.has(fullName) && !recentCorrespondents.has(conn.firstName) && !recentCorrespondents.has(conn.lastName);
        });

        return trulyDormant.slice(0, 50); // Limit to top 50 to avoid overwhelming UI

    }, [connections, messages]);

    if (!connections.length) {
        return (
            <div className="text-center py-12 border rounded-lg bg-card/50">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-medium">No Connection Data</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mt-2">Upload your Connections.csv to discover high-value dormant ties in your network.</p>
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>High-Value Dormant Ties</CardTitle>
                <CardDescription>
                    Connections you made over a year ago who hold senior, management, or recruiting positions, whom you haven't messaged recently. Re-engaging these "weak ties" is proven to be the most effective way to find new opportunities.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {dormantTies.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground flex items-center justify-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        No dormant ties found matching the criteria.
                    </div>
                ) : (
                    <ScrollArea className="h-[500px] pr-4">
                        <div className="space-y-4">
                            {dormantTies.map((conn, i) => (
                                <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors gap-4">
                                    <div>
                                        <h4 className="font-semibold text-lg">{conn.firstName} {conn.lastName}</h4>
                                        <p className="text-sm text-muted-foreground font-medium">{conn.position}</p>
                                        <p className="text-sm text-muted-foreground">{conn.company} • Connected: {conn.connectedOn}</p>
                                    </div>
                                    <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                        {conn.url && (
                                            <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                                                <a href={conn.url} target="_blank" rel="noopener noreferrer">View Profile</a>
                                            </Button>
                                        )}
                                        <Button size="sm" className="w-full sm:w-auto">Draft Message</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    );
}
