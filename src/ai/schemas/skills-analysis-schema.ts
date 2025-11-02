
import { z } from 'zod';

export const SkillsAnalysisInputSchema = z.object({
  jobDescriptions: z.array(z.string()).describe('An array of job description texts to be analyzed.'),
});

const SkillCountSchema = z.object({
    skill: z.string().describe('The name of the skill.'),
    count: z.number().describe('The number of times the skill occurred across all job descriptions.'),
});

export const SkillsAnalysisOutputSchema = z.object({
  technicalSkills: z
    .array(SkillCountSchema)
    .describe('A ranked list of the top 10 most frequent technical skills.'),
  softSkills: z
    .array(SkillCountSchema)
    .describe('A ranked list of the top 10 most frequent soft skills.'),
});

export type SkillsAnalysisInput = z.infer<typeof SkillsAnalysisInputSchema>;
export type SkillAnalysis = z.infer<typeof SkillsAnalysisOutputSchema>;
