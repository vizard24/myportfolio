#!/usr/bin/env node

console.log('🧹 Cleaning up corrupted activity logs...');
console.log('');

// This script would clean up any existing activity logs with undefined values
// For now, we'll just provide instructions since we can't run Firebase Admin SDK directly

console.log('📋 Manual Cleanup Instructions:');
console.log('');
console.log('1. Go to Firebase Console:');
console.log('   https://console.firebase.google.com/project/synapse-portfolio-xy86p/firestore');
console.log('');
console.log('2. Navigate to the activity collection:');
console.log('   users > [your-user-id] > activity');
console.log('');
console.log('3. Look for documents with undefined/null resourceId fields');
console.log('');
console.log('4. Delete any corrupted activity log documents');
console.log('');
console.log('5. Or run this Firestore query to find them:');
console.log('   collection("users").doc("yltohhMWQwPKME8OAZ2d1AH09Vd2").collection("activity")');
console.log('');
console.log('✅ The issue has been fixed in the code, so new logs will be clean.');
console.log('');
console.log('🔧 Alternative: Clear all activity logs and start fresh:');
console.log('   - This is safe as activity logs are just for monitoring');
console.log('   - New logs will be created automatically with proper data');

process.exit(0);