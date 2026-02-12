
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
  prompt: `You are an expert HR analyst and career coach. Your task is to analyze a collection of job descriptions and compare them against a candidate's resume to identify skill gaps and strengths.

You must adhere to the following rules:
1.  **Analyze Job Descriptions:** Go through every job description provided to identify required skills.
2.  **Analyze Resume (Gap Analysis):** Check if the identified skills are present in the provided 'userResume'.
    - Mark as **'present'** if the candidate clearly has this skill.
    - Mark as **'missing'** if the candidate does not mention this skill or a strong synonym.
3.  **Categorize Skills:** Assign each skill to one of the following categories:
    - **Language**: Programming languages (e.g., JavaScript, Python, Java).
    - **Framework**: Libraries and frameworks (e.g., React, Django, Spring Boot).
    - **Tool**: Tools, platforms, and software (e.g., Docker, AWS, Git, Jira).
    - **Soft Skill**: Interpersonal and non-technical skills (e.g., Communication, Leadership).
    - **Other**: Concepts, methodologies, or anything else (e.g., Agile, CI/CD, System Design).
4.  **Calculate Relevance Score:** Assign a score (0-100) based on how frequently the skill appears across job descriptions and its typical importance in the industry.
5.  **Rank by Importance:** Order skills primarily by frequency/relevance.
6.  **Top 15 Limit:** Limit each list (technical and soft skills) to the top 15 most important skills.

Here is the candidate's resume:
---
{{userResume}}
---

Here is the collection of job descriptions to analyze:
---
{{#each jobDescriptions}}
Job Description {{index}}:
{{{this}}}
---
{{/each}}

Please provide the detailed analysis in the specified JSON format.
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
