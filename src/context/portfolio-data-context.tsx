
"use client";

import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './auth-context';
import { firestoreService, type PortfolioDocument } from '@/lib/firestore-service';
import { personalInfo as defaultPersonalInfo, projectsData as defaultProjectsData, experienceData as defaultExperienceData, skillsData as defaultSkillsData, networkingContactsData as defaultNetworkingContactsData } from '@/data/portfolio-data';
import type { Project, Experience, SkillCategory, PersonalInfo } from '@/data/portfolio-data';
import type { NetworkingContact } from '@/context/networking-context';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';


interface PortfolioDataContextType {
  personalInfo: PersonalInfo;
  setPersonalInfo: (info: PersonalInfo) => Promise<void>;
  projects: Project[];
  setProjects: (projects: Project[]) => Promise<void>;
  addProject: (project: Project) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  experience: Experience[];
  setExperience: (experience: Experience[]) => Promise<void>;
  skills: SkillCategory[];
  setSkills: (skills: SkillCategory[]) => Promise<void>;
  networkingContacts: NetworkingContact[];
  setNetworkingContacts: (contacts: NetworkingContact[]) => Promise<void>;
  addNetworkingContact: (contact: NetworkingContact) => Promise<void>;
  deleteNetworkingContact: (contactId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  forceSync: () => Promise<void>;
  batchUpdate: (updates: {
    personalInfo?: PersonalInfo;
    projects?: Project[];
    experience?: Experience[];
    skills?: SkillCategory[];
    networkingContacts?: NetworkingContact[];
  }) => Promise<void>;
}

const PortfolioDataContext = createContext<PortfolioDataContextType | undefined>(undefined);

export function PortfolioDataProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [portfolioData, setPortfolioData] = useState<PortfolioDocument>({
        personalInfo: defaultPersonalInfo,
        projects: defaultProjectsData,
        experience: defaultExperienceData,
        skills: defaultSkillsData,
        networkingContacts: defaultNetworkingContactsData,
        lastUpdated: new Date() as any,
        version: 1
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load data from Firestore on initial render and listen for changes
    useEffect(() => {
        if (!user) {
            setLoading(false);
            setError(null);
            // If no user, reset to default data
            setPortfolioData({
                personalInfo: defaultPersonalInfo,
                projects: defaultProjectsData,
                experience: defaultExperienceData,
                skills: defaultSkillsData,
                networkingContacts: defaultNetworkingContactsData,
                lastUpdated: new Date() as any,
                version: 1
            });
            return;
        }

        setLoading(true);
        setError(null);

        // Subscribe to real-time updates
        const unsubscribe = firestoreService.subscribeToPortfolioData(user.uid, (data) => {
            if (data) {
                // Ensure all required fields are present and are arrays
                const mergedData: PortfolioDocument = {
                    personalInfo: { ...defaultPersonalInfo, ...data.personalInfo },
                    projects: Array.isArray(data.projects) ? data.projects : defaultProjectsData,
                    experience: Array.isArray(data.experience) ? data.experience : defaultExperienceData,
                    skills: Array.isArray(data.skills) ? data.skills : defaultSkillsData,
                    networkingContacts: Array.isArray(data.networkingContacts) ? data.networkingContacts : defaultNetworkingContactsData,
                    lastUpdated: data.lastUpdated,
                    version: data.version || 1
                };
                
                // Ensure resumeSummaries is an array for backwards compatibility
                if (!Array.isArray(mergedData.personalInfo.resumeSummaries)) {
                    mergedData.personalInfo.resumeSummaries = [{
                        id: 'resume-1',
                        title: 'Default Resume',
                        content: ''
                    }];
                }
                
                setPortfolioData(mergedData);
                setError(null);
            } else {
                // If document doesn't exist, create it with default data
                const defaultData: Partial<PortfolioDocument> = {
                    personalInfo: defaultPersonalInfo,
                    projects: defaultProjectsData,
                    experience: defaultExperienceData,
                    skills: defaultSkillsData,
                    networkingContacts: defaultNetworkingContactsData,
                };
                
                firestoreService.savePortfolioData(user.uid, defaultData)
                    .then(() => {
                        console.log('Default portfolio data created');
                    })
                    .catch((error) => {
                        console.error('Error creating default data:', error);
                        setError('Failed to initialize portfolio data');
                    });
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);


    // Helper function to handle errors
    const handleError = useCallback((error: any, operation: string) => {
        console.error(`Error in ${operation}:`, error);
        const errorMessage = error.message || `Failed to ${operation}`;
        setError(errorMessage);
        toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
        });
    }, [toast]);

    const setPersonalInfo = useCallback(async (info: PersonalInfo) => {
        if (!user) return;
        
        try {
            setError(null);
            await firestoreService.updatePersonalInfo(user.uid, info);
            toast({
                title: "Success",
                description: "Personal information updated successfully",
            });
        } catch (error) {
            handleError(error, 'update personal information');
        }
    }, [user, handleError, toast]);

    const setProjects = useCallback(async (projects: Project[]) => {
        if (!user) return;
        
        try {
            setError(null);
            await firestoreService.updateProjects(user.uid, projects);
            toast({
                title: "Success",
                description: "Projects updated successfully",
            });
        } catch (error) {
            handleError(error, 'update projects');
        }
    }, [user, handleError, toast]);

    const addProject = useCallback(async (project: Project) => {
        if (!user) return;
        
        try {
            setError(null);
            await firestoreService.addProject(user.uid, project);
            toast({
                title: "Success",
                description: "Project added successfully",
            });
        } catch (error) {
            handleError(error, 'add project');
        }
    }, [user, handleError, toast]);

    const deleteProject = useCallback(async (projectId: string) => {
        if (!user) return;
        
        try {
            setError(null);
            await firestoreService.deleteProject(user.uid, projectId);
            toast({
                title: "Success",
                description: "Project deleted successfully",
            });
        } catch (error) {
            handleError(error, 'delete project');
        }
    }, [user, handleError, toast]);

    const setExperience = useCallback(async (experience: Experience[]) => {
        if (!user) return;
        
        try {
            setError(null);
            await firestoreService.updateExperience(user.uid, experience);
            toast({
                title: "Success",
                description: "Experience updated successfully",
            });
        } catch (error) {
            handleError(error, 'update experience');
        }
    }, [user, handleError, toast]);

    const setSkills = useCallback(async (skills: SkillCategory[]) => {
        if (!user) return;
        
        try {
            setError(null);
            await firestoreService.updateSkills(user.uid, skills);
            toast({
                title: "Success",
                description: "Skills updated successfully",
            });
        } catch (error) {
            handleError(error, 'update skills');
        }
    }, [user, handleError, toast]);

    const setNetworkingContacts = useCallback(async (contacts: NetworkingContact[]) => {
        if (!user) return;
        
        try {
            setError(null);
            await firestoreService.updateNetworkingContacts(user.uid, contacts);
            toast({
                title: "Success",
                description: "Networking contacts updated successfully",
            });
        } catch (error) {
            handleError(error, 'update networking contacts');
        }
    }, [user, handleError, toast]);

    const addNetworkingContact = useCallback(async (contact: NetworkingContact) => {
        if (!user) return;
        
        try {
            setError(null);
            await firestoreService.addNetworkingContact(user.uid, contact);
            toast({
                title: "Success",
                description: "Networking contact added successfully",
            });
        } catch (error) {
            handleError(error, 'add networking contact');
        }
    }, [user, handleError, toast]);

    const deleteNetworkingContact = useCallback(async (contactId: string) => {
        if (!user) return;
        
        try {
            setError(null);
            await firestoreService.deleteNetworkingContact(user.uid, contactId);
            toast({
                title: "Success",
                description: "Networking contact deleted successfully",
            });
        } catch (error) {
            handleError(error, 'delete networking contact');
        }
    }, [user, handleError, toast]);

    const refreshData = useCallback(async () => {
        if (!user) return;
        
        try {
            setLoading(true);
            setError(null);
            const data = await firestoreService.getPortfolioData(user.uid);
            if (data) {
                setPortfolioData(data);
            }
        } catch (error) {
            handleError(error, 'refresh data');
        } finally {
            setLoading(false);
        }
    }, [user, handleError]);

    const forceSync = useCallback(async () => {
        if (!user) return;
        
        try {
            setError(null);
            // Force a fresh read from Firestore
            const data = await firestoreService.getPortfolioData(user.uid);
            
            if (data) {
                console.log('Force sync - Raw data from Firestore:', data);
                
                // Apply the same merging logic as the subscription
                const mergedData: PortfolioDocument = {
                    personalInfo: { ...defaultPersonalInfo, ...data.personalInfo },
                    projects: Array.isArray(data.projects) ? data.projects : defaultProjectsData,
                    experience: Array.isArray(data.experience) ? data.experience : defaultExperienceData,
                    skills: Array.isArray(data.skills) ? data.skills : defaultSkillsData,
                    networkingContacts: Array.isArray(data.networkingContacts) ? data.networkingContacts : defaultNetworkingContactsData,
                    lastUpdated: data.lastUpdated,
                    version: data.version || 1
                };
                
                console.log('Force sync - Merged data:', mergedData);
                setPortfolioData(mergedData);
                
                toast({
                    title: "Data Synchronized",
                    description: "Portfolio data has been refreshed from Firestore",
                });
            } else {
                console.log('Force sync - No data found, using defaults');
                toast({
                    title: "No Data Found",
                    description: "No portfolio data exists in Firestore. Using defaults.",
                    variant: "destructive",
                });
            }
        } catch (error) {
            handleError(error, 'force sync data');
        }
    }, [user, handleError, toast]);

    const batchUpdate = useCallback(async (updates: {
        personalInfo?: PersonalInfo;
        projects?: Project[];
        experience?: Experience[];
        skills?: SkillCategory[];
        networkingContacts?: NetworkingContact[];
    }) => {
        if (!user) return;
        
        try {
            setError(null);
            await firestoreService.batchUpdatePortfolio(user.uid, updates);
            toast({
                title: "Success",
                description: "Portfolio updated successfully",
            });
        } catch (error) {
            handleError(error, 'batch update portfolio');
        }
    }, [user, handleError, toast]);


    const value = useMemo(() => ({
        personalInfo: portfolioData.personalInfo,
        setPersonalInfo,
        projects: portfolioData.projects,
        setProjects,
        addProject,
        deleteProject,
        experience: portfolioData.experience,
        setExperience,
        skills: portfolioData.skills,
        setSkills,
        networkingContacts: portfolioData.networkingContacts,
        setNetworkingContacts,
        addNetworkingContact,
        deleteNetworkingContact,
        loading,
        error,
        refreshData,
        forceSync,
        batchUpdate,
    }), [
        portfolioData, 
        setPersonalInfo, 
        setProjects, 
        addProject, 
        deleteProject,
        setExperience, 
        setSkills, 
        setNetworkingContacts,
        addNetworkingContact,
        deleteNetworkingContact,
        loading, 
        error,
        refreshData,
        forceSync,
        batchUpdate
    ]);

    return (
        <PortfolioDataContext.Provider value={value}>
            {children}
        </PortfolioDataContext.Provider>
    );
}

export function usePortfolioData() {
    const context = useContext(PortfolioDataContext);
    if (context === undefined) {
        throw new Error('usePortfolioData must be used within a PortfolioDataProvider');
    }
    return context;
}
