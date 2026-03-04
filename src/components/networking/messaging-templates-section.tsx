"use client";

import React, { useMemo } from 'react';
import { useLinkedInData } from '@/context/linkedin-data-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { BookTemplate, Copy, MailWarning, ThumbsUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DEFAULT_TEMPLATES = [
    {
        name: "The Soft Ping (Dormant Tie)",
        category: "Re-engagement",
        content: "Hi [Name],\n\nIt's been a while since we connected! I saw your recent post about [Topic] and thought of you. I'm currently looking to transition into [Role/Area] and would love to hear your thoughts on the landscape at [Company] if you have 5 minutes for a virtual coffee sometime next week.\n\nBest,\n[Your Name]"
    },
    {
        name: "The Quick Follow-up (No Reply)",
        category: "Follow-up",
        content: "Hi [Name],\n\nI know things get busy, so I'm just floating this to the top of your inbox. I'm still very interested in the [Role] position and would love to chat whenever you have a moment.\n\nThanks,\n[Your Name]"
    },
    {
        name: "The High-Value Connection Request",
        category: "Cold Outreach",
        content: "Hi [Name],\n\nI really enjoyed your recent insights on [Podcast/Article/Post]. As a fellow [Profession], I'm focusing heavily on [Specialty] and would love to connect and follow your work.\n\nCheers,\n[Your Name]"
    }
];

export function MessagingTemplatesSection() {
    const { invitations } = useLinkedInData();
    const { toast } = useToast();

    // In a real app, this would analyze sent vs accepted to determine "success rate"
    // Since LinkedIn data doesn't reliably give us "Accepted" status easily in one file without joining,
    // we'll visualize the historical sent messages.
    const historicalMessages = useMemo(() => {
        if (!invitations.length) return [];

        return invitations
            .filter(inv => inv.direction === 'OUTGOING' && inv.message && inv.message.length > 10)
            .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
            .slice(0, 10); // Top 10 longest/most recent
    }, [invitations]);


    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied to clipboard" });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
                <Card className="border-primary/20 h-full">
                    <CardHeader>
                        <CardTitle className="flex flex-row items-center gap-2">
                            <BookTemplate className="h-5 w-5 text-primary" />
                            Proven Templates
                        </CardTitle>
                        <CardDescription>
                            Ready-to-use patterns for cold outreach and follow-ups.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {DEFAULT_TEMPLATES.map((tpl, i) => (
                            <div key={i} className="bg-muted/30 p-4 rounded-lg border">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-medium">{tpl.name}</h4>
                                    <Badge variant="outline">{tpl.category}</Badge>
                                </div>
                                <div className="relative">
                                    <code className="block text-sm p-4 bg-card rounded border whitespace-pre-wrap text-muted-foreground min-h-[120px]">
                                        {tpl.content}
                                    </code>
                                    <Button
                                        size="icon"
                                        variant="secondary"
                                        className="absolute top-2 right-2 h-8 w-8 opacity-50 hover:opacity-100"
                                        onClick={() => copyToClipboard(tpl.content)}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>


            <Card>
                <CardHeader>
                    <CardTitle>Historical Outreach</CardTitle>
                    <CardDescription>
                        Review the custom connection notes you've sent recently. Identify which patterns yielded responses.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!invitations.length ? (
                        <div className="text-center py-12 border rounded-lg bg-card/50">
                            <MailWarning className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                            <h3 className="text-lg font-medium">No Invitation Data</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto mt-2">Upload your Invitations.csv to audit your historical connection messages.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {historicalMessages.length === 0 ? (
                                <p className="text-muted-foreground text-center py-4">You haven't sent any custom messages with recent invitations.</p>
                            ) : (
                                historicalMessages.map((msg, i) => (
                                    <div key={i} className="p-4 border rounded-md text-sm">
                                        <div className="flex justify-between text-xs text-muted-foreground mb-2">
                                            <span>To: {msg.to}</span>
                                            <span>{msg.sentAt}</span>
                                        </div>
                                        <p className="italic text-foreground/80">"{msg.message}"</p>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
