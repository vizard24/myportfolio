"use strict";exports.id=140,exports.ids=[140],exports.modules={29360:(e,i,t)=>{t.d(i,{b:()=>r,e:()=>c});var s=t(68567);let r=s.z.object({resume:s.z.string().describe("The tailored resume content to analyze"),jobDescription:s.z.string().describe("The job description to compare against"),matchingScore:s.z.number().min(0).max(100).describe("Calculated matching score"),matchingSkills:s.z.array(s.z.string()).describe("Skills that match the job"),lackingSkills:s.z.array(s.z.string()).describe("Skills missing from the resume")}),a=s.z.object({category:s.z.enum(["Critical Gap","Wording Optimization","Impact & Metrics","Skills Positioning","Experience Framing","Psychological Edge"]).describe("Type of improvement suggestion"),priority:s.z.enum(["HIGH","MEDIUM","LOW"]).describe("Priority level"),title:s.z.string().describe("Short, punchy title"),criticism:s.z.string().describe("Harsh, direct criticism of what's wrong"),suggestion:s.z.string().describe("Specific, actionable improvement"),psychologicalTrigger:s.z.string().optional().describe("Subtle psychological influence text (implicit)"),estimatedImpact:s.z.number().min(1).max(10).describe("Expected impact score (1-10)")}),c=s.z.object({overallAssessment:s.z.object({verdict:s.z.string().describe("One brutal, honest sentence summary"),strengthLevel:s.z.enum(["World-Class","Strong","Average","Below Par","Red Flags"]),competitivePosition:s.z.string().describe("Where they stand vs. competition")}),criticalGaps:s.z.array(s.z.string()).describe("Top 3-5 critical gaps causing low score"),improvements:s.z.array(a).describe("Ordered by priority and impact"),psychologicalInsights:s.z.object({readabilityScore:s.z.number().min(0).max(100),authorityTone:s.z.number().min(0).max(100).describe("How authoritative the resume sounds"),valueProposition:s.z.string().describe("What unique value they bring"),subconsciousFlags:s.z.array(s.z.string()).describe("Red flags hiring managers subconsciously notice")}),kpiOptimization:s.z.object({metricsPresent:s.z.number().min(0).max(100).describe("% of achievements with metrics"),actionVerbStrength:s.z.number().min(0).max(100),industrySynergy:s.z.number().min(0).max(100).describe("Alignment with industry standards"),recommendations:s.z.array(s.z.string()).describe("Specific KPI improvements")})})},72140:(e,i,t)=>{t.a(e,async(e,s)=>{try{t.d(i,{critiqueTailoredResume:()=>l});var r=t(91199);t(42087);var a=t(95427),c=t(29360),n=t(33331),o=e([a]);let m=(a=(o.then?(await o)():o)[0]).ai.definePrompt({name:"resumeCritiquePrompt",input:{schema:c.b},output:{schema:c.e},prompt:`You are a world-class executive recruiter and organizational psychologist with 20+ years evaluating C-suite resumes. You have an uncanny ability to detect both explicit gaps and subtle psychological red flags that cause immediate rejection.

**Your Mission:** Provide BRUTAL, HONEST, and DEEPLY ACTIONABLE feedback on this candidate's resume against the job description. Be harsh but constructive. Focus on psychological impact, KPI optimization, and subconscious triggers that hiring managers notice.

**RULES:**
1. **Be Harsh**: Don't sugarcoat. If something sucks, say it directly.
2. **Action-Oriented**: Every criticism must have a specific, measurable fix.
3. **Psychological Depth**: Analyze tone, authority, readability, and subconscious red flags.
4. **KPI-Driven**: Push for metrics, numbers, and quantifiable achievements.
5. **Prioritize**: Focus on high-impact changes that move the needle.
6. **Industry Context**: Consider what THIS specific role demands psychologically.

**ANALYSIS FRAMEWORK:**
- **Strength Level**: Where does this resume rank? World-Class / Strong / Average / Below Par / Red Flags
- **Critical Gaps**: What are the TOP 3-5 dealbreakers causing the low match score?
- **Improvements**: Categorize by: Critical Gap, Wording, Impact/Metrics, Skills, Experience Framing, Psychological Edge
- **Psychological Insights**:
  * Readability: Does it scan in 6 seconds? (0-100%)
  * Authority Tone: Do they sound like an expert or a junior? (0-100%)
  * Value Proposition: What unique value do they bring? (Be specific)
  * Subconscious Flags: What subtle things make a recruiter hesitate? (passive voice, vague claims, lack of confidence)
- **KPI Optimization**:
  * Metrics Present: % of achievements with numbers
  * Action Verb Strength: Are verbs impactful? (Led, Architected, Drove) vs weak (Helped, Assisted)
  * Industry Synergy: Does the language match the industry's standards?

**CURRENT MATCH CONTEXT:**
- Match Score: {{matchingScore}}%
- Matching Skills: {{#each matchingSkills}}{{this}}, {{/each}}
- Missing Skills: {{#each lackingSkills}}{{this}}, {{/each}}

**JOB DESCRIPTION:**
---
{{jobDescription}}
---

**TAILORED RESUME:**
---
{{resume}}
---

**OUTPUT FORMAT:**
Provide structured, prioritized feedback in JSON. Focus on HIGH-impact changes first. Be specific: "Change X to Y because Z." Use psychological triggers subtly (don't explicitly mention them to the user, but embed language that subconsciously improves their framing).

Deliver world-class executive-level critique.
`}),u=a.ai.defineFlow({name:"resumeCritiqueFlow",inputSchema:c.b,outputSchema:c.e},async e=>{let{output:i}=await m(e);if(!i)throw Error("AI failed to generate resume critique.");return i});async function l(e){return u(e)}(0,n.D)([l]),(0,r.A)(l,"40f19d3c14c1d275f6e8d5494ae0895ec9a5bf00ef",null),s()}catch(e){s(e)}})}};