import { z } from "zod";
import { publicProcedure } from "../../../create-context";

const HabitCompletionDataSchema = z.object({
  completed: z.boolean(),
  note: z.string().optional(),
  mood: z.enum(['great', 'good', 'okay', 'bad', 'terrible']).optional(),
  energy: z.enum(['high', 'medium', 'low']).optional(),
});

const HabitReminderSchema = z.object({
  id: z.string(),
  habitId: z.string(),
  time: z.string(),
  days: z.array(z.string()),
  enabled: z.boolean(),
  title: z.string().optional(),
  body: z.string().optional(),
});

const HabitSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  icon: z.string(),
  color: z.string(),
  streakGoal: z.number(),
  createdAt: z.string(),
  archived: z.boolean(),
  completions: z.record(z.string(), z.union([z.boolean(), HabitCompletionDataSchema])),
  reminders: z.array(HabitReminderSchema).optional(),
  category: z.string().optional(),
  weeklyGoal: z.number().optional(),
  targetDays: z.array(z.string()).optional(),
  isMicroHabit: z.boolean().optional(),
  estimatedDuration: z.number().optional(),
});

export const syncHabitsProcedure = publicProcedure
  .input(
    z.object({
      habits: z.array(HabitSchema),
      lastSyncTimestamp: z.string().optional(),
    })
  )
  .mutation(async ({ input }) => {
    console.log(`Syncing ${input.habits.length} habits`);
    
    return {
      success: true,
      syncedAt: new Date().toISOString(),
      habitsCount: input.habits.length,
    };
  });

export const getHabitsProcedure = publicProcedure
  .input(
    z.object({
      userId: z.string().optional(),
    })
  )
  .query(async ({ input }) => {
    console.log(`Fetching habits for user: ${input.userId || 'anonymous'}`);
    
    return {
      habits: [],
      lastSyncTimestamp: new Date().toISOString(),
    };
  });
