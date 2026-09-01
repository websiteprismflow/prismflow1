import { Inquiry, PortfolioProject, Testimonial, LegalDocument, ServiceItem } from '../types';

export const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'intelligent-websites',
    title: 'Intelligent Websites',
    shortDesc: 'Modern websites designed around business goals, conversions, dynamic interactivity, and intelligent functionality.',
    details: [
      'High-conversion dynamic UX architectures',
      'Ultra-fast Next.js & React performance',
      'Subtle micro-animations & spatial glassmorphism',
      'Custom interactive brand mascots & 3D/vector interactions'
    ],
    iconName: 'Globe',
    badge: 'Core Foundation'
  },
  {
    id: 'ai-agents',
    title: 'AI Agents',
    shortDesc: 'Autonomous AI agents that understand context, qualify high-intent leads, assist customers 24/7, and perform operations.',
    details: [
      'Natural language voice & chat interfaces',
      'Autonomous CRM & lead qualification bots',
      'Multi-modal document & media processing',
      'Deep domain-specific knowledge embedding'
    ],
    iconName: 'Bot',
    badge: 'Next-Gen AI'
  },

  {
    id: 'saas-applications',
    title: 'SaaS Applications',
    shortDesc: 'Custom enterprise-grade SaaS products crafted to solve specific business problems and scale effortlessly.',
    details: [
      'Scalable multi-tenant cloud architecture',
      'Interactive real-time analytics & dashboards',
      'Role-based granular security & access control',
      'Stripe & enterprise billing integrations'
    ],
    iconName: 'Layers',
    badge: 'Full-Stack Software'
  },
  {
    id: 'ecommerce-automation',
    title: 'E-Commerce & Automation',
    shortDesc: 'Frictionless e-commerce experiences and automated back-office systems that eliminate manual overhead.',
    details: [
      'AI-driven personalized product discovery',
      'Automated inventory & fulfillment sync',
      'Omnichannel order routing pipelines',
      'High-speed checkout conversion funnels'
    ],
    iconName: 'Sparkles',
    badge: 'High Performance'
  }
];

