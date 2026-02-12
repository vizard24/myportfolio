"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const MOCK_LOGS = [
    { id: 1, action: "Logged In", user: "Admin", time: "2 minutes ago", status: "Success", ip: "192.168.1.1" },
    { id: 2, action: "Updated Profile", user: "Admin", time: "1 hour ago", status: "Success", ip: "192.168.1.1" },
    { id: 3, action: "Failed Login Attempt", user: "Unknown", time: "3 hours ago", status: "Failed", ip: "10.0.0.5" },
    { id: 4, action: "Published Project", user: "Admin", time: "Yesterday", status: "Success", ip: "192.168.1.1" },
    { id: 5, action: "System Update", user: "System", time: "2 days ago", status: "Completed", ip: "localhost" },
];

export function SecurityLogs() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Security Audit Logs</CardTitle>
                    <CardDescription>View recent system activities and security events.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Event</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>IP Address</TableHead>
                                <TableHead className="text-right">Time</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {MOCK_LOGS.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell className="font-medium">{log.action}</TableCell>
                                    <TableCell>{log.user}</TableCell>
                                    <TableCell>
                                        <Badge variant={log.status === 'Success' || log.status === 'Completed' ? 'default' : 'destructive'}>
                                            {log.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">{log.ip}</TableCell>
                                    <TableCell className="text-right text-muted-foreground">{log.time}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1</div>
                        <p className="text-xs text-muted-foreground">Current admin session</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Failed Attempts (24h)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">3</div>
                        <p className="text-xs text-muted-foreground">Login attempts blocked</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Last Backup</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">6h ago</div>
                        <p className="text-xs text-muted-foreground">Automated system backup</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
