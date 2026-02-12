'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const JobTitleSuggestionsInputSchema = z.object({
    resume: z.string().describe('The user\'s resume content'),
});

const JobTitleSuggestionsOutputSchema = z.object({
    suggestions: z.array(z.string()).describe('Array of 5-7 relevant job title suggestions, prioritizing internships and entry-level positions'),
});

const jobTitleSuggestionsFlow = ai.defineFlow(
    {
        name: 'jobTitleSuggestions',
        inputSchema: JobTitleSuggestionsInputSchema,
        outputSchema: JobTitleSuggestionsOutputSchema,
    },
    async (input) => {
        const prompt = `You are a career advisor AI. Analyze the following resume and suggest 5-7 relevant job titles that this candidate should search for.

IMPORTANT GUIDELINES:
1. **Prioritize internships** - If the candidate appears to be a student or early-career professional, suggest internship positions first
2. Include a mix of:
   - Internship positions (e.g., "Software Engineering Intern", "Data Science Intern")
   - Entry-level positions (e.g., "Junior Developer", "Associate Analyst")
   - Relevant full-time roles based on their experience
3. Be specific and realistic based on their actual skills and experience level
4. Use common job title formats that will yield good search results
5. Consider their technical skills, education, and any mentioned interests

Resume:
${input.resume}

Provide job title suggestions that will help them find the most relevant opportunities.`;

        const result = await ai.generate({
            model: 'googleai/gemini-2.0-flash-exp',
            prompt,
            output: {
                schema: JobTitleSuggestionsOutputSchema,
            },
        });

        return result.output!;
    }
);

export async function suggestJobTitlesAction(input: z.infer<typeof JobTitleSuggestionsInputSchema>) {
    try {
        const result = await jobTitleSuggestionsFlow(input);
        return { success: true, data: result };
    } catch (error) {
        console.error('Job title suggestions error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to generate job title suggestions'
        };
    }
}
