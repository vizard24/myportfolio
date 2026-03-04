"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useAdminMode } from '@/context/admin-mode-context';
import { LoginDialog } from '@/components/admin/login-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, LogIn, Users, Building2, MessageSquare, BookTemplate, Contact2 } from 'lucide-react';
import Header from '@/components/layout/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Networking Components
import { LinkedInDataProvider } from '@/context/linkedin-data-context';
import { DataUploader } from '@/components/networking/data-uploader';
import { DormantTiesSection } from '@/components/networking/dormant-ties-section';
import { CompanyDensitySection } from '@/components/networking/company-density-section';
import { ConversationRecoverySection } from '@/components/networking/conversation-recovery-section';
import { MessagingTemplatesSection } from '@/components/networking/messaging-templates-section';
import { LinkedInProfileEvaluator } from '@/components/networking/linkedin-profile-evaluator';
import NetworkingSection from '@/components/home/networking-section';

function NetworkingDashboard() {
    const [activeTab, setActiveTab] = useState("crm");

    return (
        <div className="container mx-auto px-4 py-8 mb-20 max-w-7xl">
            <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight mb-2">Networking Intelligence</h1>
                <p className="text-xl text-muted-foreground">
                    Leverage your LinkedIn data to find the path of least resistance to your next role.
                </p>
            </div>

            <DataUploader />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 h-auto rounded-xl bg-card p-1 shadow-sm border">
                    <TabsTrigger value="crm" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3">
                        <Contact2 className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Networking CRM</span>
                        <span className="sm:hidden">CRM</span>
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3">
                        <Users className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">LinkedIn Profile</span>
                        <span className="sm:hidden">Profile</span>
                    </TabsTrigger>
                    <TabsTrigger value="dormant" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3">
                        <Users className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Dormant Ties</span>
                        <span className="sm:hidden">Ties</span>
                    </TabsTrigger>
                    <TabsTrigger value="density" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3">
                        <Building2 className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Company Density</span>
                        <span className="sm:hidden">Density</span>
                    </TabsTrigger>
                    <TabsTrigger value="recovery" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Thread Recovery</span>
                        <span className="sm:hidden">Recovery</span>
                    </TabsTrigger>
                    <TabsTrigger value="templates" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3">
                        <BookTemplate className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Templates</span>
                        <span className="sm:hidden">Templates</span>
                    </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                    <TabsContent value="crm" className="outline-none">
                        <NetworkingSection />
                    </TabsContent>

                    <TabsContent value="profile" className="outline-none">
                        <LinkedInProfileEvaluator />
                    </TabsContent>

                    <TabsContent value="dormant" className="outline-none">
                        <DormantTiesSection />
                    </TabsContent>

                    <TabsContent value="density" className="outline-none">
                        <CompanyDensitySection />
                    </TabsContent>

                    <TabsContent value="recovery" className="outline-none">
                        <ConversationRecoverySection />
                    </TabsContent>

                    <TabsContent value="templates" className="outline-none">
                        <MessagingTemplatesSection />
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}


export default function NetworkingPage() {
    const { user, loading } = useAuth();
    const { isAdminMode } = useAdminMode();

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p>Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!user || !isAdminMode) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                                <Shield className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle>Admin Access Required</CardTitle>
                            <CardDescription>
                                You need to be logged in as an administrator to access this page.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <LoginDialog>
                                <Button className="w-full">
                                    <LogIn className="mr-2 h-4 w-4" />
                                    Sign In as Admin
                                </Button>
                            </LoginDialog>
                            <div className="text-center">
                                <a
                                    href="/"
                                    className="text-sm text-muted-foreground hover:text-primary"
                                >
                                    ← Back to Portfolio
                                </a>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1 bg-secondary/10">
                <LinkedInDataProvider>
                    <NetworkingDashboard />
                </LinkedInDataProvider>
            </main>
        </div>
    );
}
