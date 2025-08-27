import type { LucideIcon } from 'lucide-react';
import { Briefcase, GraduationCap, GitMerge, Cpu, Database, Users, Palette, MessageSquare, Brain, Settings, Cloud, Rocket, CodeXml, TestTube2, Link, BarChartBig, FileText, PlayCircle, BookMarked, PenTool } from 'lucide-react';

export type Project = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageHint?: string;
  techStack: { name: string; icon?: LucideIcon }[];
  githubUrl?: string;
  liveDemoUrl?: string;
  caseStudyUrl?: string;
  videoDemoUrl?: string;
  apiDocsUrl?: string;
  designFilesUrl?: string;
};

export type Experience = {
  id: string;
  type: 'work' | 'education';
  title: string;
  institution: string;
  dateRange: string;
  description: string | string[];
  icon?: LucideIcon;
};

export type Skill = {
  id: string;
  name: string;
  level: number; // 0-100 for progress bar
  icon?: LucideIcon;
};

export type SkillCategory = {
  id: string;
  name: string;
  skills: Skill[];
}

export const personalInfo = {
  name: "Yaovi Gadedjro",
  title: "Innovative Full-Stack Developer",
  introduction: "A passionate and results-driven Full-Stack Developer with a knack for creating seamless and engaging user experiences. Eager to leverage modern technologies to build impactful solutions.",
  contact: {
    email: "fgadedjro@gmail.com",
    linkedin: "https://www.linkedin.com/in/yaovigadedjro", // Corrected URL
    github: "https://www.github.com/vizard24", // Corrected URL
  },
  profilePictureUrl: "https://picsum.photos/300/300",
  profilePictureHint: "professional portrait",
  resumeSummary: `Versatile Full-Stack Developer with 5+ years of experience in designing, developing, and deploying scalable web applications. Proficient in JavaScript, Python, React, Node.js, and cloud platforms like AWS. Proven ability to lead projects, collaborate with cross-functional teams, and deliver high-quality software solutions. Strong problem-solving skills and a passion for learning new technologies. Key achievements include reducing server costs by 20% through optimization and leading the development of a new e-commerce platform that increased sales by 15%.`
};

export const projectsData: Project[] = [
  {
    id: 'project-1',
    title: 'Ecoleta - Recycling Locator',
    description: 'A platform connecting waste collection points with people looking to recycle. Developed during Next Level Week by Rocketseat.',
    imageUrl: 'https://picsum.photos/600/400',
    imageHint: 'nature app',
    techStack: [
      { name: 'React', icon: CodeXml },
      { name: 'Node.js', icon: Cpu },
      { name: 'SQLite', icon: Database },
      { name: 'TypeScript', icon: CodeXml },
    ],
    githubUrl: 'https://github.com/alexjohnson/ecoleta',
    liveDemoUrl: 'https://ecoleta.example.com',
  },
  {
    id: 'project-2',
    title: 'DevFinances - Personal Finance Tracker',
    description: 'A simple application for tracking personal income and expenses. Helps users manage their finances effectively.',
    imageUrl: 'https://picsum.photos/600/401',
    imageHint: 'finance app',
    techStack: [
      { name: 'HTML', icon: CodeXml },
      { name: 'CSS', icon: Palette },
      { name: 'JavaScript', icon: CodeXml },
    ],
    githubUrl: 'https://github.com/alexjohnson/devfinances',
  },
  {
    id: 'project-3',
    title: 'AI Article Summarizer',
    description: 'An AI-powered tool that summarizes long articles into concise points using natural language processing.',
    imageUrl: 'https://picsum.photos/600/402',
    imageHint: 'ai technology',
    techStack: [
      { name: 'Python', icon: Cpu },
      { name: 'Flask', icon: Cloud },
      { name: 'NLP', icon: Brain },
      { name: 'React', icon: CodeXml },
    ],
    liveDemoUrl: 'https://aisummarizer.example.com',
  },
];

