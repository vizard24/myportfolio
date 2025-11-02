
"use client";

import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { personalInfo as defaultPersonalInfo, projectsData as defaultProjectsData, experienceData as defaultExperienceData, skillsData as defaultSkillsData } from '@/data/portfolio-data';
import type { Project, Experience, SkillCategory } from '@/data/portfolio-data';

const PORTFOLIO_DATA_KEY = 'portfolio-data';

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
  resetPersonalInfo: () => void;
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  experience: Experience[];
  setExperience: (experience: Experience[]) => void;
  skills: SkillCategory[];
  setSkills: (skills: SkillCategory[]) => void;
}

const PortfolioDataContext = createContext<PortfolioDataContextType | undefined>(undefined);

export function PortfolioDataProvider({ children }: { children: React.ReactNode }) {
    const [portfolioData, setPortfolioData] = useState<PortfolioData>({
        personalInfo: defaultPersonalInfo,
        projects: defaultProjectsData,
        experience: defaultExperienceData,
        skills: defaultSkillsData,
    });

    // Load data from localStorage on initial render
    useEffect(() => {
        try {
            const storedData = localStorage.getItem(PORTFOLIO_DATA_KEY);
            if (storedData) {
                const parsedData = JSON.parse(storedData);
                // Basic validation to ensure we don't load corrupted data
                if (parsedData.personalInfo && parsedData.projects && parsedData.experience && parsedData.skills) {
                    // Ensure resumeSummaries is an array
                    if (!Array.isArray(parsedData.personalInfo.resumeSummaries)) {
                        parsedData.personalInfo.resumeSummaries = [{
                            id: 'resume-1',
                            title: 'Default Resume',
                            content: parsedData.personalInfo.resumeSummary || ''
                        }];
                    }
                    setPortfolioData(parsedData);
                }
            }
        } catch (error) {
            console.error("Failed to read portfolio data from localStorage", error);
        }
    }, []);
    
    // Save data to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(PORTFOLIO_DATA_KEY, JSON.stringify(portfolioData));
        } catch (error) {
             console.error("Failed to save portfolio data to localStorage", error);
        }
    }, [portfolioData]);

    const setPersonalInfo = useCallback((info: typeof defaultPersonalInfo) => {
        setPortfolioData(prev => ({ ...prev, personalInfo: info }));
    }, []);

    const resetPersonalInfo = useCallback(() => {
        setPortfolioData(prev => ({...prev, personalInfo: defaultPersonalInfo }));
    }, []);

    const setProjects = useCallback((projects: Project[]) => {
        setPortfolioData(prev => ({ ...prev, projects }));
    }, []);

    const setExperience = useCallback((experience: Experience[]) => {
        setPortfolioData(prev => ({ ...prev, experience }));
    }, []);

    const setSkills = useCallback((skills: SkillCategory[]) => {
        setPortfolioData(prev => ({ ...prev, skills }));
    }, []);


    const value = useMemo(() => ({
        personalInfo: portfolioData.personalInfo,
        setPersonalInfo,
        resetPersonalInfo,
        projects: portfolioData.projects,
        setProjects,
        experience: portfolioData.experience,
        setExperience,
        skills: portfolioData.skills,
        setSkills,
    }), [portfolioData, setPersonalInfo, resetPersonalInfo, setProjects, setExperience, setSkills]);

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
