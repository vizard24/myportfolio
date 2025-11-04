import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc,
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import type { 
  PersonalInfo, 
  Project, 
  Experience, 
  SkillCategory
} from '@/data/portfolio-data';

// Simple, flat data structure with public portfolio and private user data
export class SimpleFirebaseService {
  private userId: string;
  private portfolioId: string; // Public portfolio identifier

  constructor(userId: string, portfolioId: string = 'yaovi-gadedjro') {
    this.userId = userId;
    this.portfolioId = portfolioId;
  }

  // Personal Info - PUBLIC document (readable by everyone)
  async getPersonalInfo(): Promise<PersonalInfo | null> {
    const docRef = doc(db, 'portfolio', this.portfolioId, 'data', 'personalInfo');
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() as PersonalInfo : null;
  }

  async savePersonalInfo(data: PersonalInfo): Promise<void> {
    console.log('🔥 Firebase: Saving personal info to public portfolio:', this.portfolioId);
    const docRef = doc(db, 'portfolio', this.portfolioId, 'data', 'personalInfo');
    console.log('🔥 Firebase: Document path:', docRef.path);
    
    try {
      await setDoc(docRef, { ...data, updatedAt: serverTimestamp() });
      console.log('🔥 Firebase: Personal info saved successfully to public portfolio');
    } catch (error) {
      console.error('🔥 Firebase: Error saving personal info:', error);
      throw error;
    }
  }

  // Projects - PUBLIC documents (readable by everyone)
  async getProjects(): Promise<Project[]> {
    const collectionRef = collection(db, 'portfolio', this.portfolioId, 'projects');
    const snapshot = await getDocs(collectionRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
  }

  async saveProject(project: Project): Promise<void> {
    console.log('🔥 Firebase: Saving project to public portfolio:', this.portfolioId, 'project:', project.id);
    const docRef = doc(db, 'portfolio', this.portfolioId, 'projects', project.id);
    console.log('🔥 Firebase: Document path:', docRef.path);
    
    try {
      await setDoc(docRef, { ...project, updatedAt: serverTimestamp() });
      console.log('🔥 Firebase: Project saved successfully to public portfolio');
    } catch (error) {
      console.error('🔥 Firebase: Error saving project:', error);
      throw error;
    }
  }

  async deleteProject(projectId: string): Promise<void> {
    const docRef = doc(db, 'portfolio', this.portfolioId, 'projects', projectId);
    await deleteDoc(docRef);
  }

  // Experience - PUBLIC documents (readable by everyone)
  async getExperience(): Promise<Experience[]> {
    const collectionRef = collection(db, 'portfolio', this.portfolioId, 'experience');
    const snapshot = await getDocs(collectionRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Experience));
  }

  async saveExperience(experience: Experience): Promise<void> {
    const docRef = doc(db, 'portfolio', this.portfolioId, 'experience', experience.id);
    await setDoc(docRef, { ...experience, updatedAt: serverTimestamp() });
  }

  async deleteExperience(experienceId: string): Promise<void> {
    const docRef = doc(db, 'portfolio', this.portfolioId, 'experience', experienceId);
    await deleteDoc(docRef);
  }

  // Skills - PUBLIC document (readable by everyone)
  async getSkills(): Promise<SkillCategory[]> {
    const docRef = doc(db, 'portfolio', this.portfolioId, 'data', 'skills');
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data().categories || [] : [];
  }

  async saveSkills(skills: SkillCategory[]): Promise<void> {
    const docRef = doc(db, 'portfolio', this.portfolioId, 'data', 'skills');
    await setDoc(docRef, { categories: skills, updatedAt: serverTimestamp() });
  }

  // Job Applications - separate collection
  async getJobApplications(): Promise<any[]> {
    const collectionRef = collection(db, 'users', this.userId, 'applications');
    const snapshot = await getDocs(collectionRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async saveJobApplication(application: any): Promise<string> {
    const collectionRef = collection(db, 'users', this.userId, 'applications');
    const docRef = await addDoc(collectionRef, {
      ...application,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  }

  async updateJobApplication(applicationId: string, updates: any): Promise<void> {
    const docRef = doc(db, 'users', this.userId, 'applications', applicationId);
    await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
  }

  async deleteJobApplication(applicationId: string): Promise<void> {
    const docRef = doc(db, 'users', this.userId, 'applications', applicationId);
    await deleteDoc(docRef);
  }
}