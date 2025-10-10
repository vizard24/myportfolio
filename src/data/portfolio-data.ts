
import type { LucideIcon } from 'lucide-react';
import { Briefcase, GraduationCap, GitMerge, Cpu, Database, Users, Palette, MessageSquare, Brain, Settings, Cloud, Rocket, CodeXml, TestTube2, Link, BarChartBig, FileText, PlayCircle, BookMarked, PenTool, Twitter, Instagram, Award, Building } from 'lucide-react';
import { type NetworkingContact } from '@/context/networking-context';


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
  id:string;
  type: 'work' | 'education';
  title: string;
  institution: string;
  dateRange: string;
  description: string | string[];
  iconName?: string;
};

export const experienceIcons: { [key: string]: LucideIcon } = {
  Briefcase,
  GraduationCap,
  Award,
  Building,
  CodeXml,
};

export const experienceIconNames = Object.keys(experienceIcons);


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

export const techIcons: { [key: string]: LucideIcon } = {
  CodeXml,
  Cpu,
  Database,
  Palette,
  GitMerge,
  Settings,
  Rocket,
  Cloud,
  TestTube2,
  Users,
  Brain,
  MessageSquare,
  BarChartBig,
};


export const personalInfo = {
  name: "Yaovi Gadedjro",
  title: "Innovative Full-Stack Developer",
  introduction: "A passionate and results-driven Full-Stack Developer with a knack for creating seamless and engaging user experiences. Eager to leverage modern technologies to build impactful solutions.",
  contact: {
    email: { url: "fgadedjro@gmail.com", visible: true },
    linkedin: { url: "https://www.linkedin.com/in/yaovigadedjro", visible: true },
    github: { url: "https://www.github.com/vizard24", visible: true },
    twitter: { url: "https://twitter.com/johndoe", visible: false },
    instagram: { url: "https://instagram.com/johndoe", visible: false },
    substack: { url: "https://johndoe.substack.com", visible: false },
    medium: { url: "https://medium.com/@johndoe", visible: false },
    discord: { url: "https://discord.com/users/johndoe", visible: false },
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
    imageUrl: 'https://picsum.photos/seed/proj1/600/400',
    imageHint: 'nature app',
    techStack: [
      { name: 'React', icon: techIcons.CodeXml },
      { name: 'Node.js', icon: techIcons.Cpu },
      { name: 'SQLite', icon: techIcons.Database },
      { name: 'TypeScript', icon: techIcons.CodeXml },
    ],
    githubUrl: 'https://github.com/vizard24/ecoleta',
    liveDemoUrl: 'https://ecoleta.example.com',
  },
  {
    id: 'project-2',
    title: 'DevFinances - Personal Finance Tracker',
    description: 'A simple application for tracking personal income and expenses. Helps users manage their finances effectively.',
    imageUrl: 'https://picsum.photos/seed/proj2/600/400',
    imageHint: 'finance app',
    techStack: [
      { name: 'HTML', icon: techIcons.CodeXml },
      { name: 'CSS', icon: techIcons.Palette },
      { name: 'JavaScript', icon: techIcons.CodeXml },
    ],
    githubUrl: 'https://github.com/vizard24/devfinances',
  },
  {
    id: 'project-3',
    title: 'AI Article Summarizer',
    description: 'An AI-powered tool that summarizes long articles into concise points using natural language processing.',
    imageUrl: 'https://picsum.photos/seed/proj3/600/400',
    imageHint: 'ai technology',
    techStack: [
      { name: 'Python', icon: techIcons.Cpu },
      { name: 'Flask', icon: techIcons.Cloud },
      { name: 'NLP', icon: techIcons.Brain },
      { name: 'React', icon: techIcons.CodeXml },
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
    iconName: 'Briefcase',
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
    iconName: 'Briefcase',
  },
  {
    id: 'edu-1',
    type: 'education',
    title: 'B.S. in Computer Science',
    institution: 'State University',
    dateRange: 'Aug 2014 - May 2018',
    description: 'Graduated with honors. Focus on software development and artificial intelligence. Capstone project: "Predictive Analytics for Retail".',
    iconName: 'GraduationCap',
  },
];

export const skillsData: SkillCategory[] = [
  {
    id: 'cat-frontend',
    name: 'Frontend Development',
    skills: [
      { id: 'skill-react', name: 'React', level: 90, icon: techIcons.CodeXml },
      { id: 'skill-nextjs', name: 'Next.js', level: 85, icon: techIcons.CodeXml },
      { id: 'skill-vue', name: 'Vue.js', level: 70, icon: techIcons.CodeXml },
      { id: 'skill-ts', name: 'TypeScript', level: 90, icon: techIcons.CodeXml },
      { id: 'skill-tailwind', name: 'Tailwind CSS', level: 80, icon: techIcons.Palette },
    ],
  },
  {
    id: 'cat-backend',
    name: 'Backend Development',
    skills: [
      { id: 'skill-nodejs', name: 'Node.js', level: 90, icon: techIcons.Cpu },
      { id: 'skill-express', name: 'Express.js', level: 85, icon: techIcons.GitMerge },
      { id: 'skill-python', name: 'Python', level: 80, icon: techIcons.Cpu },
      { id: 'skill-django', name: 'Django', level: 75, icon: techIcons.Settings },
    ],
  },
  {
    id: 'cat-databases',
    name: 'Databases',
    skills: [
      { id: 'skill-sql', name: 'SQL (PostgreSQL, MySQL)', level: 85, icon: techIcons.Database },
      { id: 'skill-mongo', name: 'MongoDB', level: 75, icon: techIcons.Database },
      { id: 'skill-redis', name: 'Redis', level: 70, icon: techIcons.Database },
    ],
  },
  {
    id: 'cat-devops',
    name: 'DevOps & Cloud',
    skills: [
      { id: 'skill-docker', name: 'Docker', level: 80, icon: techIcons.Rocket },
      { id: 'skill-k8s', name: 'Kubernetes', level: 65, icon: techIcons.Cloud },
      { id: 'skill-aws', name: 'AWS', level: 75, icon: techIcons.Cloud },
      { id: 'skill-gcp', name: 'Google Cloud', level: 70, icon: techIcons.Cloud },
      { id: 'skill-cicd', name: 'CI/CD (GitHub Actions)', level: 80, icon: techIcons.GitMerge },
    ],
  },
  {
    id: 'cat-others',
    name: 'Other Skills',
    skills: [
      { id: 'skill-git', name: 'Git & GitHub', level: 95, icon: techIcons.GitMerge },
      { id: 'skill-testing', name: 'Testing (Jest, Cypress)', level: 80, icon: techIcons.TestTube2 },
      { id: 'skill-agile', name: 'Agile Methodologies', level: 90, icon: techIcons.Users },
      { id: 'skill-comms', name: 'Communication', level: 90, icon: techIcons.MessageSquare },
      { id: 'skill-problem-solving', name: 'Problem Solving', level: 95, icon: techIcons.Brain },
      { id: 'skill-data-analysis', name: 'Data Analysis', level: 70, icon: techIcons.BarChartBig },
    ],
  },
];


export const networkingContactsData: NetworkingContact[] = [
    {
      id: 'net-1',
      name: 'Joe Abdul-Massih',
      linkedinUrl: '',
      companies: 'Bombardier',
      positions: 'Senior Legal Counsel - IT, IP, AI, Cybersecurity & Privacy',
      certifications: 'Cybersecurity Law, AI Governance, IT Transactions, Privacy Law, Strategic advisor, C-suite leadership, GDPR, SaaS negotiation',
      college: 'Université de Montréal, LL.B. 2013-2016',
      status: 'Not Contacted',
    },
    {
      id: 'net-2',
      name: 'Aya Barbach',
      linkedinUrl: '',
      companies: 'BCF',
      positions: 'Partner - Privacy, Data Protection & Cybersecurity',
      certifications: 'Privacy, Data Protection, Cybersecurity Law, Licensed lawyer, risk management, board experience',
      college: 'Université de Montréal, Master in IT Law, 2017-2019',
      status: 'Not Contacted',
    },
    {
      id: 'net-3',
      name: 'Mehdi M.',
      linkedinUrl: '',
      companies: 'Bell, HEC Montréal',
      positions: 'Cybersecurity Specialist, Technical Assistant',
      certifications: 'Vulnerability Management, ICT Security, Inclusive leadership, technical support, vulnerability audit',
      college: 'Université de Montréal, B.Sc. Computer Science, 2024',
      status: 'Not Contacted',
    },
    {
      id: 'net-4',
      name: 'Robert Szalay',
      linkedinUrl: '',
      companies: 'Hydro Quebec, iA Financial, Desjardins',
      positions: 'Cybersecurity Advisor, Analyst',
      certifications: 'Information Security Analysis, Internal Threats, Risk analysis, compliance, threat monitoring',
      college: 'Université de Montréal',
      status: 'Not Contacted',
    },
    {
      id: 'net-5',
      name: 'Normand Borduas',
      linkedinUrl: '',
      companies: 'Crowe BGK, Police Service',
      positions: 'Digital Forensics & Cybersecurity Lead',
      certifications: 'Digital Forensics, Security Consulting, Law Enforcement, Ethical hacking, lab management, criminalistics',
      college: 'Université de Montréal',
      status: 'Not Contacted',
    },
    {
      id: 'net-6',
      name: 'Antoine Guilmain',
      linkedinUrl: '',
      companies: 'Gowling WLG, Meta',
      positions: 'Partner & Co-Leader Cybersecurity & Data Protection, Legal Counsel, Professor',
      certifications: 'Data Privacy Law, Cybersecurity Law, Academic Leadership, GDPR/AIDA legal consultant, academic, privacy advocacy',
      college: 'Université de Montréal, Ph.D. Cyberjustice/IT, 2012-2018',
      status: 'Not Contacted',
    },
    {
      id: 'net-7',
      name: 'Marie-Christine Larocque',
      linkedinUrl: '',
      companies: 'CGI, Randstad',
      positions: 'Strategic Talent Acquisition Partner (Cybersecurity)',
      certifications: 'Cybersecurity Talent Acquisition, HR Leadership, Global recruitment strategy, exec sourcing, DEI initiatives',
      college: 'Université de Montréal, Bachelor, Industrial Relations, 2011',
      status: 'Not Contacted',
    },
    {
      id: 'net-8',
      name: 'Tatiana Safi',
      linkedinUrl: '',
      companies: 'IT',
      positions: 'Sr. Project Manager - CyberSecurity',
      certifications: 'Cybersecurity Project Management, IT Operations, Project delivery, team coordination, cross-functional IT',
      college: 'Université de Montréal',
      status: 'Not Contacted',
    },
    {
      id: 'net-9',
      name: 'Guillaume Pinat',
      linkedinUrl: '',
      companies: 'IT',
      positions: 'IT Infrastructure & Cybersecurity Graduate; System Admin/Network/Cloud',
      certifications: 'IT Systems, Infrastructure Security, Cloud & Networks, System admin, networking, cloud security',
      college: 'Université de Montréal',
      status: 'Not Contacted',
    },
];

    
