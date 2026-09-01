import { PortfolioProject } from '../types';
import { INITIAL_PROJECTS } from '../data/initialData';
import { getStoredItem, setStoredItem } from './storage';

const PORTFOLIO_KEY = 'prism_portfolio';

export const portfolioService = {
  getAll: (includeUnpublished = false): PortfolioProject[] => {
    const list = getStoredItem<PortfolioProject[]>(PORTFOLIO_KEY, INITIAL_PROJECTS);
    if (includeUnpublished) return list;
    return list.filter((p) => p.published);
  },

  getById: (id: string): PortfolioProject | undefined => {
    const list = portfolioService.getAll(true);
    return list.find((p) => p.id === id);
  },

  create: async (data: Omit<PortfolioProject, 'id'>): Promise<PortfolioProject> => {
    const list = portfolioService.getAll(true);
    const newProject: PortfolioProject = {
      ...data,
      id: `proj-${Date.now()}`
    };
    const updated = [newProject, ...list];
    setStoredItem(PORTFOLIO_KEY, updated);
    return newProject;
  },

  update: async (id: string, data: Partial<PortfolioProject>): Promise<PortfolioProject | null> => {
    const list = portfolioService.getAll(true);
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) return null;

    list[index] = { ...list[index], ...data };
    setStoredItem(PORTFOLIO_KEY, [...list]);
    return list[index];
  },

  togglePublish: async (id: string): Promise<PortfolioProject | null> => {
    const list = portfolioService.getAll(true);
    const index = list.findIndex((p) => p.id === id);
    if (index === -1) return null;

    list[index].published = !list[index].published;
    setStoredItem(PORTFOLIO_KEY, [...list]);
    return list[index];
  },

  delete: async (id: string): Promise<boolean> => {
    const list = portfolioService.getAll(true);
    const filtered = list.filter((p) => p.id !== id);
    setStoredItem(PORTFOLIO_KEY, filtered);
    return true;
  }
};
