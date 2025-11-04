# Development Guide

## Getting Started

This guide covers the development workflow, coding standards, and best practices for contributing to Synapse Portfolio.

## Development Environment Setup

### Prerequisites

- **Node.js** 18+ and npm
- **Git** for version control
- **VS Code** (recommended) with extensions:
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets
  - Firebase Explorer
  - Prettier - Code formatter

### Initial Setup

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd synapse-portfolio
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Firebase and AI credentials
   ```

3. **Firebase Setup**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use your-project-id
   ```

4. **Start Development Servers**
   ```bash
   # Terminal 1: Next.js development server
   npm run dev

   # Terminal 2: AI development server
   npm run genkit:dev
   ```

## Project Structure Deep Dive

### Core Directories

```
src/
├── ai/                     # AI integration layer
│   ├── flows/             # Genkit AI flows
│   │   ├── resume-generation.ts
│   │   ├── cover-letter.ts
│   │   └── skills-analysis.ts
│   ├── schemas/           # Zod schemas for AI data
│   ├── genkit.ts          # AI configuration
│   └── dev.ts             # Development server
├── app/                   # Next.js App Router
│   ├── application-tracker/
│   │   ├── page.tsx       # Job application tracker
│   │   └── components/    # Tracker-specific components
│   ├── globals.css        # Global styles and CSS variables
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Main portfolio page
├── components/            # React components
│   ├── admin/             # Admin-only components
│   │   ├── AdminPanel.tsx
│   │   └── NetworkingManager.tsx
│   ├── home/              # Portfolio section components
│   │   ├── IntroductionSection.tsx
│   │   ├── ProjectsSection.tsx
│   │   ├── ExperienceSection.tsx
│   │   ├── SkillsSection.tsx
│   │   └── ContactSection.tsx
│   ├── layout/            # Layout components
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Navigation.tsx
│   └── ui/                # Reusable UI components (Radix UI based)
├── context/               # React Context providers
│   ├── auth-context.tsx   # Authentication state
│   ├── admin-mode-context.tsx
│   ├── portfolio-data-context.tsx
│   └── networking-context.tsx
├── data/                  # Static data and TypeScript types
│   └── portfolio-data.ts  # Portfolio content and type definitions
├── firebase/              # Firebase utilities
│   ├── error-emitter.ts   # Error handling
│   └── errors.ts          # Error types
├── hooks/                 # Custom React hooks
│   ├── use-mobile.tsx     # Mobile detection
│   └── use-toast.ts       # Toast notifications
└── lib/                   # Utility functions
    ├── firebase.ts        # Firebase configuration
    └── utils.ts           # General utilities
```

## Development Workflow

### 1. Feature Development

**Branch Naming Convention:**
```bash
feature/ai-resume-generation
bugfix/firestore-connection-issue
hotfix/security-vulnerability
docs/api-documentation
```

**Development Process:**
1. Create feature branch from `main`
2. Implement feature with tests
3. Update documentation
4. Submit pull request
5. Code review and merge

### 2. Code Standards

**TypeScript Configuration:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  }
}
```

**ESLint Rules:**
```json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "prefer-const": "error",
    "no-var": "error",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

### 3. Component Development

**Component Structure:**
```typescript
// components/ui/Button.tsx
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
export { Button };
```

**Component Guidelines:**
- Use TypeScript interfaces for props
- Implement proper accessibility (ARIA labels, keyboard navigation)
- Follow Radix UI patterns for complex components
- Use `forwardRef` for components that need ref forwarding
- Include JSDoc comments for complex components

### 4. State Management

**Context Pattern:**
```typescript
// context/portfolio-data-context.tsx
interface PortfolioDataContextType {
  data: UserProfile | null;
  loading: boolean;
  error: string | null;
  updateData: (data: Partial<UserProfile>) => Promise<void>;
}

export const PortfolioDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [data, setData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Implementation...

  return (
    <PortfolioDataContext.Provider value={{ data, loading, error, updateData }}>
      {children}
    </PortfolioDataContext.Provider>
  );
};
```

### 5. AI Flow Development

