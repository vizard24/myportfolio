#!/usr/bin/env node

console.log('🧹 Clearing Default Data from Portfolio...');
console.log('');

console.log('✅ Changes Made:');
console.log('');
console.log('1. Projects Data:');
console.log('   ❌ Removed: Ecoleta - Recycling Locator');
console.log('   ❌ Removed: DevFinances - Personal Finance Tracker');
console.log('   ❌ Removed: AI Article Summarizer');
console.log('   ✅ Result: Empty projects array - only your custom projects will show');
console.log('');
console.log('2. Experience Data:');
console.log('   ❌ Removed: Senior Software Engineer at Tech Solutions Inc.');
console.log('   ❌ Removed: Full-Stack Developer at Web Wizards LLC');
console.log('   ❌ Removed: B.S. in Computer Science at State University');
console.log('   ✅ Result: Empty experience array - only your custom experience will show');
console.log('');
console.log('3. Skills Data:');
console.log('   ❌ Removed: All default skill categories');
console.log('   ❌ Removed: Frontend, Backend, Database, DevOps, Other skills');
console.log('   ✅ Result: Empty skills array - only your custom skills will show');
console.log('');
console.log('🎯 What This Means:');
console.log('   • No more default/example projects will appear');
console.log('   • Only projects YOU add will be displayed');
console.log('   • Same for experience and skills');
console.log('   • Clean slate for your personal portfolio');
console.log('');
console.log('🚀 Next Steps:');
console.log('   1. Restart your development server: npm run dev');
console.log('   2. Log in as admin on your portfolio');
console.log('   3. Add your own projects using the "Add Project" button');
console.log('   4. Add your own experience and skills');
console.log('   5. Your data will be saved to Firestore automatically');
console.log('');
console.log('💡 Pro Tip:');
console.log('   If you want to reset existing Firestore data:');
console.log('   • Go to /auth-test → Data Debug tab');
console.log('   • Click "Clear All Data" to remove old default data');
console.log('   • Then add your personal content');

process.exit(0);