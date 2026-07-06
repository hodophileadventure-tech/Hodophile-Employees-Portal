import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient({ log: ['query'] })

const payload = {
  leadId: '55592607-1f37-4759-b540-917dc741cf6c',
  persons: 1,
  leadWorth: 1000,
  commission: 100,
  employeeId: 'ecdde89f-975f-4f37-9da7-22e803c2ca63',
  confirmedAt: '2026-07-06T11:39:01.474Z',
  destination: 'Paris, France',
  customerName: 'John Doe',
  sourceSystem: 'lead-manager',
  employeeEmail: 'test-portal-employee-1@example.com',
  customerNumber: '+1-555-0101'
}

const confirmLeadSchema = z.object({
  employeeId: z.string(),
  employeeEmail: z.string().email().optional(),
  customerName: z.string().min(1, 'Customer name is required'),
  customerNumber: z.string().min(1, 'Customer number is required'),
  destination: z.string().min(1, 'Destination is required'),
  persons: z.number().int().positive('Number of persons must be greater than 0'),
  leadWorth: z.number().positive(),
  commission: z.number().nonnegative().optional(),
  leadId: z.string().optional(),
  sourceSystem: z.string().optional(),
  confirmedAt: z.string().optional(),
})

async function main() {
  try {
    const validated = confirmLeadSchema.parse(payload as any)
    console.log('Validated payload')

    if (validated.sourceSystem === 'lead-manager' && !validated.employeeEmail) {
      throw new Error('employeeEmail is required for lead-manager payloads')
    }

    let employee
    if (validated.sourceSystem === 'lead-manager') {
      employee = await prisma.employee.findUnique({ where: { email: validated.employeeEmail! } })
    } else {
      employee = await prisma.employee.findFirst({ where: { OR: [ { id: validated.employeeId }, { employeeId: validated.employeeId }, { userId: validated.employeeId } ] } })
    }

    console.log('Found employee:', employee?.id)

    if (!employee) throw new Error('Employee not found')

    if (!employee.designation.toLowerCase().includes('sales executive')) throw new Error('Only sales executives can log leads')

    let commission: number
    if (validated.sourceSystem === 'lead-manager') {
      if (validated.commission === undefined) throw new Error('commission is required for lead-manager payloads')
      commission = validated.commission
    } else {
      commission = validated.commission ?? (validated.leadWorth <= 25000 ? 500 : 1000)
    }

    // Check duplicate
    if (validated.leadId) {
      const existingLead = await prisma.salesLead.findUnique({ where: { sourceLeadId: validated.leadId } })
      if (existingLead) {
        console.log('Duplicate lead already recorded', existingLead.id)
        return
      }
    }

    const lead = await prisma.salesLead.create({ data: {
      employeeId: employee.id,
      customerName: validated.customerName,
      customerNumber: validated.customerNumber,
      destination: validated.destination,
      persons: validated.persons,
      leadWorth: validated.leadWorth,
      confirmed: true,
      confirmedAt: validated.confirmedAt ? new Date(validated.confirmedAt) : new Date(),
      commission,
      sourceLeadId: validated.leadId,
      sourceSystem: validated.sourceSystem || 'unknown',
    } })

    console.log('Created lead', lead.id)

    const month = new Date(); month.setDate(1); month.setHours(0,0,0,0);
    const existingSalary = await prisma.salaryRecord.findUnique({ where: { employeeId_month: { employeeId: employee.id, month } } }).catch(e=>{throw e})
    console.log('Existing salary', existingSalary)

    console.log('Upserting salary record')

    if (existingSalary) {
      const updated = await prisma.salaryRecord.update({ where: { id: existingSalary.id }, data: { commission: existingSalary.commission + commission, netSalary: existingSalary.totalSalary + existingSalary.commission + commission - existingSalary.deductions, updatedAt: new Date() } })
      console.log('Updated salary record', updated.id)
    } else {
      const employeeRec = await prisma.employee.findUnique({ where: { id: employee.id } })
      const totalSalary = employeeRec?.monthlySalary ?? 0
      const created = await prisma.salaryRecord.create({ data: { employeeId: employee.id, month, daysWorked: 0, totalSalary, earnedSalary: 0, deductions: 0, commission, monthlyIncentive: 0, netSalary: totalSalary + commission, status: 'PENDING' } })
      console.log('Created salary record', created.id)
    }

    console.log('Script completed successfully')
  } catch (err: any) {
    console.error('Script error', err)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
