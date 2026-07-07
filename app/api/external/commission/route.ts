// app/api/external/commission/route.ts
/**
 * Commission Receiver Endpoint
 * 
 * This endpoint receives commission notifications from the Lead Manager application
 * when leads are confirmed. It stores commission records for payroll calculation.
 * 
 * Security: Validates API key from Authorization header
 * Idempotency: Prevents duplicate commissions using leadId as unique identifier
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateInternalApiRequest } from '@/lib/internal-api-key';
import { validateCommissionPayload, CommissionPayload } from '@/lib/commission-validation';
import { z } from 'zod';

/**
 * POST /api/external/commission
 * 
 * Receives commission notifications from Lead Manager and stores them as salary records.
 * Idempotent: Safe to call multiple times for the same lead.
 * 
 * Request Headers:
 *   Authorization: ApiKey <API_KEY> or Bearer <API_KEY>
 * 
 * Request Body:
 * {
 *   "leadId": "uuid",
 *   "employeeId": "uuid or employee-id",
 *   "leadWorth": 32000,
 *   "commission": 1000,
 *   "confirmedAt": "2024-01-15T10:30:00Z",
 *   ... (optional fields for context)
 * }
 * 
 * Response:
 * - 200: Commission processed successfully
 * - 201: Commission created as new record
 * - 400: Invalid payload
 * - 401: Missing or invalid API key
 * - 404: Employee not found
 * - 409: Duplicate commission (leadId already processed)
 * - 500: Server error
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Validate API Key
    const authHeader = request.headers.get('authorization');
    if (!validateInternalApiRequest(authHeader)) {
      console.warn('[Commission API] Unauthorized request - invalid API key');
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Invalid or missing API key' },
        { status: 401 }
      );
    }

    // 2. Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch (error) {
      console.error('[Commission API] Failed to parse JSON:', error);
      return NextResponse.json(
        { success: false, message: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // 3. Validate commission payload schema
    let payload: CommissionPayload;
    try {
      payload = validateCommissionPayload(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('[Commission API] Validation error:', error.errors);
        return NextResponse.json(
          {
            success: false,
            message: 'Validation error',
            errors: error.errors.map((e) => ({
              field: e.path.join('.'),
              message: e.message,
            })),
          },
          { status: 400 }
        );
      }
      throw error;
    }

    // 4. Check for duplicate commission (idempotency)
    if (payload.leadId) {
      const existingCommission = await prisma.salaryRecord.findUnique({
        where: { leadId: payload.leadId },
      });

      if (existingCommission) {
        console.warn('[Commission API] Duplicate commission - leadId already processed:', payload.leadId);
        return NextResponse.json(
          {
            success: true,
            message: 'Commission already processed for this lead',
            data: {
              leadId: payload.leadId,
              salaryRecordId: existingCommission.id,
            },
          },
          { status: 200 } // Return 200 to indicate idempotent success
        );
      }
    }

    // 5. Verify employee exists
    const employee = await prisma.employee.findUnique({
      where: { id: payload.employeeId },
    });

    if (!employee) {
      console.error('[Commission API] Employee not found:', payload.employeeId);
      return NextResponse.json(
        { success: false, message: 'Employee not found' },
        { status: 404 }
      );
    }

    // 6. Extract month and year from confirmedAt
    const confirmedDate = new Date(payload.confirmedAt);
    const year = confirmedDate.getFullYear();
    const month = confirmedDate.getMonth();
    const monthDate = new Date(year, month, 1);

    // 7. Upsert salary record with commission
    // If salary record exists for this month, add commission; otherwise create new record
    const salaryRecord = await prisma.salaryRecord.upsert({
      where: {
        employeeId_month: {
          employeeId: payload.employeeId,
          month: monthDate,
        },
      },
      create: {
        employeeId: payload.employeeId,
        month: monthDate,
        daysWorked: 0, // Will be calculated during payroll
        totalSalary: 0, // Will be calculated during payroll
        earnedSalary: 0, // Will be calculated during payroll
        commission: payload.commission,
        monthlyIncentive: 0, // Will be calculated during payroll
        netSalary: 0, // Will be calculated during payroll
        leadId: payload.leadId, // For idempotency
        status: 'PENDING',
      },
      update: {
        commission: {
          increment: payload.commission,
        },
        leadId: payload.leadId, // Update leadId for tracking
      },
    });

    // 8. Log commission receipt for audit trail
    console.log('[Commission API] Commission processed successfully', {
      leadId: payload.leadId,
      employeeId: payload.employeeId,
      commission: payload.commission,
      salaryRecordId: salaryRecord.id,
      customerName: payload.customerName,
      destination: payload.destination,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Commission processed successfully',
        data: {
          leadId: payload.leadId,
          salaryRecordId: salaryRecord.id,
          commission: payload.commission,
          totalMonthlyCommission: salaryRecord.commission,
          month: monthDate.toISOString().split('T')[0],
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Commission API] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && {
          error: error instanceof Error ? error.message : String(error),
        }),
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS endpoint for CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
