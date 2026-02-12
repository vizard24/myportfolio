'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Schema for quick job matching (no resume/cover letter generation)
const JobMatchInputSchema = z.object({
    resume: z.string().describe('The full text of the base resume.'),
    jobDescription: z.string().describe('The full text of the job description.'),
    jobTitle: z.string().describe('The job title.'),
});

const JobMatchOutputSchema = z.object({
    matchingScore: z
        .number()
        .describe('A realistic, brutally honest matching score from 0 to 100, reflecting how well the resume aligns with the job requirements.'),
    matchingSkills: z
        .array(z.string())
        .describe('A concise list of skills from the resume that are a good match for the job.'),
    lackingSkills: z
        .array(z.string())
        .describe('A concise list of key skills required by the job that are missing or not prominent in the resume.'),
});

export type JobMatchInput = z.infer<typeof JobMatchInputSchema>;
export type JobMatchOutput = z.infer<typeof JobMatchOutputSchema>;

const jobMatchPrompt = ai.definePrompt({
    name: 'jobMatchPrompt',
    input: { schema: JobMatchInputSchema },
    output: { schema: JobMatchOutputSchema },
    prompt: `You are an expert career coach analyzing job fit. Your task is to provide a brutally honest assessment of how well a candidate's resume matches a job description.

**CRITICAL RULES:**
1. **Be BRUTALLY HONEST** - Do not inflate scores. A perfect match is rare (90-100%). Most matches are 40-70%.
2. **Analyze both explicit and implicit requirements** - Consider technical skills, soft skills, experience level, industry knowledge, etc.
3. **Do not invent information** - Only assess based on what's in the resume.
4. **Be strict but fair** - Missing one key requirement should significantly impact the score.

Here is the candidate's resume:
---
{{{resume}}}
---

Here is the job description for: {{{jobTitle}}}
---
{{{jobDescription}}}
---

Provide:
1. A realistic matching score (0-100%)
2. Skills from the resume that match the job
3. Key skills required by the job that are missing from the resume`,
});

const jobMatchFlow = ai.defineFlow(
    {
        name: 'jobMatchFlow',
        inputSchema: JobMatchInputSchema,
        outputSchema: JobMatchOutputSchema,
    },
    async (input) => {
        const result = await jobMatchPrompt(input);
        return result.output!;
    }
);

export interface JobMatchScore {
    matchingScore: number;
    matchingSkills: string[];
    lackingSkills: string[];
}

export async function calculateJobMatchAction(
    resume: string,
    jobDescription: string,
    jobTitle: string
): Promise<{ success: boolean; data?: JobMatchScore; error?: string }> {
    try {
        if (!resume || !jobDescription || !jobTitle) {
            return { success: false, error: 'Missing required fields' };
        }

        const result = await jobMatchFlow({
            resume,
            jobDescription,
            jobTitle,
        });

        return {
            success: true,
            data: {
                matchingScore: result.matchingScore,
                matchingSkills: result.matchingSkills,
                lackingSkills: result.lackingSkills,
            },
        };
    } catch (error) {
        console.error('Job Match Error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to calculate job match',
        };
    }
}
