
'use server';

/**
 * @fileOverview An AI flow for tailoring resumes and generating cover letters.
 *
 * - tailorResumeAndCoverLetter - A function that adapts a resume and creates a cover letter based on a job description.
 */

import { ai } from '@/ai/genkit';
import { JobApplicationInputSchema, JobApplicationOutputSchema, type JobApplicationInput, type JobApplicationOutput } from '@/ai/schemas/resume-schema';

const tailorPrompt = ai.definePrompt({
    name: 'tailorResumePrompt',
    input: { schema: JobApplicationInputSchema },
    output: { schema: JobApplicationOutputSchema },
    prompt: `You are an expert career coach and resume writer. Your task is to help a job seeker tailor their resume and write a cover letter for a specific job application.

You must adhere to the following rules:
1. **Do not invent or fabricate information.** Your output must be based solely on the provided resume content. You can rephrase, reorder, and highlight skills, but you cannot add experiences, skills, or qualifications that are not present in the original resume.
2. **Analyze the Job Description:** Carefully study the job description to identify key requirements, skills, and qualifications, both explicit and implicit.
3. **Tailor the Resume:** Modify the provided resume to best match the job description. This means emphasizing the most relevant experiences and skills, using keywords from the job description, and structuring the resume to pass through Applicant Tracking Systems (ATS) and appeal to hiring managers.
4. **Generate a Cover Letter:** Write a professional and persuasive cover letter. The cover letter should:
    - Express genuine interest in the role and company.
    - Highlight 2-3 of the most relevant experiences or skills from the resume that align with the job description.
    - Maintain a professional and confident tone.

Here is the user's base resume:
---
{{{resume}}}
---

Here is the job description:
---
{{{jobDescription}}}
---

Please provide the tailored resume and the cover letter in the specified JSON format.
`,
});


const tailorResumeFlow = ai.defineFlow(
  {
    name: 'tailorResumeFlow',
    inputSchema: JobApplicationInputSchema,
    outputSchema: JobApplicationOutputSchema,
  },
  async (input) => {
    const { output } = await tailorPrompt(input);
    if (!output) {
        throw new Error("AI failed to generate a response.");
    }
    return output;
  }
);


export async function tailorResumeAndCoverLetter(input: JobApplicationInput): Promise<JobApplicationOutput> {
    return tailorResumeFlow(input);
}
