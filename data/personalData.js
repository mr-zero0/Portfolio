/* =====================================================================
   PORTFOLIO PERSONAL DATA
   Content taken verbatim from résumé and external profiles.
   Keep personal details isolated here for clean modularity.
   ===================================================================== */

const AVATAR = 'assets/avatar.png';
const AVATAR_FALLBACK = 'https://avatars.githubusercontent.com/u/31819454?s=400&v=4';

const PROFILE = {
  name: 'Mohd Aman',
  title: 'Forward Deployed Engineer',
  company: 'HCLTech',
  location: 'Meerut, Uttar Pradesh, India',
  email: 'amanczn@gmail.com',
  phone: '+91-8755428254',
  linkedin: 'https://linkedin.com/in/mrzero0',
  github: 'https://github.com/mr-zero0',
  hackerearth: 'https://www.hackerearth.com/@mr.zero',
  resume: 'assets/Mohd_Aman_AI_FDE_Resume.pdf',
  summary: 'Forward Deployed Engineer with 5 years of software engineering experience, including 2+ years of direct client-facing work delivering GenAI and agentic AI solutions for enterprise banking workflows. Work directly with client stakeholders across multiple teams to understand business problems, clarify requirements, determine suitable AI approaches, demonstrate solutions, handle feedback, troubleshoot issues with engineering teams, and iteratively refine solutions through human-in-the-loop review. Hands-on experience designing and implementing Python tools and connectors for Jira, Confluence, GitHub, and Bitbucket within HCLTech AIForce, supported by a strong software engineering background in C#, .NET, and telecom systems.'
};

const SKILLS = [
  { label: 'AI & GenAI', icon: 'sparkles', color: '#856ED9',
    items: ['LLMs','RAG','Prompt Engineering','Agentic AI','Multi-Agent Systems','Tool Calling','Context Orchestration','Evaluation','LLM-as-a-Judge','Human-in-the-Loop'] },
  { label: 'Engineering', icon: 'code', color: '#3E9858',
    items: ['Python','C#','.NET','Git','Docker'] },
  { label: 'Enterprise Integrations', icon: 'plug', color: '#C19433',
    items: ['Jira','Confluence','GitHub','Bitbucket'] },
  { label: 'Data', icon: 'database', color: '#329696',
    items: ['Vector Databases'] },
  { label: 'Certifications', icon: 'award', color: '#B95F9D',
    items: ['AWS Partner: Agentic AI Essentials','Mastering Generative AI and ChatGPT'] }
];

