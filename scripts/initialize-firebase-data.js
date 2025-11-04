#!/usr/bin/env node

/**
 * Initialize Firebase data with the new simple structure
 * Run this after deploying to ensure your user document exists
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

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

async function initializeUserData() {
  const portfolioId = 'yaovi-gadedjro'; // Public portfolio ID
  
  console.log('🔄 Initializing public portfolio data:', portfolioId);
  
  try {
    // Initialize personal info in PUBLIC portfolio
    const personalInfoRef = doc(db, 'portfolio', portfolioId, 'data', 'personalInfo');
    await setDoc(personalInfoRef, {
      name: "Yaovi Gadedjro",
      title: "Full-Stack Developer",
      introduction: "Welcome to my portfolio. Please customize this introduction in admin mode.",
      contact: {
        email: { url: "fgadedjro@gmail.com", visible: true },
        linkedin: { url: "", visible: false },
        github: { url: "", visible: false },
        twitter: { url: "", visible: false },
        instagram: { url: "", visible: false },
        substack: { url: "", visible: false },
        medium: { url: "", visible: false },
        discord: { url: "", visible: false },
      },
      profilePictureUrl: "",
      profilePictureHint: "Add your professional photo",
      resumeSummaries: [
        {
          id: 'resume-1',
          title: 'Resume 1',
          content: ''
        }
      ],
      updatedAt: serverTimestamp()
    });
    console.log('✅ Personal info initialized');
    
    // Initialize skills in PUBLIC portfolio
    const skillsRef = doc(db, 'portfolio', portfolioId, 'data', 'skills');
    await setDoc(skillsRef, {
      categories: [],
      updatedAt: serverTimestamp()
    });
    console.log('✅ Skills initialized');
    
    console.log('🎉 Firebase data initialization complete!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Visit your deployed site');
    console.log('2. Log in with your Google account');
    console.log('3. Go to /admin to manage your data');
    console.log('4. Test saving personal info and resumes');
    
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  initializeUserData();
}

module.exports = { initializeUserData };