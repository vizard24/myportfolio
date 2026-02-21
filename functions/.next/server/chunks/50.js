"use strict";exports.id=50,exports.ids=[50],exports.modules={29360:(e,t,i)=>{i.d(t,{b:()=>s,e:()=>n});var r=i(68567);let s=r.z.object({resume:r.z.string().describe("The tailored resume content to analyze"),jobDescription:r.z.string().describe("The job description to compare against"),matchingScore:r.z.number().min(0).max(100).describe("Calculated matching score"),matchingSkills:r.z.array(r.z.string()).describe("Skills that match the job"),lackingSkills:r.z.array(r.z.string()).describe("Skills missing from the resume")}),a=r.z.object({category:r.z.enum(["Critical Gap","Wording Optimization","Impact & Metrics","Skills Positioning","Experience Framing","Psychological Edge"]).describe("Type of improvement suggestion"),priority:r.z.enum(["HIGH","MEDIUM","LOW"]).describe("Priority level"),title:r.z.string().describe("Short, punchy title"),criticism:r.z.string().describe("Harsh, direct criticism of what's wrong"),suggestion:r.z.string().describe("Specific, actionable improvement"),psychologicalTrigger:r.z.string().optional().describe("Subtle psychological influence text (implicit)"),estimatedImpact:r.z.number().min(1).max(10).describe("Expected impact score (1-10)")}),n=r.z.object({overallAssessment:r.z.object({verdict:r.z.string().describe("One brutal, honest sentence summary"),strengthLevel:r.z.enum(["World-Class","Strong","Average","Below Par","Red Flags"]),competitivePosition:r.z.string().describe("Where they stand vs. competition")}),criticalGaps:r.z.array(r.z.string()).describe("Top 3-5 critical gaps causing low score"),improvements:r.z.array(a).describe("Ordered by priority and impact"),psychologicalInsights:r.z.object({readabilityScore:r.z.number().min(0).max(100),authorityTone:r.z.number().min(0).max(100).describe("How authoritative the resume sounds"),valueProposition:r.z.string().describe("What unique value they bring"),subconsciousFlags:r.z.array(r.z.string()).describe("Red flags hiring managers subconsciously notice")}),kpiOptimization:r.z.object({metricsPresent:r.z.number().min(0).max(100).describe("% of achievements with metrics"),actionVerbStrength:r.z.number().min(0).max(100),industrySynergy:r.z.number().min(0).max(100).describe("Alignment with industry standards"),recommendations:r.z.array(r.z.string()).describe("Specific KPI improvements")})})},40050:(e,t,i)=>{i.a(e,async(e,r)=>{try{i.d(t,{rewriteResumeFlow:()=>u});var s=i(91199);i(42087);var a=i(95427),n=i(75240),o=i(33331),c=e([a]);let m=(a=(c.then?(await c)():c)[0]).ai.definePrompt({name:"rewriteResumePrompt",input:{schema:n.v},output:{schema:n.m},prompt:`You are an expert resume writer and career coach. Your task is to rewrite a candidate's resume to strictly address a specific critique and better align with a job description.

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
`}),u=a.ai.defineFlow({name:"rewriteResumeFlow",inputSchema:n.v,outputSchema:n.m},async e=>{let{output:t}=await m(e);if(!t)throw Error("AI failed to rewrite the resume.");return t});(0,o.D)([u]),(0,s.A)(u,"7fa90f43398047fb07774643acf81468aef880e7cc",null),r()}catch(e){r(e)}})},75240:(e,t,i)=>{i.d(t,{m:()=>n,v:()=>a});var r=i(68567),s=i(29360);let a=r.z.object({currentResume:r.z.string().describe("The current resume text."),jobDescription:r.z.string().describe("The job description to target."),critique:s.e.describe("The critique to address.")}),n=r.z.object({improvedResume:r.z.string().describe("The rewritten, improved resume text."),improvementsMade:r.z.array(r.z.string()).describe("List of specific improvements made based on the critique.")})}};