
import { z } from 'zod';

export const JobApplicationInputSchema = z.object({
  resume: z.string().describe('The full text of the base resume.'),
  jobDescription: z.string().describe('The full text of the job description.'),
});

export const JobApplicationOutputSchema = z.object({
  resume: z
    .string()
    .describe('The tailored resume, optimized to match the job description. It should only contain reformatted information from the original resume and not invent any new facts or experiences.'),
  coverLetter: z
    .string()
    .describe('A compelling cover letter written for the job, based on the provided resume and job description.'),
});

export type JobApplicationInput = z.infer<typeof JobApplicationInputSchema>;
export type JobApplicationOutput = z.infer<typeof JobApplicationOutputSchema>;
