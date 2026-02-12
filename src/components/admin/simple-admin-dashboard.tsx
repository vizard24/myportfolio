"use client";

import React, { useState } from 'react';
import Header from '@/components/layout/header';
import { useSimplePortfolio } from '@/context/simple-portfolio-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, Briefcase, GraduationCap, Code2, Settings, Shield, LayoutDashboard, RefreshCw, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { PersonalInfoSection } from './sections/personal-info';
import { ProjectsManager } from './sections/projects-manager';
import { ExperienceManager } from './sections/experience-manager';
import { SkillsManager } from './sections/skills-manager';
import { SettingsManager } from './sections/settings-manager';
import { SecurityLogs } from './sections/security-logs';

type AdminView = 'overview' | 'personal' | 'projects' | 'experience' | 'skills' | 'settings' | 'security';

export function SimpleAdminDashboard() {
  const { projects, experience, skills, refresh, loading, error } = useSimplePortfolio();
  const [activeView, setActiveView] = useState<AdminView>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'projects', label: 'Projects', icon: Briefcase, count: projects.length },
    { id: 'experience', label: 'Experience', icon: GraduationCap, count: experience.length },
    { id: 'skills', label: 'Skills', icon: Code2, count: skills.reduce((acc, cat) => acc + cat.skills.length, 0) },
    { id: 'settings', label: 'Customization', icon: Settings },
    { id: 'security', label: 'Security Logs', icon: Shield },
  ];

  const SidebarContent = () => (
    <div className="py-4 space-y-2">
      <div className="px-4 mb-6">
        <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
          Admin Panel
        </h2>
        <p className="text-xs text-muted-foreground mt-1">Manage your portfolio</p>
      </div>
      <nav className="space-y-1 px-2">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant={activeView === item.id ? "secondary" : "ghost"}
            className={cn(
              "w-full justification-start",
              activeView === item.id && "bg-secondary font-medium"
            )}
            onClick={() => {
              setActiveView(item.id as AdminView);
              setIsMobileMenuOpen(false);
            }}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.label}
            {item.count !== undefined && (
              <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {item.count}
              </span>
            )}
          </Button>
        ))}
      </nav>
      <div className="px-4 mt-8 pt-8 border-t">
        <Button variant="outline" size="sm" className="w-full" onClick={refresh}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh Data
        </Button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                  <Briefcase className="h-8 w-8 text-primary opacity-75" />
                  <div className="text-2xl font-bold">{projects.length}</div>
                  <p className="text-xs text-muted-foreground">Total Projects</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                  <GraduationCap className="h-8 w-8 text-primary opacity-75" />
                  <div className="text-2xl font-bold">{experience.length}</div>
                  <p className="text-xs text-muted-foreground">Experience Entries</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                  <Code2 className="h-8 w-8 text-primary opacity-75" />
                  <div className="text-2xl font-bold">{skills.reduce((acc, cat) => acc + cat.skills.length, 0)}</div>
                  <p className="text-xs text-muted-foreground">Skills Listed</p>
                </CardContent>
              </Card>
              <Card onClick={() => setActiveView('settings')} className="cursor-pointer hover:bg-secondary/50 transition-colors">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                  <Settings className="h-8 w-8 text-primary opacity-75" />
                  <div className="text-sm font-medium">Customize Site</div>
                  <p className="text-xs text-muted-foreground">Colors & Settings</p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardContent className="p-0">
                  <SecurityLogs />
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'personal':
        return <PersonalInfoSection />;
      case 'projects':
        return <ProjectsManager />;
      case 'experience':
        return <ExperienceManager />;
      case 'skills':
        return <SkillsManager />;
      case 'settings':
        return <SettingsManager />;
      case 'security':
        return <SecurityLogs />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading Admin Panel...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="flex flex-1 container max-w-screen-2xl mx-auto px-0">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 border-r bg-card/50 min-h-[calc(100vh-4rem)] sticky top-16">
          <SidebarContent />
        </aside>

        {/* Mobile Header/Menu Trigger (visible only on small screens below header?) 
            Actually Header already has a mobile menu for SITE nav.
            We need an Admin Sub-menu for mobile.
        */}
        <div className="md:hidden flex items-center p-4 border-b bg-background sticky top-16 z-30">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="mr-4">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <h1 className="font-semibold text-lg">{menuItems.find(i => i.id === activeView)?.label}</h1>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
              {error}
            </div>
          )}
          {renderContent()}
        </main>
      </div>
    </div>
  );
}