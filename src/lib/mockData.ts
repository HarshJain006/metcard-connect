// Demo/Mock data for testing without backend
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

export const mockUser = {
  id: 'demo-user-1',
  email: 'demo@allwemet.app',
  name: 'Demo User',
  picture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
  sheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
  sheetUrl: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
};

export const mockContacts = [
  {
    id: '1',
    name: 'Sarah Chen',
    company: 'TechCorp Inc.',
    title: 'Senior Product Manager',
    phone: '+1 (555) 123-4567',
    email: 'sarah.chen@techcorp.com',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    company: 'Innovation Labs',
    title: 'CTO',
    phone: '+1 (555) 987-6543',
    email: 'marcus@innovationlabs.io',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    company: 'Design Studio Co.',
    title: 'Lead UX Designer',
    phone: '+1 (555) 246-8135',
    email: 'emily.r@designstudio.co',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const generateMockContact = () => {
  const names = ['Alex Kim', 'Jordan Taylor', 'Casey Morgan', 'Riley Brown', 'Morgan Lee'];
  const companies = ['StartupXYZ', 'Global Solutions', 'Future Tech', 'Digital Agency', 'Cloud Systems'];
  const titles = ['CEO', 'Marketing Director', 'Software Engineer', 'Business Analyst', 'Creative Director'];
  
  const randomIndex = Math.floor(Math.random() * names.length);
  
  return {
    id: Math.random().toString(36).substring(2),
    name: names[randomIndex],
    company: companies[randomIndex],
    title: titles[randomIndex],
    phone: `+1 (555) ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
    email: `${names[randomIndex].toLowerCase().replace(' ', '.')}@${companies[randomIndex].toLowerCase().replace(' ', '')}.com`,
    createdAt: new Date().toISOString(),
  };
};
