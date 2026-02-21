
'use server';

import { ai } from '@/ai/genkit';
import { ResumeRewriteInputSchema, ResumeRewriteOutputSchema } from '@/ai/schemas/resume-rewrite-schema';

const rewritePrompt = ai.definePrompt({
    name: 'rewriteResumePrompt',
    input: { schema: ResumeRewriteInputSchema },
    output: { schema: ResumeRewriteOutputSchema },
    prompt: `You are an expert resume writer and career coach. Your task is to rewrite a candidate's resume to strictly address a specific critique and better align with a job description.

Input Data:
1. **Current Resume**:
"""
{{currentResume}}
"""

2. **Job Description**:
"""
{{jobDescription}}
"""

3. **Critique**:
"""
{{critique}}
"""

Your Goal:
 produce a significantly improved version of the resume that:
- **PRESERVE THE FORMAT**: Keep the exact same structure (headers, bullet points, spacing) as the "Current Resume". Do not change the layout or style.
- **CONTENT ONLY**: Only modify the text content to address the critique.
- Directly fixes every "Critical Dealbreaker" and "High-Impact Fix" mentioned in the critique.
- Incorporates the "Polish & Optimize" suggestions.
- Uses stronger action verbs and quantifiable metrics (KPIs) as suggested.
- Improves the psychological profile (authority tone, readability).
- Better matches the job description by integrating missing keywords and skills naturally.

Rules:
- **NO HALLUCINATIONS**: Do NOT invent a new person (e.g., "John Doe"). Use the Name, Contact Info, and Experience provided in "Current Resume".
- Do NOT fabricate experiences. You can reframe, reword, and elaborate on existing points to be more impactful, but stay truthful.
- The output 'improvedResume' must be the full text of the new resume, ready to copy-paste.
- The output 'improvementsMade' should be a list of the specific changes you implemented.

Start Rewrite...
`
});

export const rewriteResumeFlow = ai.defineFlow(
    {
        name: 'rewriteResumeFlow',
        inputSchema: ResumeRewriteInputSchema,
        outputSchema: ResumeRewriteOutputSchema,
    },
    async (input) => {
        const { output } = await rewritePrompt(input);
        if (!output) {
            throw new Error("AI failed to rewrite the resume.");
        }
        return output;
    }
);
