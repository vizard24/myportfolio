# API Documentation

## Overview

Synapse Portfolio uses Firebase as the primary backend with Genkit AI flows for intelligent features. This document covers the data models, API endpoints, and AI flows.

## Data Models

### User Profile Structure

```typescript
interface UserProfile {
  personalInfo: PersonalInfo;
  projects: Project[];
  experience: Experience[];
  skills: SkillCategory[];
  networkingContacts: NetworkingContact[];
}
```

### Core Entities

#### PersonalInfo
```typescript
interface PersonalInfo {
  name: string;
  title: string;
  introduction: string;
  profilePictureUrl: string;
  profilePictureHint: string;
  contact: ContactInfo;
  resumeSummaries: ResumeSummary[];
}

interface ContactInfo {
  email: ContactLink;
  linkedin: ContactLink;
  github: ContactLink;
  twitter: ContactLink;
  instagram: ContactLink;
  substack: ContactLink;
  medium: ContactLink;
  discord: ContactLink;
}

interface ContactLink {
  url: string;
  visible: boolean;
}

interface ResumeSummary {
  id: string;
  title: string;
  content: string;
}
```

#### Project
```typescript
interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageHint?: string;
  techStack: Tech[];
  githubUrl?: string;
  liveDemoUrl?: string;
  caseStudyUrl?: string;
  videoDemoUrl?: string;
  apiDocsUrl?: string;
  designFilesUrl?: string;
}

interface Tech {
  name: string;
  iconName?: string;
}
```

#### Experience
```typescript
interface Experience {
  id: string;
  type: 'work' | 'education';
  title: string;
  institution: string;
  dateRange: string;
  description: string[];
  iconName?: string;
}
```

#### Skills
```typescript
interface SkillCategory {
  id: string;
  name: string;
  skills: Skill[];
}

interface Skill {
  id: string;
  name: string;
  level: number; // 0-100
  iconName?: string;
}
```

#### Networking Contact
```typescript
interface NetworkingContact {
  id: string;
  name: string;
  linkedinUrl: string;
  companies: string;
  positions: string;
  certifications: string;
  college: string;
  status: 'Not Contacted' | 'Contacted' | 'In Progress' | 'Follow-up Needed' | 'Closed';
}
```

#### Job Application
```typescript
interface JobApplication {
  userId: string;
  jobTitle: string;
  jobDescription: string;
  applicationLink: string;
  tailoredResume: string;
  coverLetter: string;
  language: string;
  matchingScore: number; // 0-100
  matchingSkills: string[];
  lackingSkills: string[];
  createdAt: string; // ISO date
}
```

## Firestore Database Structure

### Collections

#### `/users/{userId}`
Stores the complete user profile data.

**Security Rules:**
```javascript
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
}
```

**Example Document:**
```json
{
  "personalInfo": {
    "name": "Yaovi Gadedjro",
    "title": "Innovative Full-Stack Developer",
    "introduction": "A passionate and results-driven Full-Stack Developer...",
    "contact": {
      "email": { "url": "fgadedjro@gmail.com", "visible": true },
      "linkedin": { "url": "https://linkedin.com/in/yaovigadedjro", "visible": true }
    }
  },
  "projects": [...],
  "experience": [...],
  "skills": [...],
  "networkingContacts": [...]
}
```

#### `/users/{userId}/applications/{applicationId}`
Stores individual job applications with AI-generated content.

**Security Rules:**
```javascript
match /users/{userId}/applications/{applicationId} {
  allow read, write: if request.auth.uid == userId;
}
```

**Example Document:**
```json
{
  "userId": "user123",
  "jobTitle": "Senior Full-Stack Developer",
  "jobDescription": "We are looking for a senior developer...",
  "applicationLink": "https://company.com/jobs/123",
  "tailoredResume": "AI-generated resume content...",
  "coverLetter": "AI-generated cover letter...",
  "language": "English",
  "matchingScore": 85,
  "matchingSkills": ["React", "Node.js", "TypeScript"],
  "lackingSkills": ["Kubernetes", "GraphQL"],
  "createdAt": "2024-01-15T10:30:00Z"
}
```

