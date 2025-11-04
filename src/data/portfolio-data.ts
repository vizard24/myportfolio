
import type { LucideIcon } from 'lucide-react';
import { Briefcase, GraduationCap, GitMerge, Cpu, Database, Users, Palette, MessageSquare, Brain, Settings, Cloud, Rocket, CodeXml, TestTube2, Link, BarChartBig, FileText, PlayCircle, BookMarked, PenTool, Twitter, Instagram, Award, Building } from 'lucide-react';
import { type NetworkingContact } from '@/context/networking-context';


export type Project = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imageHint?: string;
  techStack: { name: string; iconName?: keyof typeof techIcons }[];
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
  description: string[];
  iconName?: string;
};

export type ResumeSummary = {
  id: string;
  title: string;
  content: string;
};

export type ContactLink = {
  url: string;
  visible: boolean;
}

export type PersonalInfo = {
  name: string;
  title: string;
  introduction: string;
  contact: {
    email: ContactLink;
    linkedin: ContactLink;
    github: ContactLink;
    twitter: ContactLink;
    instagram: ContactLink;
    substack: ContactLink;
    medium: ContactLink;
    discord: ContactLink;
  };
  profilePictureUrl: string;
  profilePictureHint: string;
  resumeSummaries: ResumeSummary[];
}


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
  iconName?: keyof typeof techIcons;
};

export type SkillCategory = {
  id: string;
  name: string;
  skills: Skill[];
}

export const techIcons: { [key: string]: LucideIcon } = {
  React: CodeXml,
  NextJS: CodeXml,
  VueJS: CodeXml,
  TypeScript: CodeXml,
  TailwindCSS: Palette,
  NodeJS: Cpu,
  ExpressJS: GitMerge,
  Python: Cpu,
  Django: Settings,
  SQL: Database,
  MongoDB: Database,
  Redis: Database,
  Docker: Rocket,
  Kubernetes: Cloud,
  AWS: Cloud,
  GCP: Cloud,
  CICD: GitMerge,
  Git: GitMerge,
  Testing: TestTube2,
  Agile: Users,
  Communication: MessageSquare,
  ProblemSolving: Brain,
  DataAnalysis: BarChartBig,
  Default: CodeXml,
};


export const personalInfo: PersonalInfo = {
  name: "Yaovi Gadedjro",
  title: "Full-Stack Developer",
  introduction: "Welcome to my portfolio. Please customize this introduction in admin mode.",
  contact: {
    email: { url: "fgadedjro@gmail.com", visible: true },
    linkedin: { url: "", visible: false },
    github: { url: "", visible: false },
    twitter: { url: "", visible: false },
    instagram: { url: "", visible: false },
    substack: { url: "", visible: false },
    medium: { url: "", visible: false },
    discord: { url: "", visible: false },
  },
  profilePictureUrl: "",
  profilePictureHint: "Add your professional photo",
  resumeSummaries: [],
};

export const projectsData: Project[] = [];

export const experienceData: Experience[] = [];

export const skillsData: SkillCategory[] = [];


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