export const INITIAL_PROJECTS: PortfolioProject[] = [
  {
    id: 'proj-1',
    title: 'Nexus Intelligence Core',
    category: 'AI Agents',
    description: 'Autonomous financial intelligence agent that conducts real-time market anomaly detection, synthesizes SEC filings, and drafts executive summaries.',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-technology-digital-grid-loop-41551-large.mp4',
    websiteUrl: 'https://nexus-intel.example.com',
    technologies: ['React 18', 'Python FastAPI', 'Vector DB', 'LangGraph', 'Tailwind CSS'],
    featured: true,
    published: true,
    stats: [
      { label: 'Latency', value: '<180ms' },
      { label: 'Time Saved', value: '78%' }
    ]
  },
  {
    id: 'proj-2',
    title: 'Aura Spatial Systems',
    category: 'Websites',
    description: 'Bespoke architectural website with real-time dynamic lighting, interactive 3D spatial models, and ultra-high fidelity conversions.',
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-charts-and-data-31912-large.mp4',
    websiteUrl: 'https://aura-spatial.example.com',
    technologies: ['Next.js', 'Three.js', 'WebGL', 'Tailwind CSS', 'Framer Motion'],
    featured: true,
    published: true,
    stats: [
      { label: 'Conversion', value: '+142%' },
      { label: 'Avg Session', value: '4m 12s' }
    ]
  },
  {
    id: 'proj-3',
    title: 'Vortex Flow Automation',
    category: 'Agentic Systems',
    description: 'Multi-agent orchestration platform integrating ERP, supply chain tracking, and supplier auto-negotiation agents across 14 countries.',
    imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-circuit-board-with-glowing-lines-41553-large.mp4',
    websiteUrl: 'https://vortexflow.example.com',
    technologies: ['TypeScript', 'Node.js', 'PostgreSQL', 'Temporal.io', 'Docker'],
    featured: true,
    published: true,
    stats: [
      { label: 'Tasks Automated', value: '1.2M/mo' },
      { label: 'Error Rate', value: '0.001%' }
    ]
  },
  {
    id: 'proj-4',
    title: 'OmniCloud Data Fabric',
    category: 'SaaS',
    description: 'Enterprise data orchestration SaaS offering automated data pipeline synthesis, schema discovery, and real-time streaming queries.',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-glowing-lines-in-a-futuristic-circuit-network-41552-large.mp4',
    websiteUrl: 'https://omnicloud.example.com',
    technologies: ['React', 'Go', 'ClickHouse', 'Tailwind CSS', 'WebSockets'],
    featured: false,
    published: true,
    stats: [
      { label: 'Queries/sec', value: '85,000' },
      { label: 'Uptime', value: '99.999%' }
    ]
  },
  {
    id: 'proj-5',
    title: 'HyperCart AI Storefront',
    category: 'E-Commerce',
    description: 'Next-generation luxury commerce engine featuring conversational styling agents, instant sub-50ms checkout, and smart inventory balancing.',
    imageUrl: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-smartphone-with-a-shopping-cart-icon-41548-large.mp4',
    websiteUrl: 'https://hypercart.example.com',
    technologies: ['Next.js App Router', 'Stripe Elements', 'Redis', 'Algolia AI', 'Tailwind'],
    featured: true,
    published: true,
    stats: [
      { label: 'AOV Increase', value: '+34%' },
      { label: 'Cart Abandonment', value: '-28%' }
    ]
  },
  {
    id: 'proj-6',
    title: 'Synapse Legal Copilot',
    category: 'AI Agents',
    description: 'Multi-jurisdictional contract review agent that flags compliance risks, compares clauses against playbooks, and exports annotated redlines.',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-screens-with-charts-and-data-31912-large.mp4',
    websiteUrl: 'https://synapse-legal.example.com',
    technologies: ['React', 'FastAPI', 'Anthropic Claude', 'OpenAI', 'Pinecone'],
    featured: false,
    published: true,
    stats: [
      { label: 'Review Speed', value: '12x Faster' },
      { label: 'Precision', value: '99.4%' }
    ]
  }
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-1',
    clientName: 'Aarav Mehta',
    company: 'Verve Dynamics',
    role: 'Founder & CEO',
    review: 'Prism Flow transformed our entire online presence. Their blend of clean Apple-like aesthetics and intelligent agentic workflows gave us a competitive moat we did not even know was possible. Conversion jumped 140% in 30 days.',
    profileImage: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&w=250&q=80',
    websiteUrl: 'https://vervedynamics.io',
    projectUrl: 'https://vervedynamics.io/case-study',
    published: true,
    rating: 5
  },
  {
    id: 'test-2',
    clientName: 'Priya Sharma',
    company: 'Synthetix Bio',
    role: 'Head of Product',
    review: 'The AI agents Prism Flow built into our customer portal cut our support tickets by 65% while delighting our scientific enterprise clients. Their attention to design details, glassmorphism, and performance is world-class.',
    profileImage: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=250&q=80',
    websiteUrl: 'https://synthetixbio.com',
    projectUrl: 'https://synthetixbio.com',
    published: true,
    rating: 5
  },
  {
    id: 'test-3',
    clientName: 'Rohan Kapoor',
    company: 'Apex Frontier Capital',
    role: 'Managing Partner',
    review: 'Working with Prism Flow feels like building with an elite Silicon Valley product team. Crisp communication, remarkable velocity, and software that looks and performs like Linear or Apple.',
    profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=250&q=80',
    websiteUrl: 'https://apexfrontier.co',
    projectUrl: 'https://apexfrontier.co',
    published: true,
    rating: 5
  },
  {
    id: 'test-4',
    clientName: 'Kavita Menon',
    company: 'Kroma Studio',
    role: 'Creative Director',
    review: 'The interactive AI workflows and vertical atmospheric gradients completely set our brand apart. Every single client who lands on our page mentions how mesmerizing and intelligent it feels.',
    profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
    websiteUrl: 'https://kromastudio.design',
    projectUrl: 'https://kromastudio.design',
    published: true,
    rating: 5
  }
];