## AI Flows (Genkit)

### Resume Generation Flow

**Endpoint:** `generateTailoredResume`

**Input:**
```typescript
interface ResumeGenerationInput {
  userProfile: UserProfile;
  jobDescription: string;
  language: 'English' | 'French';
}
```

**Output:**
```typescript
interface ResumeGenerationOutput {
  tailoredResume: string;
  matchingScore: number;
  matchingSkills: string[];
  lackingSkills: string[];
}
```

**Usage:**
```typescript
const result = await ai.runFlow('generateTailoredResume', {
  userProfile: userData,
  jobDescription: jobDesc,
  language: 'English'
});
```

### Cover Letter Generation Flow

**Endpoint:** `generateCoverLetter`

**Input:**
```typescript
interface CoverLetterInput {
  userProfile: UserProfile;
  jobDescription: string;
  jobTitle: string;
  language: 'English' | 'French';
}
```

**Output:**
```typescript
interface CoverLetterOutput {
  coverLetter: string;
}
```

### Skills Analysis Flow

**Endpoint:** `analyzeSkillsMatch`

**Input:**
```typescript
interface SkillsAnalysisInput {
  userSkills: Skill[];
  jobDescription: string;
}
```

**Output:**
```typescript
interface SkillsAnalysisOutput {
  matchingSkills: string[];
  lackingSkills: string[];
  matchingScore: number;
  recommendations: string[];
}
```

## Firebase Authentication

### Supported Providers
- Google OAuth 2.0

### Authentication Flow
```typescript
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const provider = new GoogleAuthProvider();
const result = await signInWithPopup(auth, provider);
const user = result.user;
```

### Protected Routes
All data operations require authentication. Unauthenticated users can only view the public portfolio.

## Error Handling

### Firebase Errors
```typescript
interface FirebaseError {
  code: string;
  message: string;
  details?: any;
}
```

**Common Error Codes:**
- `permission-denied`: User lacks required permissions
- `not-found`: Document or collection doesn't exist
- `already-exists`: Attempting to create duplicate document
- `resource-exhausted`: Quota limits exceeded

### AI Flow Errors
```typescript
interface AIFlowError {
  type: 'validation' | 'processing' | 'quota' | 'network';
  message: string;
  retryable: boolean;
}
```

## Rate Limits and Quotas

### Firestore Limits
- **Reads:** 50,000 per day (free tier)
- **Writes:** 20,000 per day (free tier)
- **Document Size:** 1 MB maximum
- **Batch Operations:** 500 operations per batch

### AI Flow Limits
- **Requests per minute:** 60 (configurable)
- **Token limits:** Based on Gemini API quotas
- **Concurrent requests:** 10 maximum

## Caching Strategy

### Client-Side Caching
- React Query for server state caching
- 5-minute stale time for user profile data
- Infinite cache time for static data

### Server-Side Caching
- Firebase SDK automatic caching
- AI response caching for identical inputs
- CDN caching for static assets

## Development and Testing

### Local Development
```bash
# Start Firebase emulators
firebase emulators:start

# Connect to local Firestore
export FIRESTORE_EMULATOR_HOST="localhost:8080"
```

### Testing Data
Use the Firebase emulator with seed data for consistent testing:

```typescript
// Test user profile
const testUserProfile = {
  personalInfo: { /* test data */ },
  projects: [ /* test projects */ ],
  // ... other test data
};
```

### API Testing
```typescript
// Example test for AI flow
describe('Resume Generation', () => {
  it('should generate tailored resume', async () => {
    const result = await ai.runFlow('generateTailoredResume', testInput);
    expect(result.tailoredResume).toBeDefined();
    expect(result.matchingScore).toBeGreaterThan(0);
  });
});
```

## Security Best Practices

### Data Validation
- All inputs validated with Zod schemas
- Sanitization of user-generated content
- XSS protection for dynamic content

### API Security
- Authentication required for all write operations
- Rate limiting on AI endpoints
- Input size limits to prevent abuse

### Privacy
- No PII sent to external AI services without consent
- User data encrypted at rest and in transit
- GDPR compliance for EU users