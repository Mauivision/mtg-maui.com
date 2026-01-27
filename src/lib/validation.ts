/**
 * Centralized validation utilities
 * Consolidates validation logic used across the application
 */

import { z } from 'zod';

/**
 * Email validation schema
 */
export const emailSchema = z.string().email('Please enter a valid email address');

/**
 * Name validation schema
 */
export const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be less than 100 characters');

/**
 * Player data validation
 */
export const playerDataSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  commander: z.string().min(1, 'Commander name is required'),
});

export type PlayerDataInput = z.infer<typeof playerDataSchema>;

/**
 * Validate player data
 */
export function validatePlayerData(data: unknown): { valid: boolean; errors: Record<string, string> } {
  const result = playerDataSchema.safeParse(data);
  
  if (result.success) {
    return { valid: true, errors: {} };
  }

  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    if (err.path.length > 0) {
      errors[err.path[0] as string] = err.message;
    }
  });

  return { valid: false, errors };
}

/**
 * League creation validation schema
 */
export const leagueSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  format: z.string().min(1, 'Format is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  maxPlayers: z.number().int().positive().max(500).optional(),
});

/**
 * Game creation validation schema
 */
export const gameSchema = z.object({
  leagueId: z.string().optional().nullable(),
  gameType: z.enum(['commander', 'draft', 'standard']),
  date: z.string().min(1, 'Date is required'),
  duration: z.number().int().positive().optional().nullable(),
  players: z.array(z.string()),
  placements: z.array(
    z.object({
      playerId: z.string(),
      deckId: z.string().optional(),
      place: z.number().int().positive(),
      points: z.number().int().min(0),
    })
  ),
  notes: z.string().optional().nullable(),
});

/**
 * Scoring rule validation schema
 */
export const scoringRuleSchema = z.object({
  leagueId: z.string().min(1, 'League ID is required'),
  gameType: z.enum(['commander', 'draft', 'standard']),
  name: z.string().min(1, 'Name is required'),
  points: z.number().int(),
  description: z.string().optional().nullable(),
});

/**
 * Generic validation helper
 */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { valid: boolean; data?: T; errors: string[] } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { valid: true, data: result.data, errors: [] };
  }

  const errors = result.error.errors.map((err) => err.message);
  return { valid: false, errors };
}
