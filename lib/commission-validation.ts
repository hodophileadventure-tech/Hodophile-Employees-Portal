// lib/commission-validation.ts
import { z } from 'zod';

/**
 * Validation schema for commission payload from Lead Manager
 */
export const commissionPayloadSchema = z.object({
  leadId: z.string().uuid('Invalid leadId format').describe('External lead ID from Lead Manager'),
  employeeId: z.string().describe('Employee ID in Employee Portal'),
  leadWorth: z.number().nonnegative('Lead worth must be non-negative').describe('Total worth of the lead in PKR'),
  commission: z.number().nonnegative('Commission must be non-negative').describe('Calculated commission amount'),
  confirmedAt: z.string().datetime('Invalid ISO datetime format').describe('When the lead was confirmed'),
  
  // Optional fields for additional context/logging
  customerName: z.string().optional(),
  customerNumber: z.string().optional(),
  destination: z.string().optional(),
  persons: z.number().int().positive().optional(),
  employeeEmail: z.string().email().optional(),
  commissionRule: z.string().optional(),
  ruleDescription: z.string().optional(),
  sourceSystem: z.string().optional(),
});

export type CommissionPayload = z.infer<typeof commissionPayloadSchema>;

/**
 * Validate and parse commission payload
 * @param data The payload to validate
 * @returns Parsed and validated CommissionPayload
 * @throws ZodError if validation fails
 */
export function validateCommissionPayload(data: unknown): CommissionPayload {
  return commissionPayloadSchema.parse(data);
}
