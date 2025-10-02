export interface HabitTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  streakGoal: number;
  weeklyGoal: number;
  isMicroHabit: boolean;
  estimatedDuration: number;
  targetDays: string[];
  tips?: string[];
}

export const HABIT_TEMPLATES: HabitTemplate[] = [
  {
    id: 'morning-meditation',
    name: 'Morning Meditation',
    description: 'Start your day with 5 minutes of mindfulness',
    icon: '🧘',
    color: '#8B5CF6',
    category: 'mindfulness',
    streakGoal: 30,
    weeklyGoal: 7,
    isMicroHabit: false,
    estimatedDuration: 5,
    targetDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    tips: [
      'Start with just 2 minutes if 5 feels too long',
      'Use a guided meditation app for beginners',
      'Find a quiet, comfortable spot',
    ],
  },
  {
    id: 'drink-water',
    name: 'Drink Water',
    description: 'Drink a glass of water first thing in the morning',
    icon: '💧',
    color: '#3B82F6',
    category: 'health',
    streakGoal: 30,
    weeklyGoal: 7,
    isMicroHabit: true,
    estimatedDuration: 1,
    targetDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    tips: [
      'Keep a glass of water by your bedside',
      'Add lemon for extra flavor',
      'Track your daily water intake',
    ],
  },
  {
    id: 'read-10-pages',
    name: 'Read 10 Pages',
    description: 'Read at least 10 pages of a book every day',
    icon: '📚',
    color: '#F59E0B',
    category: 'learning',
    streakGoal: 30,
    weeklyGoal: 7,
    isMicroHabit: false,
    estimatedDuration: 15,
    targetDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    tips: [
      'Keep your book visible as a reminder',
      'Read before bed for better sleep',
      'Join a book club for accountability',
    ],
  },
  {
    id: 'exercise',
    name: 'Exercise',
    description: '30 minutes of physical activity',
    icon: '💪',
    color: '#EF4444',
    category: 'fitness',
    streakGoal: 30,
    weeklyGoal: 5,
    isMicroHabit: false,
    estimatedDuration: 30,
    targetDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    tips: [
      'Schedule it like an important meeting',
      'Find an activity you enjoy',
      'Start with 10 minutes if needed',
    ],
  },
  {
    id: 'gratitude-journal',
    name: 'Gratitude Journal',
    description: 'Write down 3 things you\'re grateful for',
    icon: '✨',
    color: '#EC4899',
    category: 'mindfulness',
    streakGoal: 30,
    weeklyGoal: 7,
    isMicroHabit: true,
    estimatedDuration: 3,
    targetDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    tips: [
      'Do it at the same time each day',
      'Be specific about what you\'re grateful for',
      'Review your entries weekly',
    ],
  },
  {
    id: 'make-bed',
    name: 'Make Your Bed',
    description: 'Start your day with a small win',
    icon: '🛏️',
    color: '#10B981',
    category: 'productivity',
    streakGoal: 30,
    weeklyGoal: 7,
    isMicroHabit: true,
    estimatedDuration: 2,
    targetDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    tips: [
      'Do it immediately after waking up',
      'Keep it simple - just straighten the covers',
      'This creates momentum for the day',
    ],
  },
  {
    id: 'no-phone-morning',
    name: 'No Phone First Hour',
    description: 'Don\'t check your phone for the first hour after waking',
    icon: '📵',
    color: '#6366F1',
    category: 'mindfulness',
    streakGoal: 21,
    weeklyGoal: 7,
    isMicroHabit: false,
    estimatedDuration: 60,
    targetDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    tips: [
      'Charge your phone outside the bedroom',
      'Use an alarm clock instead',
      'Plan a morning routine to fill the time',
    ],
  },
  {
    id: 'walk-10k-steps',
    name: '10,000 Steps',
    description: 'Walk at least 10,000 steps daily',
    icon: '🚶',
    color: '#14B8A6',
    category: 'fitness',
    streakGoal: 30,
    weeklyGoal: 7,
    isMicroHabit: false,
    estimatedDuration: 90,
    targetDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    tips: [
      'Take walking breaks throughout the day',
      'Park farther away from entrances',
      'Use a step counter app',
    ],
  },
  {
    id: 'learn-language',
    name: 'Language Practice',
    description: 'Practice a new language for 15 minutes',
    icon: '🗣️',
    color: '#F97316',
    category: 'learning',
    streakGoal: 100,
    weeklyGoal: 7,
    isMicroHabit: false,
    estimatedDuration: 15,
    targetDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    tips: [
      'Use apps like Duolingo or Babbel',
      'Practice at the same time daily',
      'Find a language exchange partner',
    ],
  },
  {
    id: 'cold-shower',
    name: 'Cold Shower',
    description: 'End your shower with 30 seconds of cold water',
    icon: '🚿',
    color: '#06B6D4',
    category: 'health',
    streakGoal: 30,
    weeklyGoal: 7,
    isMicroHabit: true,
    estimatedDuration: 1,
    targetDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    tips: [
      'Start with just 10 seconds',
      'Focus on your breathing',
      'Gradually increase duration',
    ],
  },
  {
    id: 'meal-prep',
    name: 'Meal Prep Sunday',
    description: 'Prepare healthy meals for the week',
    icon: '🥗',
    color: '#84CC16',
    category: 'health',
    streakGoal: 12,
    weeklyGoal: 1,
    isMicroHabit: false,
    estimatedDuration: 120,
    targetDays: ['Sun'],
    tips: [
      'Plan your meals on Saturday',
      'Invest in good containers',
      'Start with just 3-4 meals',
    ],
  },
  {
    id: 'stretch',
    name: 'Morning Stretch',
    description: '5-minute stretching routine',
    icon: '🤸',
    color: '#A855F7',
    category: 'fitness',
    streakGoal: 30,
    weeklyGoal: 7,
    isMicroHabit: false,
    estimatedDuration: 5,
    targetDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    tips: [
      'Follow a YouTube stretching video',
      'Focus on problem areas',
      'Never stretch cold muscles',
    ],
  },
  {
    id: 'no-social-media',
    name: 'Social Media Detox',
    description: 'No social media for 1 hour before bed',
    icon: '🌙',
    color: '#6366F1',
    category: 'mindfulness',
    streakGoal: 21,
    weeklyGoal: 7,
    isMicroHabit: false,
    estimatedDuration: 60,
    targetDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    tips: [
      'Use app timers to limit usage',
      'Replace with reading or journaling',
      'Turn off notifications',
    ],
  },
  {
    id: 'floss',
    name: 'Floss Daily',
    description: 'Floss your teeth every night',
    icon: '🦷',
    color: '#22D3EE',
    category: 'health',
    streakGoal: 30,
    weeklyGoal: 7,
    isMicroHabit: true,
    estimatedDuration: 2,
    targetDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    tips: [
      'Keep floss visible by your toothbrush',
      'Use floss picks if easier',
      'Do it right after brushing',
    ],
  },
  {
    id: 'deep-work',
    name: 'Deep Work Session',
    description: '90 minutes of focused, uninterrupted work',
    icon: '🎯',
    color: '#DC2626',
    category: 'productivity',
    streakGoal: 30,
    weeklyGoal: 5,
    isMicroHabit: false,
    estimatedDuration: 90,
    targetDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    tips: [
      'Turn off all notifications',
      'Use the Pomodoro technique',
      'Schedule it for your peak energy time',
    ],
  },
];

export const getTemplatesByCategory = (category: string): HabitTemplate[] => {
  return HABIT_TEMPLATES.filter(template => template.category === category);
};

export const getMicroHabitTemplates = (): HabitTemplate[] => {
  return HABIT_TEMPLATES.filter(template => template.isMicroHabit);
};

export const getPopularTemplates = (): HabitTemplate[] => {
  return HABIT_TEMPLATES.slice(0, 6);
};
