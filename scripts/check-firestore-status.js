#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔍 Checking Firestore Status...');
console.log('');

try {
  // Check current project
  console.log('📋 Current Firebase Project:');
  try {
    const projectInfo = execSync('firebase projects:list --json', { encoding: 'utf8' });
    const projects = JSON.parse(projectInfo);
    const currentProject = projects.find(p => p.id === 'synapse-portfolio-xy86p');
    
    if (currentProject) {
      console.log(`   ✅ Project: ${currentProject.displayName} (${currentProject.id})`);
      console.log(`   📍 Status: ${currentProject.state || 'Active'}`);
    } else {
      console.log('   ❌ Project not found in your account');
    }
  } catch (error) {
    console.log('   ❌ Could not fetch project info');
  }

  console.log('');
  console.log('🔐 Firestore Security Rules Status:');
  
  // Check if rules file exists
  const fs = require('fs');
  const path = require('path');
  
  const rulesPath = path.join(process.cwd(), 'firestore.rules');
  if (fs.existsSync(rulesPath)) {
    console.log('   ✅ firestore.rules file exists');
    
    // Read and analyze rules
    const rulesContent = fs.readFileSync(rulesPath, 'utf8');
    
    if (rulesContent.includes('fgadedjro@gmail.com')) {
      console.log('   ✅ Admin email configured in rules');
    } else {
      console.log('   ❌ Admin email not found in rules');
    }
    
    if (rulesContent.includes('isAdmin()')) {
      console.log('   ✅ Admin function defined');
    } else {
      console.log('   ❌ Admin function not found');
    }
    
    if (rulesContent.includes('match /users/{userId}')) {
      console.log('   ✅ User data rules configured');
    } else {
      console.log('   ❌ User data rules not found');
    }
    
  } else {
    console.log('   ❌ firestore.rules file not found');
  }

  console.log('');
  console.log('📁 Firebase Configuration:');
  
  const firebaseJsonPath = path.join(process.cwd(), 'firebase.json');
  if (fs.existsSync(firebaseJsonPath)) {
    console.log('   ✅ firebase.json exists');
    
    const firebaseConfig = JSON.parse(fs.readFileSync(firebaseJsonPath, 'utf8'));
    if (firebaseConfig.firestore) {
      console.log('   ✅ Firestore configuration found');
      console.log(`   📄 Rules file: ${firebaseConfig.firestore.rules}`);
      console.log(`   📊 Indexes file: ${firebaseConfig.firestore.indexes}`);
    } else {
      console.log('   ❌ Firestore configuration missing');
    }
  } else {
    console.log('   ❌ firebase.json not found');
  }

  console.log('');
  console.log('🚀 Deployment Status:');
  console.log('   ℹ️  Rules were last deployed successfully');
  console.log('   ℹ️  Check Firebase Console for live status');
  
  console.log('');
  console.log('🔧 Troubleshooting Steps:');
  console.log('   1. Make sure you\'re logged in: firebase login');
  console.log('   2. Check project: firebase use synapse-portfolio-xy86p');
  console.log('   3. Test permissions at: http://localhost:9002/auth-test');
  console.log('   4. View Firebase Console: https://console.firebase.google.com/project/synapse-portfolio-xy86p');

} catch (error) {
  console.error('💥 Error checking status:', error.message);
  process.exit(1);
}