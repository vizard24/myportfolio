import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { cleanFirestoreData, createActivityLogEntry, handleFirestoreError } from './firestore-utils';
import type { 
  PersonalInfo, 
  Project, 
  Experience, 
  SkillCategory
} from '@/data/portfolio-data';
import type { NetworkingContact } from '@/context/networking-context';

// Types pour la structure Firestore
export interface PortfolioDocument {
  personalInfo: PersonalInfo;
  projects: Project[];
  experience: Experience[];
  skills: SkillCategory[];
  networkingContacts: NetworkingContact[];
  lastUpdated: Timestamp;
  version: number;
}

export interface ActivityLog {
  id?: string;
  userId: string;
  action: 'create' | 'update' | 'delete';
  resource: 'personalInfo' | 'projects' | 'experience' | 'skills' | 'networking' | 'applications';
  resourceId?: string;
  changes?: Record<string, any>;
  timestamp: Timestamp;
  userAgent?: string;
}

export interface JobApplication {
  id?: string;
  userId: string;
  jobTitle: string;
  jobDescription: string;
  applicationLink: string;
  tailoredResume: string;
  coverLetter: string;
  language: 'English' | 'French';
  matchingScore: number;
  matchingSkills: string[];
  lackingSkills: string[];
  status: 'draft' | 'applied' | 'interview' | 'rejected' | 'accepted';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class FirestoreService {
  private static instance: FirestoreService;
  
  static getInstance(): FirestoreService {
    if (!FirestoreService.instance) {
      FirestoreService.instance = new FirestoreService();
    }
    return FirestoreService.instance;
  }

  // Portfolio Data Operations
  async getPortfolioData(userId: string): Promise<PortfolioDocument | null> {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as PortfolioDocument;
      }
      return null;
    } catch (error) {
      console.error('Error getting portfolio data:', error);
      throw error;
    }
  }

  async savePortfolioData(userId: string, data: Partial<PortfolioDocument>): Promise<void> {
    try {
      const docRef = doc(db, 'users', userId);
      
      // Clean the data to remove undefined values
      const cleanData = cleanFirestoreData(data);
      
      const updateData = {
        ...cleanData,
        lastUpdated: serverTimestamp(),
        version: (data.version || 0) + 1
      };
      
      await setDoc(docRef, updateData, { merge: true });
      
      // Log the activity (without resourceId since it's a general update)
      await this.logActivity(userId, 'update', 'personalInfo', undefined, cleanData);
    } catch (error) {
      throw handleFirestoreError(error, 'save portfolio data');
    }
  }

  async updatePersonalInfo(userId: string, personalInfo: PersonalInfo): Promise<void> {
    try {
      const docRef = doc(db, 'users', userId);
      const cleanPersonalInfo = cleanFirestoreData(personalInfo);
      
      await updateDoc(docRef, {
        personalInfo: cleanPersonalInfo,
        lastUpdated: serverTimestamp()
      });
      
      await this.logActivity(userId, 'update', 'personalInfo', undefined, { personalInfo: cleanPersonalInfo });
    } catch (error) {
      throw handleFirestoreError(error, 'update personal info');
    }
  }

  async updateProjects(userId: string, projects: Project[]): Promise<void> {
    try {
      const docRef = doc(db, 'users', userId);
      const cleanProjects = cleanFirestoreData(projects);
      
      await updateDoc(docRef, {
        projects: cleanProjects,
        lastUpdated: serverTimestamp()
      });
      
      await this.logActivity(userId, 'update', 'projects', undefined, { projectCount: projects.length });
    } catch (error) {
      throw handleFirestoreError(error, 'update projects');
    }
  }

  async addProject(userId: string, project: Project): Promise<void> {
    try {
      const portfolioData = await this.getPortfolioData(userId);
      if (portfolioData) {
        const updatedProjects = [...portfolioData.projects, project];
        await this.updateProjects(userId, updatedProjects);
        await this.logActivity(userId, 'create', 'projects', project.id, { project });
      }
    } catch (error) {
      console.error('Error adding project:', error);
      throw error;
    }
  }

  async deleteProject(userId: string, projectId: string): Promise<void> {
    try {
      const portfolioData = await this.getPortfolioData(userId);
      if (portfolioData) {
        const updatedProjects = portfolioData.projects.filter(p => p.id !== projectId);
        await this.updateProjects(userId, updatedProjects);
        await this.logActivity(userId, 'delete', 'projects', projectId);
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  async updateExperience(userId: string, experience: Experience[]): Promise<void> {
    try {
      const docRef = doc(db, 'users', userId);
      const cleanExperience = cleanFirestoreData(experience);
      
      await updateDoc(docRef, {
        experience: cleanExperience,
        lastUpdated: serverTimestamp()
      });
      
      await this.logActivity(userId, 'update', 'experience', undefined, { experienceCount: experience.length });
    } catch (error) {
      throw handleFirestoreError(error, 'update experience');
    }
  }

  async updateSkills(userId: string, skills: SkillCategory[]): Promise<void> {
    try {
      const docRef = doc(db, 'users', userId);
      const cleanSkills = cleanFirestoreData(skills);
      
      await updateDoc(docRef, {
        skills: cleanSkills,
        lastUpdated: serverTimestamp()
      });
      
      const totalSkills = skills.reduce((total, category) => total + category.skills.length, 0);
      await this.logActivity(userId, 'update', 'skills', undefined, { 
        categoryCount: skills.length, 
        totalSkills 
      });
    } catch (error) {
      throw handleFirestoreError(error, 'update skills');
    }
  }

  // Networking Contacts Operations
  async getNetworkingContacts(userId: string): Promise<NetworkingContact[]> {
    try {
      const portfolioData = await this.getPortfolioData(userId);
      return portfolioData?.networkingContacts || [];
    } catch (error) {
      console.error('Error getting networking contacts:', error);
      throw error;
    }
  }

  async updateNetworkingContacts(userId: string, contacts: NetworkingContact[]): Promise<void> {
    try {
      const docRef = doc(db, 'users', userId);
      const cleanContacts = cleanFirestoreData(contacts);
      
      await updateDoc(docRef, {
        networkingContacts: cleanContacts,
        lastUpdated: serverTimestamp()
      });
      
      await this.logActivity(userId, 'update', 'networking', undefined, { contactCount: contacts.length });
    } catch (error) {
      throw handleFirestoreError(error, 'update networking contacts');
    }
  }

  async addNetworkingContact(userId: string, contact: NetworkingContact): Promise<void> {
    try {
      const contacts = await this.getNetworkingContacts(userId);
      const updatedContacts = [...contacts, contact];
      await this.updateNetworkingContacts(userId, updatedContacts);
      await this.logActivity(userId, 'create', 'networking', contact.id, { contact });
    } catch (error) {
      console.error('Error adding networking contact:', error);
      throw error;
    }
  }

  async deleteNetworkingContact(userId: string, contactId: string): Promise<void> {
    try {
      const contacts = await this.getNetworkingContacts(userId);
      const updatedContacts = contacts.filter(c => c.id !== contactId);
      await this.updateNetworkingContacts(userId, updatedContacts);
      await this.logActivity(userId, 'delete', 'networking', contactId);
    } catch (error) {
      console.error('Error deleting networking contact:', error);
      throw error;
    }
  }

  // Job Applications Operations
  async getJobApplications(userId: string): Promise<JobApplication[]> {
    try {
      const applicationsRef = collection(db, 'users', userId, 'applications');
      const q = query(applicationsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as JobApplication));
    } catch (error) {
      console.error('Error getting job applications:', error);
      throw error;
    }
  }

  async saveJobApplication(userId: string, application: Omit<JobApplication, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const applicationsRef = collection(db, 'users', userId, 'applications');
      const applicationData: Omit<JobApplication, 'id'> = {
        ...application,
        userId,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp
      };
      
      const docRef = await addDoc(applicationsRef, applicationData);
      await this.logActivity(userId, 'create', 'applications', docRef.id, { application: applicationData });
      
      return docRef.id;
    } catch (error) {
      console.error('Error saving job application:', error);
      throw error;
    }
  }

  async updateJobApplication(userId: string, applicationId: string, updates: Partial<JobApplication>): Promise<void> {
    try {
      const docRef = doc(db, 'users', userId, 'applications', applicationId);
      const cleanUpdates = cleanFirestoreData(updates);
      const updateData = {
        ...cleanUpdates,
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(docRef, updateData);
      await this.logActivity(userId, 'update', 'applications', applicationId, { updates: cleanUpdates });
    } catch (error) {
      throw handleFirestoreError(error, 'update job application');
    }
  }

  async deleteJobApplication(userId: string, applicationId: string): Promise<void> {
    try {
      const docRef = doc(db, 'users', userId, 'applications', applicationId);
      await deleteDoc(docRef);
      await this.logActivity(userId, 'delete', 'applications', applicationId);
    } catch (error) {
      console.error('Error deleting job application:', error);
      throw error;
    }
  }

  // Activity Logging
  private async logActivity(
    userId: string, 
    action: ActivityLog['action'], 
    resource: ActivityLog['resource'], 
    resourceId?: string, 
    changes?: Record<string, any>
  ): Promise<void> {
    try {
      const activityRef = collection(db, 'users', userId, 'activity');
      
      // Create a clean activity log entry
      const activityData = createActivityLogEntry(userId, action, resource, resourceId, changes);
      
      // Replace the timestamp with serverTimestamp for Firestore
      activityData.timestamp = serverTimestamp();
      
      await addDoc(activityRef, activityData);
    } catch (error) {
      console.error('Error logging activity:', error);
      // Don't throw error for logging failures
    }
  }

  async getActivityLogs(userId: string, limitCount: number = 50): Promise<ActivityLog[]> {
    try {
      const activityRef = collection(db, 'users', userId, 'activity');
      const q = query(activityRef, orderBy('timestamp', 'desc'), limit(limitCount));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ActivityLog));
    } catch (error) {
      console.error('Error getting activity logs:', error);
      throw error;
    }
  }

  // Real-time subscriptions
  subscribeToPortfolioData(userId: string, callback: (data: PortfolioDocument | null) => void): () => void {
    const docRef = doc(db, 'users', userId);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as PortfolioDocument);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error('Error in portfolio data subscription:', error);
      callback(null);
    });
  }

  subscribeToJobApplications(userId: string, callback: (applications: JobApplication[]) => void): () => void {
    const applicationsRef = collection(db, 'users', userId, 'applications');
    const q = query(applicationsRef, orderBy('createdAt', 'desc'));
    
    return onSnapshot(q, (querySnapshot) => {
      const applications = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as JobApplication));
      callback(applications);
    }, (error) => {
      console.error('Error in job applications subscription:', error);
      callback([]);
    });
  }

  // Batch operations for better performance
  async batchUpdatePortfolio(userId: string, updates: {
    personalInfo?: PersonalInfo;
    projects?: Project[];
    experience?: Experience[];
    skills?: SkillCategory[];
    networkingContacts?: NetworkingContact[];
  }): Promise<void> {
    try {
      const batch = writeBatch(db);
      const docRef = doc(db, 'users', userId);
      
      // Filter out undefined values
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => value !== undefined)
      );
      
      const updateData = {
        ...cleanUpdates,
        lastUpdated: serverTimestamp(),
        version: serverTimestamp() // Use timestamp as version for batch operations
      };
      
      batch.update(docRef, updateData);
      await batch.commit();
      
      const updateSummary = {
        updatedFields: Object.keys(cleanUpdates),
        fieldCount: Object.keys(cleanUpdates).length
      };
      
      await this.logActivity(userId, 'update', 'personalInfo', undefined, updateSummary);
    } catch (error) {
      console.error('Error in batch update:', error);
      throw error;
    }
  }

  // Admin-only operations
  async getAllUsers(): Promise<{ id: string; data: PortfolioDocument }[]> {
    try {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data() as PortfolioDocument
      }));
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  async getSystemStats(): Promise<{
    totalUsers: number;
    totalApplications: number;
    recentActivity: ActivityLog[];
  }> {
    try {
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      
      let totalApplications = 0;
      const recentActivity: ActivityLog[] = [];
      
      // This is a simplified version - in production, you'd want to use aggregation queries
      for (const userDoc of usersSnapshot.docs) {
        const applicationsRef = collection(db, 'users', userDoc.id, 'applications');
        const applicationsSnapshot = await getDocs(applicationsRef);
        totalApplications += applicationsSnapshot.size;
        
        const activityRef = collection(db, 'users', userDoc.id, 'activity');
        const activityQuery = query(activityRef, orderBy('timestamp', 'desc'), limit(10));
        const activitySnapshot = await getDocs(activityQuery);
        
        activitySnapshot.docs.forEach(doc => {
          recentActivity.push({
            id: doc.id,
            ...doc.data()
          } as ActivityLog);
        });
      }
      
      // Sort recent activity by timestamp
      recentActivity.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);
      
      return {
        totalUsers: usersSnapshot.size,
        totalApplications,
        recentActivity: recentActivity.slice(0, 20) // Top 20 most recent
      };
    } catch (error) {
      console.error('Error getting system stats:', error);
      throw error;
    }
  }
}

export const firestoreService = FirestoreService.getInstance();