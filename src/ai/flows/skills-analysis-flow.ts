
'use server';

/**
 * @fileOverview An AI flow for analyzing skills from a collection of job descriptions.
 *
 * - analyzeSkillsFromJobs - Aggregates and counts skills from multiple job descriptions.
 */

import { ai } from '@/ai/genkit';
import { SkillsAnalysisInputSchema, SkillsAnalysisOutputSchema, type SkillsAnalysisInput, type SkillAnalysis } from '@/ai/schemas/skills-analysis-schema';

const skillsAnalysisPrompt = ai.definePrompt({
    name: 'skillsAnalysisPrompt',
    input: { schema: SkillsAnalysisInputSchema },
    output: { schema: SkillsAnalysisOutputSchema },
    prompt: `You are an expert HR analyst and data scientist. Your task is to analyze a collection of job descriptions and identify the most frequently required skills.

You must adhere to the following rules:
1.  **Analyze All Descriptions:** Go through every job description provided in the 'jobDescriptions' array.
2.  **Extract Skills:** For each job description, identify both technical skills (e.g., 'React', 'Python', 'SQL', 'AWS', 'Docker') and soft skills (e.g., 'Communication', 'Teamwork', 'Problem-solving', 'Leadership').
3.  **Normalize and Aggregate:** Normalize the skill names to ensure consistency (e.g., "React.js" and "React" should both count as "React"). Aggregate the counts for each unique skill across all job descriptions.
4.  **Rank by Frequency:** Order the lists of technical skills and soft skills from the most frequently mentioned to the least.
5.  **Be Concise:** Only include skills that are explicitly or very strongly implicitly mentioned. Do not infer skills that are not there.
6.  **Top 10 Limit:** Limit each list (technical and soft skills) to a maximum of the top 10 most frequent skills.

Here is the collection of job descriptions to analyze:
---
{{#each jobDescriptions}}
Job Description {{index}}:
{{{this}}}
---
{{/each}}

Please provide the aggregated and ranked lists of technical and soft skills in the specified JSON format.
`,
});

const skillsAnalysisFlow = ai.defineFlow(
  {
    name: 'skillsAnalysisFlow',
    inputSchema: SkillsAnalysisInputSchema,
    outputSchema: SkillsAnalysisOutputSchema,
  },
  async (input) => {
    if (input.jobDescriptions.length === 0) {
        return { technicalSkills: [], softSkills: [] };
    }
    
    const { output } = await skillsAnalysisPrompt(input);
    if (!output) {
        throw new Error("AI failed to generate a response for skills analysis.");
    }
    return output;
  }
);


export async function analyzeSkillsFromJobs(input: SkillsAnalysisInput): Promise<SkillAnalysis> {
    return skillsAnalysisFlow(input);
}