const EXPERIENCE = [
  {
    company: 'HCLTech', location: 'Noida, India', logo: 'HCL', color: '#1e40af',
    title: 'Platform Engineer I | Forward Deployed Engineer', dates: 'Jan 2022 – Present',
    engagements: [
      {
        name: 'Deutsche Bank', sub: 'Banking – Compliance', dates: 'Jul 2024 – Present', open: true,
        impact: ['~70% generated-output accuracy','~40% operational-efficiency improvement','~20% reduction in SDLC cycle time'],
        bullets: [
          'Work directly with client stakeholders on a daily basis across approximately 6–7 cross-functional teams to understand business problems, clarify requirements, identify opportunities for AI adoption, and align solutions with client workflows.',
          'Participate significantly in client problem discovery and independently determine appropriate solution approaches using available AIForce capabilities, while consulting with the engineering team for technical alignment.',
          'Utilize RAG, agentic and multi-agent workflows, prompt engineering, tool calling, context orchestration, evaluation, and human-in-the-loop review to develop AI-enabled solutions for client use cases.',
          'Design and implement approximately 7–8 Python tools/connectors integrating AIForce with Jira, Confluence, GitHub, and Bitbucket to enable interaction with external enterprise systems.',
          'Develop both reusable/general-purpose tools used across multiple workflows and use-case-specific tools based on client requirements.',
          'Deliver and iterate AI-driven SDLC workflows spanning requirements, prototypes, epics, user stories, test cases, code generation, and change-impact analysis.',
          'Regularly demonstrate working solutions to client teams, collect feedback, handle follow-up questions, investigate issues collaboratively with engineering teams, and regenerate or refine solutions based on client feedback.',
          'Participate in comparative evaluation of AI-generated outputs against other AI tools and use client feedback to iteratively improve solution quality and workflow effectiveness.',
          'Contributed to measurable client-solution outcomes of approximately 70% generated-output accuracy, 40% operational-efficiency improvement, and 20% reduction in SDLC cycle time.'
        ]
      },
      {
        name: 'Deutsche Bank', sub: 'AI-assisted Legacy Migration', dates: 'Jul 2024 – Jun 2025',
        impact: ['~40% reduction in manual effort'],
        bullets: [
          'Worked on migration of a C# MVC application to Java and React using AI-assisted workflows, contributing to both reverse engineering and code-generation activities.',
          'Reverse engineered the existing codebase and used the resulting understanding to support generation of requirements and subsequent migration artifacts.',
          'Applied the workflow to an actual project requirement spanning requirements, prototype, epics, stories, test cases, and code, with client teams reviewing and validating outputs at multiple stages.',
          'Client teams compared generated outputs with other AI tools and provided feedback that was incorporated through repeated regeneration and refinement of the workflow.',
          'Generated Java and React code was used directly as part of the client migration after customization and issue resolution by developers from the actual application team.',
          'Achieved approximately 40% reduction in manual effort for the evaluated end-to-end requirement workflow.'
        ]
      },
      {
        name: 'Keysight Technologies', sub: 'Telecom – LTE & 5G', dates: 'Sep 2022 – Jul 2024',
        bullets: [
          'Developed a C# Windows application for the Protocol Research and Development Tool (PRT), used to simulate LTE and 5G NR scripts.',
          'Worked across GUI, driver, and interface components of the application, contributing to development and maintenance of client software.',
          'Enhanced application performance and reliability through object-oriented design and optimization.',
          'Worked on network communication based on the LTE and 5G NR protocol stacks, gaining experience with telecom protocol behavior and communication systems.',
          'Worked on internal proof-of-concept projects using Python and Go, while having limited client interaction compared with the current Deutsche Bank engagement.'
        ]
      }
    ]
  },
  {
    company: 'TT Consultants', logo: 'TT', color: '#6d28d9',
    title: 'Patent Research Analyst', dates: 'Aug 2020 – Dec 2020',
    bullets: [
      'Contributed to patentability research projects involving technical subject-matter analysis and prior-art search activities.',
      'Developed structured search techniques to identify relevant patent literature and technical information for research assignments.',
      'Gained practical experience working with intellectual-property databases, including Derwent, and developed familiarity with patent research and patentability analysis workflows.'
    ]
  },
  {
    company: 'Signify Innovations', logo: 'S', color: '#0e7490',
    title: 'Intern', dates: 'May 2019 – Jul 2019',
    bullets: [
      'Worked on solar R&D projects involving power supplies, ammeters, voltmeters, and battery simulators, gaining practical experience with electrical measurement and testing equipment.',
      'Programmed microcontrollers for efficient power regulation as part of the Philips AIO Hybrid Sun Stay project.',
      'Supported experimentation and testing activities related to power-management components and embedded control requirements.'
    ]
  }
];

const EDUCATION = {
  degree: 'Bachelor of Technology in Electronics and Communications',
  school: 'Indian Institute of Information Technology, Una, Himachal Pradesh',
  year: 'Graduated 2020'
};