**Creating New AI Flows:**
```typescript
// src/ai/flows/new-feature.ts
import { ai } from '../genkit';
import { z } from 'zod';

const InputSchema = z.object({
  userInput: z.string(),
  context: z.object({
    // Define context schema
  }),
});

const OutputSchema = z.object({
  result: z.string(),
  confidence: z.number(),
});

export const newFeatureFlow = ai.defineFlow(
  {
    name: 'newFeature',
    inputSchema: InputSchema,
    outputSchema: OutputSchema,
  },
  async (input) => {
    // AI processing logic
    const prompt = `Process this input: ${input.userInput}`;
    
    const response = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt,
    });

    return {
      result: response.text(),
      confidence: 0.95,
    };
  }
);
```

## Testing Strategy

### 1. Unit Testing

**Component Testing:**
```typescript
// __tests__/components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('applies variant classes correctly', () => {
    render(<Button variant="destructive">Delete</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-destructive');
  });
});
```

**Hook Testing:**
```typescript
// __tests__/hooks/use-mobile.test.tsx
import { renderHook } from '@testing-library/react';
import { useMobile } from '@/hooks/use-mobile';

describe('useMobile', () => {
  it('detects mobile viewport', () => {
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(max-width: 768px)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
      })),
    });

    const { result } = renderHook(() => useMobile());
    expect(result.current).toBe(true);
  });
});
```

### 2. Integration Testing

**Firebase Integration:**
```typescript
// __tests__/integration/firebase.test.ts
import { initializeTestEnvironment } from '@firebase/rules-unit-testing';

describe('Firestore Security Rules', () => {
  let testEnv: any;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'test-project',
      firestore: {
        rules: fs.readFileSync('firestore.rules', 'utf8'),
      },
    });
  });

  it('allows users to read their own data', async () => {
    const alice = testEnv.authenticatedContext('alice');
    const doc = alice.firestore().doc('users/alice');
    
    await expect(doc.get()).resolves.not.toThrow();
  });
});
```

### 3. AI Flow Testing

```typescript
// __tests__/ai/resume-generation.test.ts
import { ai } from '@/ai/genkit';

describe('Resume Generation Flow', () => {
  it('generates tailored resume', async () => {
    const input = {
      userProfile: mockUserProfile,
      jobDescription: 'Senior React Developer position...',
      language: 'English' as const,
    };

    const result = await ai.runFlow('generateTailoredResume', input);
    
    expect(result.tailoredResume).toBeDefined();
    expect(result.matchingScore).toBeGreaterThan(0);
    expect(result.matchingSkills).toContain('React');
  });
});
```

## Performance Optimization

### 1. Bundle Optimization

**Dynamic Imports:**
```typescript
// Lazy load heavy components
const AdminPanel = dynamic(() => import('@/components/admin/AdminPanel'), {
  loading: () => <Skeleton className="h-96" />,
  ssr: false,
});

// Lazy load AI flows
const generateResume = async (input: any) => {
  const { resumeFlow } = await import('@/ai/flows/resume-generation');
  return resumeFlow(input);
};
```

**Bundle Analysis:**
```bash
# Analyze bundle size
npm run build -- --analyze

# Check for duplicate dependencies
npx duplicate-package-checker-webpack-plugin
```

### 2. React Optimization

**Memoization:**
```typescript
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// Memoize callback functions
const handleClick = useCallback((id: string) => {
  onItemClick(id);
}, [onItemClick]);

// Memoize components
const MemoizedComponent = memo(({ data }: Props) => {
  return <div>{data.name}</div>;
});
```

### 3. Database Optimization

**Efficient Queries:**
```typescript
// Use indexes for complex queries
const getApplications = async (userId: string) => {
  return db
    .collection('users')
    .doc(userId)
    .collection('applications')
    .orderBy('createdAt', 'desc')
    .limit(20)
    .get();
};

// Batch operations
const batchUpdate = async (updates: any[]) => {
  const batch = db.batch();
  updates.forEach(update => {
    batch.update(update.ref, update.data);
  });
  return batch.commit();
};
```

## Debugging

### 1. Development Tools

**React Developer Tools:**
- Install React DevTools browser extension
- Use Profiler to identify performance bottlenecks
- Inspect component props and state

