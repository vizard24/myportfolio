
import { z } from 'zod';
import { ResumeCritiqueOutputSchema } from './resume-critique-schema';

export const ResumeRewriteInputSchema = z.object({
    currentResume: z.string().describe('The current resume text.'),
    jobDescription: z.string().describe('The job description to target.'),
    critique: ResumeCritiqueOutputSchema.describe('The critique to address.'),
});

export const ResumeRewriteOutputSchema = z.object({
    improvedResume: z.string().describe('The rewritten, improved resume text.'),
    improvementsMade: z.array(z.string()).describe('List of specific improvements made based on the critique.'),
});

export type ResumeRewriteInput = z.infer<typeof ResumeRewriteInputSchema>;
export type ResumeRewriteOutput = z.infer<typeof ResumeRewriteOutputSchema>;
