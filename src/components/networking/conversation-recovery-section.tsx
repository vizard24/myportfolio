"use client";

import React, { useMemo } from 'react';
import { useLinkedInData } from '@/context/linkedin-data-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { differenceInDays } from 'date-fns';
import { MessageSquare, Clock, ArrowRight } from 'lucide-react';

export function ConversationRecoverySection() {
    const { messages } = useLinkedInData();

    const recoveryOpportunities = useMemo(() => {
        if (!messages.length) return [];

        // Group messages by conversation thread (simplified to 'To/From' pair)
        const threads: Record<string, typeof messages[0][]> = {};

        // We assume the user's name is either "To" or "From", but we need a consistent key
        // A better approach if we knew the user's name, but finding the most common name works:
        const nameCounts: Record<string, number> = {};
        messages.forEach(m => {
            nameCounts[m.from] = (nameCounts[m.from] || 0) + 1;
            nameCounts[m.to] = (nameCounts[m.to] || 0) + 1;
        });

        let myName = '';
        let max = 0;
        for (const [name, count] of Object.entries(nameCounts)) {
            if (count > max) { max = count; myName = name; }
        }


        messages.forEach(msg => {
            const contactName = msg.from === myName ? msg.to : msg.from;
            if (!contactName) return;

            if (!threads[contactName]) threads[contactName] = [];
            threads[contactName].push(msg);
        });

        const opportunities = [];
        const today = new Date();

        for (const [contactName, threadMessages] of Object.entries(threads)) {
            // Sort newest first
            threadMessages.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            const lastMessage = threadMessages[0];

            // Target: We were the last to message (From === myName) AND it's been > 14 days
            if (lastMessage && lastMessage.from === myName) {
                const daysSince = differenceInDays(today, new Date(lastMessage.date));

                // Filter out automated messages or group chats if possible, usually Subject helps
                const isAutomated = lastMessage.subject?.toLowerCase().includes('congratulate')
                    || lastMessage.subject?.toLowerCase().includes('happy birthday');

                if (daysSince >= 14 && daysSince <= 180 && !isAutomated) { // Not too old (e.g. 6 months limit for realistic follow up)
                    opportunities.push({
                        contactName,
                        lastDate: lastMessage.date,
                        daysSince,
                        lastContent: lastMessage.content,
                        subject: lastMessage.subject
                    });
                }
            }
        }

        return opportunities.sort((a, b) => a.daysSince - b.daysSince).slice(0, 30); // Closest to 14 days first

    }, [messages]);


    if (!messages.length) {
        return (
            <div className="text-center py-12 border rounded-lg bg-card/50">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-medium">No Message Data</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mt-2">Upload your messages.csv to uncover dropped conversations that are ripe for a follow-up.</p>
            </div>
        );
    }


    return (
        <Card>
            <CardHeader>
                <CardTitle>Conversation Recovery Pipeline</CardTitle>
                <CardDescription>
                    Identify recruiter or networking threads where you sent the last message over 2 weeks ago and received no reply. A polite "ping" often revives a dead opportunity.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {recoveryOpportunities.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        No stalled conversations found. You're completely up to date!
                    </div>
                ) : (
                    <ScrollArea className="h-[600px] pr-4">
                        <div className="space-y-4 shadow-sm border rounded-lg p-2 bg-muted/10">
                            {recoveryOpportunities.map((opp, i) => (
                                <div key={i} className="bg-card border rounded-md p-4 flex flex-col hover:border-primary/50 transition-colors">
                                    <div className="flex justify-between items-center mb-3">
                                        <h4 className="font-semibold">{opp.contactName}</h4>
                                        <Badge variant={opp.daysSince > 30 ? "destructive" : "secondary"} className="flex gap-1 items-center">
                                            <Clock className="w-3 h-3" /> {opp.daysSince} days ago
                                        </Badge>
                                    </div>
                                    <div className="text-sm bg-muted/50 p-3 rounded-md line-clamp-3 text-muted-foreground italic relative">
                                        {opp.subject && <span className="block font-medium mb-1 not-italic text-foreground">{opp.subject}</span>}
                                        "{opp.lastContent}"
                                        <div className="absolute top-3 -left-3 bg-card rounded-full p-1 border">
                                            <ArrowRight className="w-3 h-3 text-muted-foreground" />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <button className="text-sm text-primary hover:underline font-medium">
                                            Copy Follow-up Template
                                        </button>
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