**Firebase Debugging:**
```typescript
// Enable Firestore debug logging
import { enableNetwork, disableNetwork } from 'firebase/firestore';

// Debug network issues
await disableNetwork(db);
console.log('Offline mode enabled');
await enableNetwork(db);
console.log('Online mode restored');
```

### 2. AI Flow Debugging

**Genkit Dev UI:**
```bash
# Start Genkit development server
npm run genkit:dev

# Access at http://localhost:4000
# - View flow execution traces
# - Test flows with sample data
# - Monitor AI model performance
```

**Custom Logging:**
```typescript
// Add detailed logging to AI flows
export const debugFlow = ai.defineFlow(
  { name: 'debug', inputSchema: z.any(), outputSchema: z.any() },
  async (input) => {
    console.log('Flow input:', JSON.stringify(input, null, 2));
    
    const startTime = Date.now();
    const result = await processInput(input);
    const duration = Date.now() - startTime;
    
    console.log(`Flow completed in ${duration}ms`);
    console.log('Flow output:', JSON.stringify(result, null, 2));
    
    return result;
  }
);
```

## Security Best Practices

### 1. Input Validation

```typescript
// Use Zod for runtime validation
const UserInputSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  message: z.string().max(1000),
});

const validateInput = (input: unknown) => {
  try {
    return UserInputSchema.parse(input);
  } catch (error) {
    throw new Error('Invalid input format');
  }
};
```

### 2. Authentication Guards

```typescript
// Protect sensitive operations
const requireAuth = (handler: Function) => {
  return async (req: any, res: any) => {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return handler(req, res, user);
  };
};
```

### 3. Data Sanitization

```typescript
// Sanitize user content
import DOMPurify from 'dompurify';

const sanitizeHTML = (html: string) => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em'],
    ALLOWED_ATTR: [],
  });
};
```

## Contributing Guidelines

### 1. Pull Request Process

1. **Pre-submission Checklist:**
   - [ ] Code follows TypeScript and ESLint standards
   - [ ] All tests pass (`npm test`)
   - [ ] Type checking passes (`npm run typecheck`)
   - [ ] Documentation updated
   - [ ] No console.log statements in production code

2. **PR Description Template:**
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Unit tests added/updated
   - [ ] Integration tests pass
   - [ ] Manual testing completed

   ## Screenshots (if applicable)
   ```

### 2. Code Review Guidelines

**For Reviewers:**
- Check for security vulnerabilities
- Verify accessibility compliance
- Ensure performance considerations
- Validate error handling
- Review test coverage

**For Authors:**
- Respond to feedback promptly
- Make requested changes in separate commits
- Update documentation as needed
- Ensure CI/CD pipeline passes

## Troubleshooting Common Issues

### 1. Build Issues

**TypeScript Errors:**
```bash
# Clear TypeScript cache
rm -rf .next/cache
npx tsc --build --clean

# Check for type conflicts
npm run typecheck -- --listFiles
```

**Dependency Conflicts:**
```bash
# Check for peer dependency issues
npm ls

# Update dependencies
npm update

# Clear npm cache
npm cache clean --force
```

### 2. Firebase Issues

**Authentication Problems:**
```typescript
// Debug auth state
import { onAuthStateChanged } from 'firebase/auth';

onAuthStateChanged(auth, (user) => {
  console.log('Auth state changed:', user?.uid || 'Not authenticated');
});
```

**Firestore Connection Issues:**
```typescript
// Test Firestore connectivity
const testConnection = async () => {
  try {
    await db.doc('test/connection').get();
    console.log('Firestore connected successfully');
  } catch (error) {
    console.error('Firestore connection failed:', error);
  }
};
```

### 3. AI Flow Issues

**Model Response Issues:**
```typescript
// Add retry logic for AI calls
const retryAICall = async (flow: string, input: any, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await ai.runFlow(flow, input);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};
```

## Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Genkit Documentation](https://firebase.google.com/docs/genkit)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs)

### Tools
- [React Developer Tools](https://react.dev/learn/react-developer-tools)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
- [Genkit Developer UI](https://firebase.google.com/docs/genkit/devtools)
- [TypeScript Playground](https://www.typescriptlang.org/play)