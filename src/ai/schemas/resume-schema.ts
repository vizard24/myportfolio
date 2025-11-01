
import { z } from 'zod';

export const JobApplicationInputSchema = z.object({
  resume: z.string().describe('The full text of the base resume.'),
  jobDescription: z.string().describe('The full text of the job description.'),
  language: z.enum(['French', 'English']).describe('The target language for the output.'),
});

export const JobApplicationOutputSchema = z.object({
  jobTitle: z.string().describe('The job title, extracted from the job description.'),
  resume: z
    .string()
    .describe('The tailored resume, optimized to match the job description. It should only contain reformatted information from the original resume and not invent any new facts or experiences.'),
  coverLetter: z
    .string()
    .describe('A compelling cover letter written for the job, based on the provided resume and job description.'),
  matchingScore: z
    .number()
    .describe('A realistic, strict matching score from 0 to 100, reflecting how well the resume aligns with the job requirements.'),
  matchingSkills: z
    .array(z.string())
    .describe('A concise list of skills from the resume that are a good match for the job.'),
  lackingSkills: z
    .array(z.string())
    .describe('A concise list of key skills required by the job that are missing or not prominent in the resume.'),
});

export type JobApplicationInput = z.infer<typeof JobApplicationInputSchema>;
export type JobApplicationOutput = z.infer<typeof JobApplicationOutputSchema>;
