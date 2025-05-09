'use server';
/**
 * @fileOverview Generates tailored full resumes based on specialization and comprehensive portfolio data.
 *
 * - generateTailoredResume - A function that generates a full resume tailored for a given specialization.
 * - TailoredResumeInput - The input type for the generateTailoredResume function.
 * - TailoredResumeOutput - The return type for the generateTailoredResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Schemas for portfolio data structures
const PersonalInfoContactSchema = z.object({
  email: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
});

const PersonalInfoSchema = z.object({
  name: z.string(),
  title: z.string(),
  introduction: z.string(),
  contact: PersonalInfoContactSchema,
  resumeSummary: z.string(),
});

const TechStackItemSchema = z.object({ name: z.string() }); // Icon not needed for text generation

const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  techStack: z.array(TechStackItemSchema),
  githubUrl: z.string().optional(),
  liveDemoUrl: z.string().optional(),
});

const ExperienceSchema = z.object({
  id: z.string(),
  type: z.enum(['work', 'education']),
  title: z.string(),
  institution: z.string(),
  dateRange: z.string(),
  description: z.union([z.string(), z.array(z.string())]),
});

const SkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: z.number(),
});

const SkillCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  skills: z.array(SkillSchema),
});

// Input Schema for the AI flow
const TailoredResumeInputSchema = z.object({
  specialization: z
    .string()
    .describe("The job specialization to tailor the resume for (e.g., 'Frontend Engineer', 'Backend Engineer', 'Data Scientist')."),
  personalInfo: PersonalInfoSchema.describe("The user's personal information."),
  projects: z.array(ProjectSchema).describe("The user's projects."),
  experience: z.array(ExperienceSchema).describe("The user's work and education experience."),
  skills: z.array(SkillCategorySchema).describe("The user's technical skills, categorized."),
});
export type TailoredResumeInput = z.infer<typeof TailoredResumeInputSchema>;

// Output Schema for the AI flow
const TailoredResumeOutputSchema = z.object({
  resumeContent: z.string().describe('A full, tailored resume in Markdown format.'),
});
export type TailoredResumeOutput = z.infer<typeof TailoredResumeOutputSchema>;

export async function generateTailoredResume(input: TailoredResumeInput): Promise<TailoredResumeOutput> {
  return tailoredResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'tailoredResumePrompt',
  input: {schema: TailoredResumeInputSchema},
  output: {schema: TailoredResumeOutputSchema},
  prompt: `You are an expert resume writer, highly skilled at crafting comprehensive and targeted resumes.
Your task is to generate a full resume tailored for the job specialization: '{{{specialization}}}'.

Use all the provided information: Personal Information, Projects, Experience, and Skills.
Structure the resume professionally. Highlight skills, achievements, and experiences most relevant to the '{{{specialization}}}' role.
Emphasize quantifiable results where possible from the experience and projects.
The output must be a complete resume in Markdown format.

When generating the resume for the given specialization, intelligently select and emphasize the projects, experiences, and skills that are most relevant. For example, for a 'Frontend Developer' specialization, highlight frontend technologies, UI/UX aspects of projects, and relevant frontend experience. For a 'Data Scientist' specialization, focus on data analysis skills, relevant projects, and any statistical or machine learning experience.

The 'description' field for an experience item can be a single string or an array of strings (bullet points). Format it accordingly as a paragraph or bullet points under the respective experience.

Personal Information to use:
Name: {{personalInfo.name}}
Title: {{personalInfo.title}}
Contact: Email: {{personalInfo.contact.email}}, LinkedIn: {{personalInfo.contact.linkedin}}, GitHub: {{personalInfo.contact.github}}
Summary/Introduction to adapt: {{personalInfo.introduction}} Base summary to draw from: {{personalInfo.resumeSummary}}

Projects (select and highlight relevant ones):
{{#each projects}}
- Project: {{title}}
  Description: {{description}}
  Tech Stack: {{#each techStack}}{{name}}{{#unless @last}}, {{/unless}}{{/each}}
  {{#if githubUrl}}GitHub: {{githubUrl}}{{/if}}
  {{#if liveDemoUrl}}Live Demo: {{liveDemoUrl}}{{/if}}
{{/each}}

Experience (select and highlight relevant ones, format description appropriately):
{{#each experience}}
- {{title}} at {{institution}} ({{dateRange}}) - Type: {{type}}
  {{#if description}}
    {{#if description.length}}
        {{#each description}}
  - {{this}}
        {{/each}}
    {{else}}
  {{description}}
    {{/if}}
  {{/if}}
{{/each}}

Skills (select and highlight relevant ones):
{{#each skills}}
Category: {{name}}
  {{#each skills}}
  - {{name}} (Proficiency: {{level}}%)
  {{/each}}
{{/each}}

Generate the tailored resume below in Markdown format. Start with the person's name and contact information.
Include sections like: Summary, Skills, Projects, Experience, Education (if applicable from experience type).
Ensure the Markdown is well-formed.
`,
});

const tailoredResumeFlow = ai.defineFlow(
  {
    name: 'tailoredResumeFlow',
    inputSchema: TailoredResumeInputSchema,
    outputSchema: TailoredResumeOutputSchema,
  },
  async input => {
    // Potentially pre-process input here if Handlebars limitations are an issue.
    // For now, relying on LLM's ability to interpret the structure.
    const {output} = await prompt(input);
    return output!;
  }
);
