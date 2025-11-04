"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  FileText, 
  Activity, 
  Database, 
  RefreshCw, 
  Download,
  Upload,
  Trash2,
  Edit,
  Plus,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { usePortfolioData } from '@/context/portfolio-data-context';
import { firestoreService, type ActivityLog, type JobApplication } from '@/lib/firestore-service';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface SystemStats {
  totalUsers: number;
  totalApplications: number;
  recentActivity: ActivityLog[];
}

export function AdminDashboard() {
  const { user } = useAuth();
  const { 
    personalInfo, 
    projects, 
    experience, 
    skills, 
    networkingContacts,
    loading,
    error,
    refreshData 
  } = usePortfolioData();
  const { toast } = useToast();
  
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // Load system statistics (admin only)
  useEffect(() => {
    if (user) {
      loadSystemStats();
      loadJobApplications();
      loadActivityLogs();
    }
  }, [user]);

  const loadSystemStats = async () => {
    try {
      setStatsLoading(true);
      const stats = await firestoreService.getSystemStats();
      setSystemStats(stats);
    } catch (error) {
      console.error('Error loading system stats:', error);
      toast({
        title: "Error",
        description: "Failed to load system statistics",
        variant: "destructive",
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const loadJobApplications = async () => {
    if (!user) return;
    
    try {
      const applications = await firestoreService.getJobApplications(user.uid);
      setJobApplications(applications);
    } catch (error) {
      console.error('Error loading job applications:', error);
    }
  };

  const loadActivityLogs = async () => {
    if (!user) return;
    
    try {
      const logs = await firestoreService.getActivityLogs(user.uid, 100);
      setActivityLogs(logs);
    } catch (error) {
      console.error('Error loading activity logs:', error);
    }
  };

  const handleRefreshAll = async () => {
    await Promise.all([
      refreshData(),
      loadSystemStats(),
      loadJobApplications(),
      loadActivityLogs()
    ]);
    
    toast({
      title: "Success",
      description: "All data refreshed successfully",
    });
  };

  const exportData = async () => {
    try {
      const exportData = {
        personalInfo,
        projects,
        experience,
        skills,
        networkingContacts,
        jobApplications,
        activityLogs: activityLogs.slice(0, 50), // Limit activity logs
        exportedAt: new Date().toISOString(),
        exportedBy: user?.email
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `portfolio-data-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Data exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'applied':
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'interview':
      case 'in-progress':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'rejected':
      case 'closed':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create':
        return 'bg-green-100 text-green-800';
      case 'update':
        return 'bg-blue-100 text-blue-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading || statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading admin dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your portfolio data and monitor system activity
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefreshAll} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh All
          </Button>
          <Button onClick={exportData} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats?.totalUsers || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Job Applications</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobApplications.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{networkingContacts.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applications">Job Applications</TabsTrigger>
          <TabsTrigger value="networking">Networking</TabsTrigger>
          <TabsTrigger value="activity">Activity Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Info Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Current profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div><strong>Name:</strong> {personalInfo.name}</div>
                <div><strong>Title:</strong> {personalInfo.title}</div>
                <div><strong>Email:</strong> {personalInfo.contact.email.url}</div>
                <div><strong>Resume Summaries:</strong> {personalInfo.resumeSummaries.length}</div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Statistics</CardTitle>
                <CardDescription>Content overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Projects:</span>
                  <Badge variant="secondary">{projects.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Experience Entries:</span>
                  <Badge variant="secondary">{experience.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Skill Categories:</span>
                  <Badge variant="secondary">{skills.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Total Skills:</span>
                  <Badge variant="secondary">
                    {skills.reduce((total, category) => total + category.skills.length, 0)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest system activities</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {activityLogs.slice(0, 10).map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-2 rounded border">
                      <div className="flex items-center gap-2">
                        <Badge className={getActionColor(log.action)}>
                          {log.action}
                        </Badge>
                        <span className="text-sm">{log.resource}</span>
                        {log.resourceId && (
                          <span className="text-xs text-muted-foreground">({log.resourceId})</span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {log.timestamp && format(log.timestamp.toDate(), 'MMM dd, HH:mm')}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Applications</CardTitle>
              <CardDescription>Manage your job applications</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {jobApplications.map((app) => (
                    <Card key={app.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{app.jobTitle}</h3>
                              {getStatusIcon(app.status)}
                              <Badge variant="outline">{app.status}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {app.jobDescription.substring(0, 150)}...
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Score: {app.matchingScore}%</span>
                              <span>Language: {app.language}</span>
                              <span>
                                Created: {format(app.createdAt.toDate(), 'MMM dd, yyyy')}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="networking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Networking Contacts</CardTitle>
              <CardDescription>Manage your professional network</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {networkingContacts.map((contact) => (
                    <Card key={contact.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{contact.name}</h3>
                              <Badge variant="outline">{contact.status}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{contact.positions}</p>
                            <p className="text-sm text-muted-foreground">{contact.companies}</p>
                            <p className="text-xs text-muted-foreground">{contact.college}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
              <CardDescription>Detailed system activity history</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="p-3 rounded border space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className={getActionColor(log.action)}>
                            {log.action}
                          </Badge>
                          <span className="font-medium">{log.resource}</span>
                          {log.resourceId && (
                            <span className="text-sm text-muted-foreground">
                              ID: {log.resourceId}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {log.timestamp && format(log.timestamp.toDate(), 'MMM dd, yyyy HH:mm:ss')}
                        </span>
                      </div>
                      {log.changes && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-muted-foreground">
                            View changes
                          </summary>
                          <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                            {JSON.stringify(log.changes, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}