export const INITIAL_INQUIRIES: Inquiry[] = [
  {
    id: 'inq-101',
    name: 'Sneha Roy',
    businessType: 'SaaS',
    email: 'sneha.r@novapay.io',
    contact: '+91 98765 43210',
    requirement: 'AI Agent',
    additionalNotes: 'Need a custom AI sales discovery agent that integrates with CRM and qualifies enterprise buyers automatically.',
    createdAt: '2026-08-28T14:30:00Z',
    status: 'pending'
  },
  {
    id: 'inq-102',
    name: 'Arjun Patel',
    businessType: 'E-Commerce',
    email: 'arjun@lumosapparel.com',
    contact: '+91 98123 45678',
    requirement: 'E-Commerce & Automation',
    additionalNotes: 'We want to re-architect our storefront into an ultra-fast headless setup with AI personalized sizing recommendations.',
    createdAt: '2026-08-26T11:15:00Z',
    status: 'accepted',
    adminNotes: 'Discovery call booked for Tuesday 2 PM.'
  },
  {
    id: 'inq-103',
    name: 'Ananya Deshmukh',
    businessType: 'Real Estate',
    email: 'ananya@elysiumluxury.com',
    contact: '+91 98234 56789',
    requirement: 'Intelligent Website',
    additionalNotes: 'Seeking a luxury ultra-minimal spatial website with interactive virtual property showcases and agent routing.',
    createdAt: '2026-08-24T09:00:00Z',
    status: 'completed',
    adminNotes: 'Project delivered successfully. Client ecstatic.'
  }
];

export const INITIAL_LEGAL_DOCS: Record<'privacy' | 'terms', LegalDocument> = {
  privacy: {
    id: 'privacy',
    title: 'Privacy Policy',
    lastUpdated: 'August 30, 2026',
    sections: [
      {
        heading: '1. Information We Collect',
        body: 'At Prism Flow ("we", "our", or "us"), we collect information you provide directly when you fill out our project inquiry forms, request consultations, interact with our AI agents, or communicate with our engineering teams. This includes your name, corporate email address, contact telephone number, business type, and project specifications.'
      },
      {
        heading: '2. How We Use Your Information',
        body: 'We utilize collected information solely to assess project feasibility, deliver customized architectural proposals, schedule discovery workshops, provide ongoing technical support, and fulfill contractual obligations for custom software development and AI engineering.'
      },
      {
        heading: '3. Data Security & AI Training Safeguards',
        body: 'We enforce enterprise-grade encryption at rest and in transit. Customer project briefs, proprietary workflows, and intellectual property submitted through our platforms are NEVER used to train public foundation models without explicit written bilateral consent.'
      },
      {
        heading: '4. Third-Party Disclosures',
        body: 'We do not sell, rent, or monetize your personal or corporate information. Data is shared exclusively with certified infrastructure providers (such as cloud hosting, transactional notification relays, and secure database services) strictly necessary to deliver our services.'
      },
      {
        heading: '5. Your Rights & Data Portability',
        body: 'You retain full rights to request access to, rectification of, or permanent erasure of your personal data from our systems. Contact our data protection officer at privacy@prismflow.tech.'
      }
    ]
  },
  terms: {
    id: 'terms',
    title: 'Terms & Conditions',
    lastUpdated: 'August 30, 2026',
    sections: [
      {
        heading: '1. Engagement & Services',
        body: 'Prism Flow provides specialized engineering services including intelligent web development, bespoke AI agent development, autonomous agentic systems, SaaS application development, and e-commerce automations. All development work is governed by individual Statements of Work (SOW) executed between the parties.'
      },
      {
        heading: '2. Intellectual Property Rights',
        body: 'Upon full settlement of agreed project fees, all custom source code, trained domain models, and bespoke UI assets generated specifically for the client are assigned to the client, subject to standard open-source licenses and Prism Flow foundational libraries.'
      },
      {
        heading: '3. Client Responsibilities & Data Accuracy',
        body: 'Clients agree to provide timely requirements, feedback, API access credentials, and content necessary for milestone completion. The client warrants that all assets provided do not infringe on third-party intellectual property.'
      },
      {
        heading: '4. Warranty & Service Level Agreement',
        body: 'We warrant that delivered software will perform substantially in accordance with agreed technical specifications for a warranty period specified in the applicable SOW. We provide ongoing maintenance and SLA monitoring upon mutual agreement.'
      },
      {
        heading: '5. Limitation of Liability',
        body: 'To the maximum extent permitted by applicable law, neither party shall be liable for indirect, incidental, special, consequential, or punitive damages arising out of or related to these terms.'
      },
      {
        heading: '6. Governing Law & Jurisdiction',
        body: 'These terms are governed by and construed in accordance with the laws of the jurisdiction specified in the definitive Master Services Agreement.'
      }
    ]
  }
};
