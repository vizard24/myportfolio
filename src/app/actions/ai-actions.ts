'use server';

import { tailorResumeAndCoverLetter as tailorResumeFlow } from '@/ai/flows/resume-flow';
import { analyzeSkillsFromJobs as analyzeSkillsFlow } from '@/ai/flows/skills-analysis-flow';
import type { JobApplicationInput } from '@/ai/schemas/resume-schema';
import type { SkillsAnalysisInput } from '@/ai/schemas/skills-analysis-schema';

/**
 * Wraps the resume tailoring AI flow in a server action.
 * This ensures the heavy AI libraries and Node.js dependencies are only loaded on the server.
 */
export async function tailorResumeAction(input: JobApplicationInput) {
    console.log('Server Action: Triggering resume tailoring...');
    try {
        const result = await tailorResumeFlow(input);
        return { success: true, data: result };
    } catch (error) {
        console.error('Server Action Error (Tailor Resume):', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error during resume tailoring'
        };
    }
}

/**
 * Wraps the skills analysis AI flow in a server action.
 */
export async function analyzeSkillsAction(input: SkillsAnalysisInput) {
    console.log('Server Action: Triggering skills analysis...', input.jobDescriptions.length, 'jobs');
    try {
        const result = await analyzeSkillsFlow(input);
        return { success: true, data: result };
    } catch (error) {
        console.error('Server Action Error (Skills Analysis):', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error during skills analysis'
        };
    }
}
