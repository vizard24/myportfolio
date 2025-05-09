'use server';

/**
 * @fileOverview Generates tailored resume pitches based on selected specializations.
 *
 * - generateResumePitch - A function that generates a resume pitch for a given specialization.
 * - ResumePitchInput - The input type for the generateResumePitch function.
 * - ResumePitchOutput - The return type for the generateResumePitch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ResumePitchInputSchema = z.object({
  specialization: z
    .string()
    .describe("The job specialization to tailor the resume pitch for (e.g., 'Frontend Engineer', 'Backend Engineer', 'Data Scientist')."),
  resumeSummary: z.string().describe('A summary of the user\'s resume.'),
});
export type ResumePitchInput = z.infer<typeof ResumePitchInputSchema>;

const ResumePitchOutputSchema = z.object({
  pitch: z.string().describe('A tailored resume pitch for the specified specialization.'),
});
export type ResumePitchOutput = z.infer<typeof ResumePitchOutputSchema>;

export async function generateResumePitch(input: ResumePitchInput): Promise<ResumePitchOutput> {
  return resumePitchFlow(input);
}

const prompt = ai.definePrompt({
  name: 'resumePitchPrompt',
  input: {schema: ResumePitchInputSchema},
  output: {schema: ResumePitchOutputSchema},
  prompt: `You are an expert resume writer, skilled at tailoring resumes to specific job roles.

  Given the following resume summary and job specialization, generate a concise and compelling resume pitch highlighting the most relevant skills and experience for that role.

  Resume Summary: {{{resumeSummary}}}
  Job Specialization: {{{specialization}}}

  Focus on quantifiable achievements and keywords that align with the specialization. The pitch should be no more than 3 sentences.
  `,
});

const resumePitchFlow = ai.defineFlow(
  {
    name: 'resumePitchFlow',
    inputSchema: ResumePitchInputSchema,
    outputSchema: ResumePitchOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
