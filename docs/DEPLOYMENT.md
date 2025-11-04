# Deployment Guide

## Overview

This guide covers deploying Synapse Portfolio to production using Firebase Hosting with integrated AI capabilities.

## Prerequisites

- Firebase CLI installed and configured
- Google Cloud Project with billing enabled
- Firebase project with required services enabled:
  - Authentication
  - Firestore
  - Hosting
  - Functions (for AI flows)
- Google AI API key for Genkit

## Environment Setup

### 1. Firebase Configuration

Create or update `firebase.json`:
```json
{
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "functions": {
    "source": "functions",
    "runtime": "nodejs18"
  }
}
```

### 2. Environment Variables

Create `.env.production`:
```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google AI Configuration
GOOGLE_AI_API_KEY=your_google_ai_key

# Application Configuration
NEXT_PUBLIC_APP_URL=https://your_project.web.app
NODE_ENV=production
```

### 3. Next.js Configuration

Update `next.config.ts` for production:
```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY,
  },
};

export default nextConfig;
```

## Deployment Steps

### 1. Build the Application

```bash
# Install dependencies
npm ci

# Run type checking
npm run typecheck

# Run linting
npm run lint

# Build the application
npm run build
```

### 2. Deploy Firestore Rules and Indexes

```bash
# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

### 3. Deploy AI Functions

If using Firebase Functions for AI flows:

```bash
# Deploy functions
firebase deploy --only functions
```

### 4. Deploy to Firebase Hosting

```bash
# Deploy the web application
firebase deploy --only hosting
```

### 5. Complete Deployment

```bash
# Deploy everything at once
firebase deploy
```

## Production Optimizations

### 1. Performance Optimizations

**Bundle Analysis:**
```bash
# Analyze bundle size
npm run build -- --analyze
```

**Image Optimization:**
- Use WebP format for images
- Implement lazy loading
- Optimize image sizes for different screen sizes

**Code Splitting:**
```typescript
// Dynamic imports for large components
const AdminPanel = dynamic(() => import('@/components/admin/AdminPanel'), {
  loading: () => <div>Loading...</div>,
});
```

### 2. Caching Strategy

**Static Assets:**
```json
{
  "source": "**/*.@(js|css|png|jpg|jpeg|gif|ico|svg)",
  "headers": [
    {
      "key": "Cache-Control",
      "value": "public, max-age=31536000, immutable"
    }
  ]
}
```

**API Responses:**
```typescript
// Cache AI responses
const cacheKey = `resume_${userId}_${jobHash}`;
const cachedResponse = await cache.get(cacheKey);
if (cachedResponse) {
  return cachedResponse;
}
```

### 3. Security Hardening

**Content Security Policy:**
```json
{
  "source": "**",
  "headers": [
    {
      "key": "Content-Security-Policy",
      "value": "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com;"
    }
  ]
}
```

**Security Headers:**
```json
{
  "source": "**",
  "headers": [
    {
      "key": "X-Frame-Options",
      "value": "DENY"
    },
    {
      "key": "X-Content-Type-Options",
      "value": "nosniff"
    },
    {
      "key": "Referrer-Policy",
      "value": "strict-origin-when-cross-origin"
    }
  ]
}
```

## Monitoring and Analytics

### 1. Firebase Performance Monitoring

```typescript
import { getPerformance } from 'firebase/performance';

const perf = getPerformance();
// Automatic performance monitoring enabled
```

### 2. Error Tracking

```typescript
import { getAnalytics, logEvent } from 'firebase/analytics';

const analytics = getAnalytics();

// Track custom events
logEvent(analytics, 'resume_generated', {
  job_title: jobTitle,
  matching_score: score,
});
```

### 3. Custom Metrics

```typescript
// Track AI usage
const trackAIUsage = (flowName: string, duration: number) => {
  logEvent(analytics, 'ai_flow_completed', {
    flow_name: flowName,
    duration_ms: duration,
  });
};
```

## Scaling Considerations

### 1. Database Scaling

**Firestore Optimization:**
- Use composite indexes for complex queries
- Implement pagination for large datasets
- Cache frequently accessed data

**Example Index:**
```json
{
  "collectionGroup": "applications",
  "queryScope": "COLLECTION",
  "fields": [
    {
      "fieldPath": "userId",
      "order": "ASCENDING"
    },
    {
      "fieldPath": "createdAt",
      "order": "DESCENDING"
    }
  ]
}
```

### 2. AI Scaling

**Request Batching:**
```typescript
const batchAIRequests = async (requests: AIRequest[]) => {
  const batches = chunk(requests, 5); // Process 5 at a time
  const results = [];
  
  for (const batch of batches) {
    const batchResults = await Promise.all(
      batch.map(req => ai.runFlow(req.flow, req.input))
    );
    results.push(...batchResults);
  }
  
  return results;
};
```

**Rate Limiting:**
```typescript
import { RateLimiter } from 'limiter';

const limiter = new RateLimiter(60, 'minute'); // 60 requests per minute

const rateLimitedAICall = async (flow: string, input: any) => {
  await limiter.removeTokens(1);
  return ai.runFlow(flow, input);
};
```

## Backup and Recovery

### 1. Firestore Backup

```bash
# Export Firestore data
gcloud firestore export gs://your-backup-bucket/backup-$(date +%Y%m%d)

# Schedule automated backups
gcloud scheduler jobs create app-engine backup-firestore \
  --schedule="0 2 * * *" \
  --relative-url="/backup" \
  --http-method=POST
```

### 2. Code Backup

- Use Git with multiple remotes
- Automated GitHub/GitLab backups
- Regular dependency audits

## Rollback Strategy

### 1. Quick Rollback

```bash
# Rollback to previous hosting deployment
firebase hosting:clone SOURCE_SITE_ID:SOURCE_VERSION_ID TARGET_SITE_ID

# Rollback Firestore rules
firebase deploy --only firestore:rules --project=previous-version
```

### 2. Database Migration

```typescript
// Migration script for data structure changes
const migrateUserProfiles = async () => {
  const users = await db.collection('users').get();
  const batch = db.batch();
  
  users.docs.forEach(doc => {
    const data = doc.data();
    // Apply migration logic
    batch.update(doc.ref, migratedData);
  });
  
  await batch.commit();
};
```

## Health Checks

### 1. Application Health

```typescript
// Health check endpoint
export async function GET() {
  try {
    // Check database connectivity
    await db.collection('health').doc('check').get();
    
    // Check AI service
    await ai.runFlow('healthCheck', {});
    
    return Response.json({ status: 'healthy' });
  } catch (error) {
    return Response.json({ status: 'unhealthy', error }, { status: 500 });
  }
}
```

### 2. Monitoring Alerts

Set up Firebase alerts for:
- High error rates
- Performance degradation
- Quota approaching limits
- Security rule violations

## Troubleshooting

### Common Issues

**Build Failures:**
```bash
# Clear Next.js cache
rm -rf .next

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Deployment Failures:**
```bash
# Check Firebase CLI version
firebase --version

# Login again
firebase logout
firebase login

# Check project configuration
firebase projects:list
firebase use your-project-id
```

**Performance Issues:**
- Check bundle size with webpack-bundle-analyzer
- Monitor Core Web Vitals
- Review Firestore query performance
- Optimize AI flow response times

### Support Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Genkit Documentation](https://firebase.google.com/docs/genkit)
- [Firebase Support](https://firebase.google.com/support)