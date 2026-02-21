import { z } from 'zod';

// Deep Resume Critique Schema
export const ResumeCritiqueInputSchema = z.object({
    resume: z.string().describe('The tailored resume content to analyze'),
    jobDescription: z.string().describe('The job description to compare against'),
    matchingScore: z.number().min(0).max(100).describe('Calculated matching score'),
    matchingSkills: z.array(z.string()).describe('Skills that match the job'),
    lackingSkills: z.array(z.string()).describe('Skills missing from the resume'),
});

const ImprovementSuggestionSchema = z.object({
    category: z.enum([
        'Critical Gap',
        'Wording Optimization',
        'Impact & Metrics',
        'Skills Positioning',
        'Experience Framing',
        'Psychological Edge',
    ]).describe('Type of improvement suggestion'),
    priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).describe('Priority level'),
    title: z.string().describe('Short, punchy title'),
    criticism: z.string().describe('Harsh, direct criticism of what\'s wrong'),
    suggestion: z.string().describe('Specific, actionable improvement'),
    psychologicalTrigger: z.string().optional().describe('Subtle psychological influence text (implicit)'),
    estimatedImpact: z.number().min(1).max(10).describe('Expected impact score (1-10)'),
});

export const ResumeCritiqueOutputSchema = z.object({
    overallAssessment: z.object({
        verdict: z.string().describe('One brutal, honest sentence summary'),
        strengthLevel: z.enum(['World-Class', 'Strong', 'Average', 'Below Par', 'Red Flags']),
        competitivePosition: z.string().describe('Where they stand vs. competition'),
    }),
    criticalGaps: z.array(z.string()).describe('Top 3-5 critical gaps causing low score'),
    improvements: z.array(ImprovementSuggestionSchema).describe('Ordered by priority and impact'),
    psychologicalInsights: z.object({
        readabilityScore: z.number().min(0).max(100),
        authorityTone: z.number().min(0).max(100).describe('How authoritative the resume sounds'),
        valueProposition: z.string().describe('What unique value they bring'),
        subconsciousFlags: z.array(z.string()).describe('Red flags hiring managers subconsciously notice'),
    }),
    kpiOptimization: z.object({
        metricsPresent: z.number().min(0).max(100).describe('% of achievements with metrics'),
        actionVerbStrength: z.number().min(0).max(100),
        industrySynergy: z.number().min(0).max(100).describe('Alignment with industry standards'),
        recommendations: z.array(z.string()).describe('Specific KPI improvements'),
    }),
});

export type ResumeCritiqueInput = z.infer<typeof ResumeCritiqueInputSchema>;
export type ResumeCritique = z.infer<typeof ResumeCritiqueOutputSchema>;
