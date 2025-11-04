'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Schema for formatted document structure
const FormattedDocumentSchema = z.object({
  name: z.string().optional(),
  contact: z.object({
    email: z.string().optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    linkedin: z.string().optional(),
  }).optional(),
  sections: z.array(z.object({
    title: z.string(),
    type: z.enum(['header', 'summary', 'experience', 'education', 'skills', 'projects', 'other']),
    content: z.array(z.object({
      type: z.enum(['paragraph', 'bullet', 'job-title', 'company', 'date', 'skill-category']),
      text: z.string(),
      emphasis: z.enum(['normal', 'bold', 'italic']).optional(),
    })),
  })),
});

export type FormattedDocument = z.infer<typeof FormattedDocumentSchema>;

export async function formatDocumentFlow(content: string, documentType: 'resume' | 'cover-letter'): Promise<FormattedDocument> {
    const prompt = documentType === 'resume' 
      ? `You are a professional resume formatter. Analyze the following resume content and structure it into a well-organized, professional format.

INSTRUCTIONS:
1. Extract the person's name (usually the first line or prominently displayed)
2. Extract contact information (email, phone, location, LinkedIn)
3. Organize content into logical sections with these types:
   - "summary" for professional summaries or objectives
   - "experience" for work experience
   - "education" for educational background
   - "skills" for technical and soft skills
   - "projects" for personal or professional projects
   - "other" for additional sections

4. For each content item, identify the type:
   - "job-title" for position names
   - "company" for employer names
   - "date" for time periods (e.g., "May 2020 - Present")
   - "bullet" for achievement points or responsibilities
   - "skill-category" for skill groupings
   - "paragraph" for general text

5. Apply emphasis:
   - "bold" for important items like job titles, company names
   - "italic" for secondary information
   - "normal" for regular text

EXAMPLE OUTPUT FORMAT:
{
  "name": "John Doe",
  "contact": {
    "email": "john@email.com",
    "phone": "+1-555-0123",
    "location": "New York, NY",
    "linkedin": "linkedin.com/in/johndoe"
  },
  "sections": [
    {
      "title": "Professional Summary",
      "type": "summary",
      "content": [
        {
          "type": "paragraph",
          "text": "Experienced software developer...",
          "emphasis": "normal"
        }
      ]
    },
    {
      "title": "Experience",
      "type": "experience",
      "content": [
        {
          "type": "job-title",
          "text": "Senior Software Engineer",
          "emphasis": "bold"
        },
        {
          "type": "company",
          "text": "Tech Company Inc.",
          "emphasis": "italic"
        },
        {
          "type": "date",
          "text": "Jan 2020 - Present"
        },
        {
          "type": "bullet",
          "text": "Led development of microservices architecture"
        }
      ]
    }
  ]
}

Resume Content:
${content}

Return ONLY the JSON object, no additional text.`
      : `You are a professional cover letter formatter. Analyze the following cover letter content and structure it into a well-organized, professional format.

INSTRUCTIONS:
1. Extract contact information if present at the top
2. Structure into proper cover letter sections:
   - Header with contact info
   - Salutation (Dear Hiring Manager, etc.)
   - Opening paragraph
   - Body paragraphs (experience, skills, achievements)
   - Closing paragraph
   - Sign-off

3. For each content item, identify the type:
   - "paragraph" for main content blocks
   - "bullet" if there are any bullet points
   - Use "bold" emphasis for important statements
   - Use "italic" for company names or positions mentioned

EXAMPLE OUTPUT FORMAT:
{
  "name": "John Doe",
  "contact": {
    "email": "john@email.com",
    "phone": "+1-555-0123"
  },
  "sections": [
    {
      "title": "Cover Letter",
      "type": "other",
      "content": [
        {
          "type": "paragraph",
          "text": "Dear Hiring Manager,",
          "emphasis": "bold"
        },
        {
          "type": "paragraph",
          "text": "I am writing to express my interest...",
          "emphasis": "normal"
        }
      ]
    }
  ]
}

Cover Letter Content:
${content}

Return ONLY the JSON object, no additional text.`;

    const result = await ai.generate({
      model: 'gemini-2.0-flash-exp',
      prompt,
      config: {
        temperature: 0.3,
        maxOutputTokens: 2000,
      },
    });

    try {
      const parsedResult = JSON.parse(result.text);
      return FormattedDocumentSchema.parse(parsedResult);
    } catch (error) {
      console.error('Failed to parse AI formatting result:', error);
      // Fallback: return basic structure
      return {
        sections: [
          {
            title: documentType === 'resume' ? 'Resume' : 'Cover Letter',
            type: 'other' as const,
            content: content.split('\n').filter((line: string) => line.trim()).map((line: string) => ({
              type: 'paragraph' as const,
              text: line.trim(),
            })),
          },
        ],
      };
    }
}

// Helper function to format document
export async function formatDocument(content: string, documentType: 'resume' | 'cover-letter'): Promise<FormattedDocument> {
  return await formatDocumentFlow(content, documentType);
}