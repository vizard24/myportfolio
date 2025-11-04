"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Database, 
  RefreshCw, 
  User, 
  AlertCircle, 
  CheckCircle,
  Eye,
  Trash2,
  Download
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { usePortfolioData } from '@/context/portfolio-data-context';
import { firestoreService } from '@/lib/firestore-service';
import { useToast } from '@/hooks/use-toast';

export function DataDebug() {
  const { user } = useAuth();
  const { 
    personalInfo, 
    projects, 
    experience, 
    skills, 
    networkingContacts,
    loading,
    error,
    forceSync
  } = usePortfolioData();
  const { toast } = useToast();
  
  const [rawFirestoreData, setRawFirestoreData] = useState<any>(null);
  const [isLoadingRaw, setIsLoadingRaw] = useState(false);

  const loadRawData = async () => {
    if (!user) return;
    
    setIsLoadingRaw(true);
    try {
      const rawData = await firestoreService.getPortfolioData(user.uid);
      setRawFirestoreData(rawData);
      console.log('Raw Firestore Data:', rawData);
    } catch (error) {
      console.error('Error loading raw data:', error);
      toast({
        title: "Error",
        description: "Failed to load raw Firestore data",
        variant: "destructive",
      });
    } finally {
      setIsLoadingRaw(false);
    }
  };

  const resetToDefaults = async () => {
    if (!user) return;
    
    try {
      // Import default data (now empty arrays)
      const { 
        personalInfo: defaultPersonalInfo,
        projectsData: defaultProjectsData,
        experienceData: defaultExperienceData,
        skillsData: defaultSkillsData,
        networkingContactsData: defaultNetworkingContactsData
      } = await import('@/data/portfolio-data');
      
      const cleanData = {
        personalInfo: defaultPersonalInfo, // Keep personal info
        projects: [], // Empty array - no default projects
        experience: [], // Empty array - no default experience  
        skills: [], // Empty array - no default skills
        networkingContacts: defaultNetworkingContactsData, // Keep networking contacts
      };
      
      await firestoreService.savePortfolioData(user.uid, cleanData);
      
      toast({
        title: "Success",
        description: "Portfolio reset to clean state - no default projects/experience/skills",
      });
      
      // Reload raw data
      await loadRawData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset portfolio data",
        variant: "destructive",
      });
    }
  };

  const clearAllData = async () => {
    if (!user) return;
    
    if (!confirm('Are you sure you want to clear ALL portfolio data? This cannot be undone.')) {
      return;
    }
    
    try {
      const emptyData = {
        personalInfo: {
          name: '',
          title: '',
          introduction: '',
          contact: {
            email: { url: '', visible: false },
            linkedin: { url: '', visible: false },
            github: { url: '', visible: false },
            twitter: { url: '', visible: false },
            instagram: { url: '', visible: false },
            substack: { url: '', visible: false },
            medium: { url: '', visible: false },
            discord: { url: '', visible: false },
          },
          profilePictureUrl: '',
          profilePictureHint: '',
          resumeSummaries: []
        },
        projects: [],
        experience: [],
        skills: [],
        networkingContacts: [],
      };
      
      await firestoreService.savePortfolioData(user.uid, emptyData);
      
      toast({
        title: "Success",
        description: "All portfolio data cleared",
      });
      
      await loadRawData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear portfolio data",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (user) {
      loadRawData();
    }
  }, [user]);

  const getDataStatus = (data: any, expectedType: string) => {
    if (!data) return { status: 'missing', color: 'bg-red-100 text-red-800' };
    if (expectedType === 'array' && !Array.isArray(data)) return { status: 'wrong-type', color: 'bg-yellow-100 text-yellow-800' };
    if (expectedType === 'array' && Array.isArray(data) && data.length === 0) return { status: 'empty', color: 'bg-blue-100 text-blue-800' };
    if (expectedType === 'array' && Array.isArray(data) && data.length > 0) return { status: 'ok', color: 'bg-green-100 text-green-800' };
    if (expectedType === 'object' && typeof data === 'object') return { status: 'ok', color: 'bg-green-100 text-green-800' };
    return { status: 'unknown', color: 'bg-gray-100 text-gray-800' };
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Please log in to debug data</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Portfolio Data Debug
          </CardTitle>
          <CardDescription>
            Debug and inspect your portfolio data storage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button onClick={loadRawData} disabled={isLoadingRaw} size="sm">
              {isLoadingRaw ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Reload Raw Data
            </Button>
            <Button onClick={forceSync} disabled={loading} size="sm" variant="outline">
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Force Sync Context
            </Button>
            <Button onClick={resetToDefaults} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
            <Button onClick={clearAllData} variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All Data
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h4 className="font-medium mb-2">User Info</h4>
              <div className="space-y-1 text-sm">
                <div>Email: {user.email}</div>
                <div>UID: {user.uid}</div>
                <div>Loading: {loading ? 'Yes' : 'No'}</div>
                <div>Error: {error || 'None'}</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Data Status</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm">Projects:</span>
                  <Badge className={getDataStatus(projects, 'array').color}>
                    {Array.isArray(projects) ? `${projects.length} items` : typeof projects}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Experience:</span>
                  <Badge className={getDataStatus(experience, 'array').color}>
                    {Array.isArray(experience) ? `${experience.length} items` : typeof experience}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">Skills:</span>
                  <Badge className={getDataStatus(skills, 'array').color}>
                    {Array.isArray(skills) ? `${skills.length} items` : typeof skills}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="context" className="w-full">
        <TabsList>
          <TabsTrigger value="context">Context Data</TabsTrigger>
          <TabsTrigger value="firestore">Raw Firestore</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="context">
          <Card>
            <CardHeader>
              <CardTitle>Current Context Data</CardTitle>
              <CardDescription>Data as seen by React components</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <pre className="text-xs">
                  {JSON.stringify({
                    personalInfo: personalInfo?.name ? { name: personalInfo.name, title: personalInfo.title } : personalInfo,
                    projects: projects?.map(p => ({ id: p.id, title: p.title })),
                    experience: experience?.map(e => ({ id: e.id, title: e.title })),
                    skills: skills?.map(s => ({ id: s.id, name: s.name, skillCount: s.skills?.length })),
                    networkingContacts: networkingContacts?.length
                  }, null, 2)}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="firestore">
          <Card>
            <CardHeader>
              <CardTitle>Raw Firestore Data</CardTitle>
              <CardDescription>Data as stored in Firestore database</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <pre className="text-xs">
                  {rawFirestoreData ? JSON.stringify(rawFirestoreData, null, 2) : 'Click "Reload Data" to fetch'}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>Data Comparison</CardTitle>
              <CardDescription>Compare what's stored vs what's displayed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Projects</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Context:</span> {Array.isArray(projects) ? projects.length : 'Not array'} items
                      {Array.isArray(projects) && projects.slice(0, 3).map(p => (
                        <div key={p.id} className="ml-2">• {p.title}</div>
                      ))}
                    </div>
                    <div>
                      <span className="font-medium">Firestore:</span> {rawFirestoreData?.projects ? (Array.isArray(rawFirestoreData.projects) ? rawFirestoreData.projects.length : 'Not array') : 'Missing'} items
                      {rawFirestoreData?.projects && Array.isArray(rawFirestoreData.projects) && rawFirestoreData.projects.slice(0, 3).map((p: any) => (
                        <div key={p.id} className="ml-2">• {p.title}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}