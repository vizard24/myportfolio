#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

console.log('🤖 Testing AI Configuration...');
console.log('');

// Check environment variables
const googleApiKey = process.env.GOOGLE_API_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

console.log('📋 Environment Variables:');
console.log(`   GOOGLE_API_KEY: ${googleApiKey ? '✅ Set (' + googleApiKey.substring(0, 10) + '...)' : '❌ Not set'}`);
console.log(`   GEMINI_API_KEY: ${geminiApiKey ? '✅ Set (' + geminiApiKey.substring(0, 10) + '...)' : '❌ Not set'}`);
console.log('');

if (!googleApiKey && !geminiApiKey) {
  console.error('❌ No API key found! Please set GOOGLE_API_KEY or GEMINI_API_KEY in .env.local');
  process.exit(1);
}

console.log('✅ AI configuration looks good!');
console.log('');
console.log('🚀 Next steps:');
console.log('   1. Restart your development server: npm run dev');
console.log('   2. Restart the AI server: npm run genkit:dev');
console.log('   3. Test AI features in the application');
console.log('');
console.log('📝 Note: Make sure both servers are restarted to pick up the new environment variables.');

process.exit(0);