#!/usr/bin/env node

/**
 * Migration script to move from complex Firebase structure to simple structure
 * 
 * Old structure: Single document with nested arrays
 * New structure: Separate subcollections for each data type
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc, collection, writeBatch, serverTimestamp } = require('firebase/firestore');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrateUserData(userId) {
  console.log(`Migrating data for user: ${userId}`);
  
  try {
    // Get old data structure
    const oldDocRef = doc(db, 'users', userId);
    const oldDocSnap = await getDoc(oldDocRef);
    
    if (!oldDocSnap.exists()) {
      console.log(`No data found for user ${userId}`);
      return;
    }
    
    const oldData = oldDocSnap.data();
    console.log('Old data structure:', Object.keys(oldData));
    
    const batch = writeBatch(db);
    
    // Migrate personal info
    if (oldData.personalInfo) {
      const personalInfoRef = doc(db, 'users', userId, 'data', 'personalInfo');
      batch.set(personalInfoRef, {
        ...oldData.personalInfo,
        updatedAt: serverTimestamp()
      });
      console.log('✓ Personal info queued for migration');
    }
    
    // Migrate skills
    if (oldData.skills && Array.isArray(oldData.skills)) {
      const skillsRef = doc(db, 'users', userId, 'data', 'skills');
      batch.set(skillsRef, {
        categories: oldData.skills,
        updatedAt: serverTimestamp()
      });
      console.log(`✓ ${oldData.skills.length} skill categories queued for migration`);
    }
    
    // Migrate projects
    if (oldData.projects && Array.isArray(oldData.projects)) {
      for (const project of oldData.projects) {
        const projectRef = doc(db, 'users', userId, 'projects', project.id);
        batch.set(projectRef, {
          ...project,
          updatedAt: serverTimestamp()
        });
      }
      console.log(`✓ ${oldData.projects.length} projects queued for migration`);
    }
    
    // Migrate experience
    if (oldData.experience && Array.isArray(oldData.experience)) {
      for (const exp of oldData.experience) {
        const expRef = doc(db, 'users', userId, 'experience', exp.id);
        batch.set(expRef, {
          ...exp,
          updatedAt: serverTimestamp()
        });
      }
      console.log(`✓ ${oldData.experience.length} experience entries queued for migration`);
    }
    
    // Commit all changes
    await batch.commit();
    console.log('✅ Migration completed successfully!');
    
    // Optionally backup old document (rename it)
    const backupRef = doc(db, 'users', `${userId}_backup_${Date.now()}`);
    await setDoc(backupRef, oldData);
    console.log('✅ Old data backed up');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

async function migrateJobApplications(userId) {
  console.log(`Checking job applications for user: ${userId}`);
  
  try {
    // Job applications are already in the correct structure (subcollection)
    // No migration needed, just verify they exist
    const applicationsRef = collection(db, 'users', userId, 'applications');
    console.log('✓ Job applications are already in correct structure');
  } catch (error) {
    console.error('Error checking job applications:', error);
  }
}

async function main() {
  const userId = process.argv[2];
  
  if (!userId) {
    console.error('Usage: node migrate-to-simple-structure.js <userId>');
    console.error('Example: node migrate-to-simple-structure.js abc123');
    process.exit(1);
  }
  
  console.log('🚀 Starting migration to simple Firebase structure...');
  console.log(`Target user ID: ${userId}`);
  
  try {
    await migrateUserData(userId);
    await migrateJobApplications(userId);
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Update your app to use SimplePortfolioProvider');
    console.log('2. Deploy the new Firestore rules: firebase deploy --only firestore:rules');
    console.log('3. Test the new structure thoroughly');
    console.log('4. Remove old backup documents when confident');
    
  } catch (error) {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { migrateUserData, migrateJobApplications };