export const experienceData: Experience[] = [
  {
    id: 'exp-1',
    type: 'work',
    title: 'Senior Software Engineer',
    institution: 'Tech Solutions Inc.',
    dateRange: 'Jan 2021 - Present',
    description: [
      'Led a team of 5 developers in agile sprints to deliver new features for a SaaS product.',
      'Architected and implemented microservices leading to a 30% improvement in scalability.',
      'Mentored junior engineers and conducted code reviews.',
    ],
    icon: Briefcase,
  },
  {
    id: 'exp-2',
    type: 'work',
    title: 'Full-Stack Developer',
    institution: 'Web Wizards LLC',
    dateRange: 'Jun 2018 - Dec 2020',
    description: [
      'Developed and maintained client websites and web applications using React, Node.js, and PHP.',
      'Collaborated with designers to create responsive and user-friendly interfaces.',
      'Integrated third-party APIs for payment processing and social media.',
    ],
    icon: Briefcase,
  },
  {
    id: 'edu-1',
    type: 'education',
    title: 'B.S. in Computer Science',
    institution: 'State University',
    dateRange: 'Aug 2014 - May 2018',
    description: 'Graduated with honors. Focus on software development and artificial intelligence. Capstone project: "Predictive Analytics for Retail".',
    icon: GraduationCap,
  },
];

export const skillsData: SkillCategory[] = [
  {
    id: 'cat-frontend',
    name: 'Frontend Development',
    skills: [
      { id: 'skill-react', name: 'React', level: 90, icon: CodeXml },
      { id: 'skill-nextjs', name: 'Next.js', level: 85, icon: CodeXml },
      { id: 'skill-vue', name: 'Vue.js', level: 70, icon: CodeXml },
      { id: 'skill-ts', name: 'TypeScript', level: 90, icon: CodeXml },
      { id: 'skill-tailwind', name: 'Tailwind CSS', level: 80, icon: Palette },
    ],
  },
  {
    id: 'cat-backend',
    name: 'Backend Development',
    skills: [
      { id: 'skill-nodejs', name: 'Node.js', level: 90, icon: Cpu },
      { id: 'skill-express', name: 'Express.js', level: 85, icon: GitMerge },
      { id: 'skill-python', name: 'Python', level: 80, icon: Cpu },
      { id: 'skill-django', name: 'Django', level: 75, icon: Settings },
    ],
  },
  {
    id: 'cat-databases',
    name: 'Databases',
    skills: [
      { id: 'skill-sql', name: 'SQL (PostgreSQL, MySQL)', level: 85, icon: Database },
      { id: 'skill-mongo', name: 'MongoDB', level: 75, icon: Database },
      { id: 'skill-redis', name: 'Redis', level: 70, icon: Database },
    ],
  },
  {
    id: 'cat-devops',
    name: 'DevOps & Cloud',
    skills: [
      { id: 'skill-docker', name: 'Docker', level: 80, icon: Rocket },
      { id: 'skill-k8s', name: 'Kubernetes', level: 65, icon: Cloud },
      { id: 'skill-aws', name: 'AWS', level: 75, icon: Cloud },
      { id: 'skill-gcp', name: 'Google Cloud', level: 70, icon: Cloud },
      { id: 'skill-cicd', name: 'CI/CD (GitHub Actions)', level: 80, icon: GitMerge },
    ],
  },
  {
    id: 'cat-others',
    name: 'Other Skills',
    skills: [
      { id: 'skill-git', name: 'Git & GitHub', level: 95, icon: GitMerge },
      { id: 'skill-testing', name: 'Testing (Jest, Cypress)', level: 80, icon: TestTube2 },
      { id: 'skill-agile', name: 'Agile Methodologies', level: 90, icon: Users },
      { id: 'skill-comms', name: 'Communication', level: 90, icon: MessageSquare },
      { id: 'skill-problem-solving', name: 'Problem Solving', level: 95, icon: Brain },
      { id: 'skill-data-analysis', name: 'Data Analysis', level: 70, icon: BarChartBig },
    ],
  },
];

