"use client";

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './auth-context';
import { SimpleFirebaseService } from '@/lib/firebase-simple';
import { 
  personalInfo as defaultPersonalInfo, 
  projectsData as defaultProjectsData, 
  experienceData as defaultExperienceData, 
  skillsData as defaultSkillsData 
} from '@/data/portfolio-data';
import type { Project, Experience, SkillCategory, PersonalInfo } from '@/data/portfolio-data';

interface SimplePortfolioContextType {
  // Data
  personalInfo: PersonalInfo;
  projects: Project[];
  experience: Experience[];
  skills: SkillCategory[];
  
  // Actions
  updatePersonalInfo: (info: PersonalInfo) => Promise<void>;
  addProject: (project: Project) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  addExperience: (exp: Experience) => Promise<void>;
  updateExperience: (exp: Experience) => Promise<void>;
  deleteExperience: (expId: string) => Promise<void>;
  updateSkills: (skills: SkillCategory[]) => Promise<void>;
  
  // State
  loading: boolean;
  saving: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const SimplePortfolioContext = createContext<SimplePortfolioContextType | undefined>(undefined);

export function SimplePortfolioProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(defaultPersonalInfo);
  const [projects, setProjects] = useState<Project[]>(defaultProjectsData);
  const [experience, setExperience] = useState<Experience[]>(defaultExperienceData);
  const [skills, setSkills] = useState<SkillCategory[]>(defaultSkillsData);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create Firebase service for both authenticated and non-authenticated users
  // Portfolio data is public, but only admin can modify
  const firebaseService = new SimpleFirebaseService(user?.uid || 'anonymous', 'yaovi-gadedjro');
  
  // Debug logging
  console.log('🔍 SimplePortfolio Context State:', {
    user: user ? { uid: user.uid, email: user.email } : null,
    hasFirebaseService: !!firebaseService,
    loading,
    error
  });

  // Load all data - works for both authenticated and non-authenticated users
  const loadData = async () => {
    console.log('🔄 Loading portfolio data...', { user: user?.email || 'anonymous' });
    setLoading(true);
    setError(null);
    
    try {
      const [personalData, projectsData, experienceData, skillsData] = await Promise.all([
        firebaseService.getPersonalInfo(),
        firebaseService.getProjects(),
        firebaseService.getExperience(),
        firebaseService.getSkills()
      ]);

      console.log('✅ Data loaded successfully:', {
        personalData: !!personalData,
        projectsCount: projectsData.length,
        experienceCount: experienceData.length,
        skillsCount: skillsData.length
      });

      setPersonalInfo(personalData || defaultPersonalInfo);
      setProjects(projectsData);
      setExperience(experienceData);
      setSkills(skillsData.length > 0 ? skillsData : defaultSkillsData);
    } catch (err) {
      console.error('❌ Error loading portfolio data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount and when user changes
  useEffect(() => {
    loadData();
  }, []); // Load once on mount
  
  // Initialize public portfolio when admin logs in (if data doesn't exist)
  useEffect(() => {
    const initializePortfolioIfNeeded = async () => {
      if (user && user.email === 'fgadedjro@gmail.com') {
        console.log('🔄 Admin logged in, checking if portfolio needs initialization...');
        
        try {
          const personalData = await firebaseService.getPersonalInfo();
          if (!personalData) {
            console.log('📝 Initializing public portfolio with default data...');
            await firebaseService.savePersonalInfo(defaultPersonalInfo);
            await firebaseService.saveSkills(defaultSkillsData);
            console.log('✅ Public portfolio initialized');
            
            // Reload data after initialization
            loadData();
          }
        } catch (error) {
          console.error('❌ Failed to initialize portfolio:', error);
        }
      }
    };
    
    initializePortfolioIfNeeded();
  }, [user]);

  // Personal Info actions - only admin can modify
  const updatePersonalInfo = async (info: PersonalInfo) => {
    console.log('🔄 Updating personal info...', { user: user?.email, info });
    
    // Check if user is admin
    if (!user || user.email !== 'fgadedjro@gmail.com') {
      const error = 'Only admin can modify portfolio data';
      console.error('❌', error);
      setError(error);
      throw new Error(error);
    }
    
    setSaving(true);
    try {
      console.log('📤 Saving to public portfolio...');
      await firebaseService.savePersonalInfo(info);
      console.log('✅ Saved successfully, updating local state');
      setPersonalInfo(info);
      setError(null);
    } catch (err) {
      console.error('❌ Failed to save personal info:', err);
      setError(err instanceof Error ? err.message : 'Failed to update personal info');
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Project actions - only admin can modify
  const addProject = async (project: Project) => {
    console.log('🔄 Adding project...', { user: user?.email, project });
    
    // Check if user is admin
    if (!user || user.email !== 'fgadedjro@gmail.com') {
      const error = 'Only admin can modify portfolio data';
      console.error('❌', error);
      setError(error);
      throw new Error(error);
    }
    
    try {
      console.log('📤 Saving project to public portfolio...');
      await firebaseService.saveProject(project);
      console.log('✅ Project saved successfully, updating local state');
      setProjects(prev => [...prev, project]);
      setError(null);
    } catch (err) {
      console.error('❌ Failed to add project:', err);
      setError(err instanceof Error ? err.message : 'Failed to add project');
      throw err;
    }
  };

  const updateProject = async (project: Project) => {
    if (!firebaseService) return;
    
    try {
      await firebaseService.saveProject(project);
      setProjects(prev => prev.map(p => p.id === project.id ? project : p));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
      throw err;
    }
  };

  const deleteProject = async (projectId: string) => {
    if (!firebaseService) return;
    
    try {
      await firebaseService.deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
      throw err;
    }
  };

  // Experience actions
  const addExperience = async (exp: Experience) => {
    if (!firebaseService) return;
    
    try {
      await firebaseService.saveExperience(exp);
      setExperience(prev => [...prev, exp]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add experience');
      throw err;
    }
  };

  const updateExperience = async (exp: Experience) => {
    if (!firebaseService) return;
    
    try {
      await firebaseService.saveExperience(exp);
      setExperience(prev => prev.map(e => e.id === exp.id ? exp : e));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update experience');
      throw err;
    }
  };

  const deleteExperience = async (expId: string) => {
    if (!firebaseService) return;
    
    try {
      await firebaseService.deleteExperience(expId);
      setExperience(prev => prev.filter(e => e.id !== expId));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete experience');
      throw err;
    }
  };

  // Skills actions
  const updateSkills = async (skillCategories: SkillCategory[]) => {
    if (!firebaseService) return;
    
    try {
      await firebaseService.saveSkills(skillCategories);
      setSkills(skillCategories);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update skills');
      throw err;
    }
  };

  const refresh = async () => {
    await loadData();
  };

  const value = {
    personalInfo,
    projects,
    experience,
    skills,
    updatePersonalInfo,
    addProject,
    updateProject,
    deleteProject,
    addExperience,
    updateExperience,
    deleteExperience,
    updateSkills,
    loading,
    saving,
    error,
    refresh
  };

  return (
    <SimplePortfolioContext.Provider value={value}>
      {children}
    </SimplePortfolioContext.Provider>
  );
}

export function useSimplePortfolio() {
  const context = useContext(SimplePortfolioContext);
  if (context === undefined) {
    throw new Error('useSimplePortfolio must be used within a SimplePortfolioProvider');
  }
  return context;
}