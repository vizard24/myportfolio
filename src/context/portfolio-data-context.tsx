
"use client";

import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './auth-context';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { personalInfo as defaultPersonalInfo, projectsData as defaultProjectsData, experienceData as defaultExperienceData, skillsData as defaultSkillsData, networkingContactsData as defaultNetworkingContactsData } from '@/data/portfolio-data';
import type { Project, Experience, SkillCategory, PersonalInfo } from '@/data/portfolio-data';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';


// Define the shape of your portfolio data
interface PortfolioData {
    personalInfo: PersonalInfo;
    projects: Project[];
    experience: Experience[];
    skills: SkillCategory[];
    networkingContacts: any[];
}

interface PortfolioDataContextType {
  personalInfo: PersonalInfo;
  setPersonalInfo: (info: PersonalInfo) => void;
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  experience: Experience[];
  setExperience: (experience: Experience[]) => void;
  skills: SkillCategory[];
  setSkills: (skills: SkillCategory[]) => void;
  loading: boolean;
  networkingContacts: any[];
  setNetworkingContacts: (contacts: any[]) => void;
}

const PortfolioDataContext = createContext<PortfolioDataContextType | undefined>(undefined);

export function PortfolioDataProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [portfolioData, setPortfolioData] = useState<PortfolioData>({
        personalInfo: defaultPersonalInfo,
        projects: defaultProjectsData,
        experience: defaultExperienceData,
        skills: defaultSkillsData,
        networkingContacts: defaultNetworkingContactsData,
    });
    const [loading, setLoading] = useState(true);

    const docRef = useMemo(() => user ? doc(db, 'users', user.uid) : null, [user]);

    const updateFirestore = useCallback((data: Partial<PortfolioData>) => {
        if (docRef) {
            setDoc(docRef, data, { merge: true })
            .catch(async (serverError) => {
              const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'update',
                requestResourceData: data,
              } satisfies SecurityRuleContext);
      
              errorEmitter.emit('permission-error', permissionError);
            });
        }
    }, [docRef]);

    // Load data from Firestore on initial render and listen for changes
    useEffect(() => {
        if (!docRef) {
            setLoading(false);
            // If no user, reset to default data
            setPortfolioData({
                personalInfo: defaultPersonalInfo,
                projects: defaultProjectsData,
                experience: defaultExperienceData,
                skills: defaultSkillsData,
                networkingContacts: defaultNetworkingContactsData,
            });
            return;
        }

        setLoading(true);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data() as PortfolioData;

                // Create a merged state to ensure all fields are present, even if not in Firestore
                const mergedData = {
                    personalInfo: { ...defaultPersonalInfo, ...data.personalInfo },
                    projects: data.projects || defaultProjectsData,
                    experience: data.experience || defaultExperienceData,
                    skills: data.skills || defaultSkillsData,
                    networkingContacts: data.networkingContacts || defaultNetworkingContactsData,
                };
                
                // Ensure resumeSummaries is an array for backwards compatibility
                if (mergedData.personalInfo && !Array.isArray(mergedData.personalInfo.resumeSummaries)) {
                    // @ts-ignore
                    mergedData.personalInfo.resumeSummaries = [{
                        id: 'resume-1',
                        title: 'Default Resume',
                        content: mergedData.personalInfo.resumeSummary || ''
                    }];
                }
                setPortfolioData(mergedData);
            } else {
                // If document doesn't exist, create it with default data
                const defaultData: PortfolioData = {
                    personalInfo: defaultPersonalInfo,
                    projects: defaultProjectsData,
                    experience: defaultExperienceData,
                    skills: defaultSkillsData,
                    networkingContacts: defaultNetworkingContactsData,
                };
                updateFirestore(defaultData);
                setPortfolioData(defaultData);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching portfolio data:", error);
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'get',
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [docRef, updateFirestore]);


    const setPersonalInfo = useCallback((info: PersonalInfo) => {
        const updatedData = { ...portfolioData, personalInfo: info };
        setPortfolioData(updatedData);
        updateFirestore({ personalInfo: info });
    }, [portfolioData, updateFirestore]);


    const setProjects = useCallback((projects: Project[]) => {
        const updatedData = { ...portfolioData, projects };
        setPortfolioData(updatedData);
        updateFirestore({ projects });
    }, [portfolioData, updateFirestore]);

    const setExperience = useCallback((experience: Experience[]) => {
        const updatedData = { ...portfolioData, experience };
        setPortfolioData(updatedData);
        updateFirestore({ experience });
    }, [portfolioData, updateFirestore]);

    const setSkills = useCallback((skills: SkillCategory[]) => {
        const updatedData = { ...portfolioData, skills };
        setPortfolioData(updatedData);
        updateFirestore({ skills });
    }, [portfolioData, updateFirestore]);

    const setNetworkingContacts = useCallback((contacts: any[]) => {
        const updatedData = { ...portfolioData, networkingContacts: contacts };
        setPortfolioData(updatedData);
        updateFirestore({ networkingContacts: contacts });
    }, [portfolioData, updateFirestore]);


    const value = useMemo(() => ({
        personalInfo: portfolioData.personalInfo,
        setPersonalInfo,
        projects: portfolioData.projects,
        setProjects,
        experience: portfolioData.experience,
        setExperience,
        skills: portfolioData.skills,
        setSkills,
        networkingContacts: portfolioData.networkingContacts,
        setNetworkingContacts,
        loading,
    }), [portfolioData, setPersonalInfo, setProjects, setExperience, setSkills, setNetworkingContacts, loading]);

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