const PROJECTS = [
  {
    title: 'ArChess', kind: 'Game · Physics engine', tech: ['Python','Flask','SQLite'],
    gradient: 'linear-gradient(135deg,#0f172a 0%,#1d4ed8 100%)', glyph: '♞', status: 'Active development',
    github: 'https://github.com/mr-zero0/ArChess',
    summary: 'A physics-driven chess variant where pieces are aimed, launched, collide and take damage — with auth, match persistence and leaderboards.',
    bullets: [
      'Personally designed and developed a functional physics-driven chess variant that is currently under active development, covering the application architecture, backend APIs, data layer, gameplay mechanics, authentication, match persistence, and leaderboard functionality.',
      'Implemented a browser-based physics and collision system in which chess pieces can be aimed, launched, collide, rebound from board boundaries, and inflict damage based on physical interaction.',
      'Built structured application logging with request and correlation IDs, telemetry capture, and automated log-retention and cleanup mechanisms.',
      'Maintained engineering documentation covering system architecture, API contracts, database design, physics and collision mechanics, logging conventions, and implementation decisions.',
      'Organized the application into dedicated backend, frontend/static, templates, data, documentation, and logging components with automated test and coverage tooling.'
    ]
  },
  {
    title: 'Health Monitoring Alert System', kind: 'Monitoring · Alerting', tech: ['Python'],
    gradient: 'linear-gradient(135deg,#9f1239 0%,#f97316 100%)', icon: 'heart',
    github: 'https://github.com/mr-zero0/Health-Tracking-System',
    summary: 'Continuously monitors heart rate, blood pressure and SpO2 from CSV input, detects anomalies and escalates alerts to family and emergency services.',
    bullets: [
      'Developed a personal Python system that continuously monitors health parameters such as heart rate, blood pressure, and SpO2 from CSV-based data input.',
      'Implemented threshold-based anomaly detection and automated alert notifications to family members, hospitals, and police stations when critical conditions are detected.',
      'Implemented escalation behavior in which repeated alerts are issued when no response is received, followed by escalation to family and emergency services.',
      'Added unit tests to validate monitoring and alerting behavior across different scenarios.'
    ]
  },
  {
    title: 'Hidden Queen Chess', kind: 'Game · Web app', tech: ['C#','ASP.NET'],
    gradient: 'linear-gradient(135deg,#4c1d95 0%,#a21caf 100%)', glyph: '♛',
    github: 'https://github.com/mr-zero0/HiddenQueenChess',
    summary: 'A web-based chess variant where one pawn is secretly a queen — adding a hidden-information layer to classic chess.',
    bullets: [
      'Designed and developed a personal web-based chess variant in which one pawn is secretly assigned as a hidden queen, introducing an additional strategic mechanic to conventional chess.',
      'Built the responsive frontend using HTML, CSS, and Bootstrap and implemented backend game logic and hidden-queen mechanics using ASP.NET and C#.'
    ]
  },
  {
    title: 'Content Delivery Network', kind: 'Distributed systems', tech: ['Go','Distributed Systems'],
    gradient: 'linear-gradient(135deg,#064e3b 0%,#0d9488 100%)', icon: 'network',
    github: 'https://github.com/mr-zero0/Content-Delivery-Network',
    summary: 'A lightweight CDN with an Origin – Mid – Edge topology, exploring caching, invalidation, expiry, eviction and observability.',
    bullets: [
      'Built a lightweight CDN as a learning project with an Origin – Mid – Edge topology to understand hierarchical content delivery and caching behavior.',
      'Implemented client-server communication and explored cache retrieval, cache invalidation, content expiration, and cache eviction scenarios.',
      'Worked with observability and cache metrics covering request counts, bytes transferred, response times, time-to-first-byte, storage usage, and cached-content statistics.'
    ]
  }
];

const FUN = [
  { em: '♟️', title: 'Chess', text: 'Passionate about playing chess.' },
  { em: '🏏', title: 'Cricket', text: 'Enjoy watching cricket.' }
];

const QUICK = [
  { key: 'me',         label: 'Me',         icon: 'laugh',      color: '#329696', q: 'Who are you? I want to know more about you.' },
  { key: 'experience', label: 'Experience', icon: 'briefcase',  color: '#3E9858', q: 'Walk me through your work experience.' },
  { key: 'projects',   label: 'Projects',   icon: 'code',       color: '#E07B39', q: 'What projects have you built?' },
  { key: 'skills',     label: 'Skills',     icon: 'layers',     color: '#856ED9', q: 'What are your skills?' },
  { key: 'fun',        label: 'Fun',        icon: 'party',      color: '#B95F9D', q: 'What do you do for fun?' },
  { key: 'contact',    label: 'Contact',    icon: 'usersearch', color: '#C19433', q: 'How can I reach you?' }
];

// Global attachment for modular interop
if (typeof window !== 'undefined') {
  window.AVATAR = AVATAR;
  window.AVATAR_FALLBACK = AVATAR_FALLBACK;
  window.PROFILE = PROFILE;
  window.SKILLS = SKILLS;
  window.EXPERIENCE = EXPERIENCE;
  window.EDUCATION = EDUCATION;
  window.PROJECTS = PROJECTS;
  window.FUN = FUN;
  window.QUICK = QUICK;
  window.PERSONAL_DATA = {
    AVATAR,
    AVATAR_FALLBACK,
    PROFILE,
    SKILLS,
    EXPERIENCE,
    EDUCATION,
    PROJECTS,
    FUN,
    QUICK
  };
}
