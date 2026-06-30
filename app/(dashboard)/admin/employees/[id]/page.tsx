import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Hash,
  Briefcase,
  Calendar,
  Users,
  ShieldCheck,
  Edit,
} from 'lucide-react'
import { prisma } from '@/lib/prisma'

async function getEmployee(id: string) {
  return prisma.employee.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
  })
}

export default async function EmployeeDetailPage({ params }: any) {
  const resolvedParams = await params
  const id = resolvedParams.id
  const employee = await getEmployee(id)

  if (!employee) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {employee.fullName}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Employee details for {employee.designation}
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link
            href={`/admin/employees/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-100 px-4 py-2 text-blue-700 transition hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
          >
            <Edit size={16} /> Edit Employee
          </Link>
          <Link
            href="/admin/employees"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <ArrowLeft size={16} /> Back to employees
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-8">
        <div className="card-lg bg-white dark:bg-slate-900 p-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-3xl font-bold text-white shadow-lg">
              {employee.fullName
                .split(' ')
                .map((part) => part[0])
                .join('')}
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {employee.fullName}
            </h2>
            <p className="text-sm text-primary-600 dark:text-primary-400 mt-2">
              {employee.designation}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {employee.department} • {employee.employeeId}
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Employment Status
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                {employee.status}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Reporting hours
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">
                {employee.reportingTime || 'N/A'} - {employee.logoutTime || 'N/A'}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                {employee.workingDays || 'No schedule set'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <section className="card-lg bg-white dark:bg-slate-900 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Users className="text-primary-600" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Contact Information
              </h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                <div className="flex items-center gap-3">
                  <Mail className="text-primary-600" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {employee.email}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                <div className="flex items-center gap-3">
                  <Phone className="text-primary-600" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Phone</p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {employee.phoneNumber}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950 sm:col-span-2">
                <div className="flex items-start gap-3">
                  <MapPin className="text-primary-600 mt-1" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Address</p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {employee.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="card-lg bg-white dark:bg-slate-900 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Briefcase className="text-primary-600" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Employment Information
              </h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                <div className="flex items-center gap-3">
                  <Hash className="text-primary-600" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Employee ID</p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {employee.employeeId}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                <div className="flex items-center gap-3">
                  <Briefcase className="text-primary-600" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Designation</p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {employee.designation}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-primary-600" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Department</p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {employee.department}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                <div className="flex items-center gap-3">
                  <Calendar className="text-primary-600" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Joining Date</p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {new Date(employee.joiningDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950 sm:col-span-2">
                <div className="flex items-center gap-3">
                  <Briefcase className="text-primary-600" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Monthly Salary</p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      ₹{employee.monthlySalary.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="card-lg bg-white dark:bg-slate-900 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Users className="text-primary-600" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Emergency Contact
              </h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                <p className="text-xs text-slate-500 dark:text-slate-400">Contact Name</p>
                <p className="mt-2 font-semibold text-slate-900 dark:text-white">
                  {employee.emergencyContactName}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                <p className="text-xs text-slate-500 dark:text-slate-400">Contact Phone</p>
                <p className="mt-2 font-semibold text-slate-900 dark:text-white">
                  {employee.emergencyContactNumber}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
