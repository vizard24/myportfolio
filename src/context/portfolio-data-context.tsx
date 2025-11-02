
"use client";

import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './auth-context';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { personalInfo as defaultPersonalInfo, projectsData as defaultProjectsData, experienceData as defaultExperienceData, skillsData as defaultSkillsData } from '@/data/portfolio-data';
import type { Project, Experience, SkillCategory } from '@/data/portfolio-data';

// Define the shape of your portfolio data
interface PortfolioData {
    personalInfo: typeof defaultPersonalInfo;
    projects: Project[];
    experience: Experience[];
    skills: SkillCategory[];
}

interface PortfolioDataContextType {
  personalInfo: typeof defaultPersonalInfo;
  setPersonalInfo: (info: typeof defaultPersonalInfo) => void;
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  experience: Experience[];
  setExperience: (experience: Experience[]) => void;
  skills: SkillCategory[];
  setSkills: (skills: SkillCategory[]) => void;
  loading: boolean;
}

const PortfolioDataContext = createContext<PortfolioDataContextType | undefined>(undefined);

export function PortfolioDataProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [portfolioData, setPortfolioData] = useState<PortfolioData>({
        personalInfo: defaultPersonalInfo,
        projects: defaultProjectsData,
        experience: defaultExperienceData,
        skills: defaultSkillsData,
    });
    const [loading, setLoading] = useState(true);

    const docRef = useMemo(() => user ? doc(db, 'users', user.uid) : null, [user]);

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
            });
            return;
        }

        setLoading(true);
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data() as PortfolioData;
                 // Ensure resumeSummaries is an array for backwards compatibility
                if (data.personalInfo && !Array.isArray(data.personalInfo.resumeSummaries)) {
                    // @ts-ignore
                    data.personalInfo.resumeSummaries = [{
                        id: 'resume-1',
                        title: 'Default Resume',
                        content: data.personalInfo.resumeSummary || ''
                    }];
                }
                setPortfolioData(data);
            } else {
                // If document doesn't exist, create it with default data
                const defaultData = {
                    personalInfo: defaultPersonalInfo,
                    projects: defaultProjectsData,
                    experience: defaultExperienceData,
                    skills: defaultSkillsData,
                };
                setDoc(docRef, defaultData);
                setPortfolioData(defaultData);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching portfolio data:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [docRef]);
    
    const updateFirestore = useCallback((data: Partial<PortfolioData>) => {
        if (docRef) {
            setDoc(docRef, data, { merge: true }).catch(error => {
                console.error("Failed to save data to Firestore:", error);
            });
        }
    }, [docRef]);


    const setPersonalInfo = useCallback((info: typeof defaultPersonalInfo) => {
        setPortfolioData(prev => ({ ...prev, personalInfo: info }));
        updateFirestore({ personalInfo: info });
    }, [updateFirestore]);


    const setProjects = useCallback((projects: Project[]) => {
        setPortfolioData(prev => ({ ...prev, projects }));
        updateFirestore({ projects });
    }, [updateFirestore]);

    const setExperience = useCallback((experience: Experience[]) => {
        setPortfolioData(prev => ({ ...prev, experience }));
        updateFirestore({ experience });
    }, [updateFirestore]);

    const setSkills = useCallback((skills: SkillCategory[]) => {
        setPortfolioData(prev => ({ ...prev, skills }));
        updateFirestore({ skills });
    }, [updateFirestore]);


    const value = useMemo(() => ({
        personalInfo: portfolioData.personalInfo,
        setPersonalInfo,
        projects: portfolioData.projects,
        setProjects,
        experience: portfolioData.experience,
        setExperience,
        skills: portfolioData.skills,
        setSkills,
        loading,
    }), [portfolioData, setPersonalInfo, setProjects, setExperience, setSkills, loading]);

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
