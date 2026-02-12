
import { z } from 'zod';

export const SkillsAnalysisInputSchema = z.object({
  jobDescriptions: z.array(z.string()).describe('An array of job description texts to be analyzed.'),
  userResume: z.string().optional().describe('The text content of the user\'s resume for gap analysis.'),
});

const SkillCountSchema = z.object({
  skill: z.string().describe('The name of the skill.'),
  count: z.number().describe('The number of times the skill occurred across all job descriptions.'),
  status: z.enum(['missing', 'present']).describe('Whether the skill is missing from the user\'s resume.'),
  category: z.enum(['Language', 'Framework', 'Tool', 'Soft Skill', 'Other']).describe('The category of the skill.'),
  relevanceScore: z.number().min(0).max(100).describe('A score indicating how important this skill is (0-100).'),
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