export const resumePitchSpecializations = [
  "Frontend Developer",
  "Backend Developer",
  "Full-Stack Developer",
];

export const staticResumesData: Record<string, string> = {
  "Frontend Developer": `
# ${personalInfo.name}
**Frontend Developer**
Contact: ${personalInfo.contact.email} | LinkedIn: ${personalInfo.contact.linkedin} | GitHub: ${personalInfo.contact.github}

## Summary
A passionate and results-driven Frontend Developer with a knack for creating seamless and engaging user experiences. Specializing in React, Next.js, and TypeScript.

## Skills
- **Frontend:** React, Next.js, Vue.js, TypeScript, Tailwind CSS
- **Tools:** Git, GitHub, Jest, Cypress

## Projects
- **Ecoleta - Recycling Locator:** A platform connecting waste collection points with people looking to recycle. (React, TypeScript)
- **DevFinances - Personal Finance Tracker:** A simple application for tracking personal income and expenses. (HTML, CSS, JavaScript)

## Experience
- **Senior Software Engineer at Tech Solutions Inc. (Jan 2021 - Present):**
  - Led a team of 5 developers in agile sprints.
  - Focused on the frontend architecture of a major SaaS product.
- **Full-Stack Developer at Web Wizards LLC (Jun 2018 - Dec 2020):**
  - Developed responsive and user-friendly interfaces using React.

## Education
- **B.S. in Computer Science from State University (2014 - 2018)**
  `,
  "Backend Developer": `
# ${personalInfo.name}
**Backend Developer**
Contact: ${personalInfo.contact.email} | LinkedIn: ${personalInfo.contact.linkedin} | GitHub: ${personalInfo.contact.github}

## Summary
Versatile Backend Developer with experience in designing, developing, and deploying scalable web applications. Proficient in Node.js, Python, and SQL/NoSQL databases.

## Skills
- **Backend:** Node.js, Express.js, Python, Django
- **Databases:** PostgreSQL, MySQL, MongoDB, Redis
- **DevOps:** Docker, AWS, CI/CD

## Projects
- **Ecoleta - Recycling Locator:** Developed the backend API for the platform. (Node.js, SQLite)
- **AI Article Summarizer:** Built the backend service for text summarization. (Python, Flask)

## Experience
- **Senior Software Engineer at Tech Solutions Inc. (Jan 2021 - Present):**
  - Architected and implemented microservices leading to a 30% improvement in scalability.
  - Optimized database queries, reducing response times.
- **Full-Stack Developer at Web Wizards LLC (Jun 2018 - Dec 2020):**
  - Maintained server-side logic and database schemas for client applications.

## Education
- **B.S. in Computer Science from State University (2014 - 2018)**
  `,
  "Full-Stack Developer": `
# ${personalInfo.name}
**Full-Stack Developer**
Contact: ${personalInfo.contact.email} | LinkedIn: ${personalInfo.contact.linkedin} | GitHub: ${personalInfo.contact.github}

## Summary
${personalInfo.resumeSummary}

## Skills
- **Frontend:** React, Next.js, TypeScript
- **Backend:** Node.js, Python, Express.js
- **Databases:** PostgreSQL, MongoDB
- **DevOps & Cloud:** Docker, AWS, CI/CD, GitHub Actions

## Projects
- **Ecoleta - Recycling Locator:** Full-stack development of the platform connecting users to recycling centers. (React, Node.js, SQLite)
- **AI Article Summarizer:** Created a full-stack application for summarizing articles. (React, Python, Flask)

## Experience
- **Senior Software Engineer at Tech Solutions Inc. (Jan 2021 - Present):**
  - Led a team of 5 developers in agile sprints to deliver new features for a SaaS product.
  - Architected and implemented microservices leading to a 30% improvement in scalability.
- **Full-Stack Developer at Web Wizards LLC (Jun 2018 - Dec 2020):**
  - Developed and maintained client websites and web applications using React, Node.js, and PHP.

## Education
- **B.S. in Computer Science from State University (2014 - 2018)**
`
};

    