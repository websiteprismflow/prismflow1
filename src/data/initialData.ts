import { ServiceItem } from '../types';

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
