import { GrowthArchetype } from "@/types/habit";

export const GROWTH_ARCHETYPES: GrowthArchetype[] = [
  {
    id: 'builder',
    name: 'The Builder',
    description: 'You create systems and structures. You value consistency and steady progress.',
    icon: '🏗️',
    color: '#F59E0B',
    criteria: {
      minHabits: 5,
      minStreak: 7,
      categories: ['productivity', 'health'],
    },
  },
  {
    id: 'scholar',
    name: 'The Scholar',
    description: 'You seek knowledge and wisdom. Learning and growth drive your journey.',
    icon: '📚',
    color: '#8B5CF6',
    criteria: {
      minHabits: 3,
      categories: ['learning', 'mindfulness'],
    },
  },
  {
    id: 'explorer',
    name: 'The Explorer',
    description: 'You embrace variety and new experiences. Adventure fuels your spirit.',
    icon: '🧭',
    color: '#10B981',
    criteria: {
      minHabits: 7,
      categories: ['fitness', 'creativity', 'social'],
    },
  },
  {
    id: 'creator',
    name: 'The Creator',
    description: 'You bring ideas to life. Expression and innovation are your strengths.',
    icon: '🎨',
    color: '#EC4899',
    criteria: {
      minHabits: 4,
      categories: ['creativity', 'productivity'],
    },
  },
  {
    id: 'warrior',
    name: 'The Warrior',
    description: 'You push boundaries and overcome challenges. Discipline is your weapon.',
    icon: '⚔️',
    color: '#EF4444',
    criteria: {
      minStreak: 30,
      minCompletions: 100,
      categories: ['fitness', 'health'],
    },
  },
];
