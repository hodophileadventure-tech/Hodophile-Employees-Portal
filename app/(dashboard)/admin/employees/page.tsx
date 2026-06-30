// app/(dashboard)/admin/employees/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash,
  MoreVertical,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'

interface Employee {
  id: string
  employeeId: string
  fullName: string
  email: string
  designation: string
  department: string
  status: string
  monthlySalary: number
  phoneNumber: string
  cnicNumber: string
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [statusMap, setStatusMap] = useState<Record<string, any>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [departmentFilter, setDepartmentFilter] = useState('all')

  // Fetch employees from database
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true)
        const [empRes, dashRes] = await Promise.all([
          fetch('/api/admin/employees'),
          fetch('/api/admin/dashboard'),
        ])
        const data = await empRes.json()
        const dash = await dashRes.json()
        if (data.success) setEmployees(data.data)
        if (dash.success && dash.data?.employeeStatuses) {
          const map: Record<string, any> = {}
          dash.data.employeeStatuses.forEach((s: any) => (map[s.id] = s))
          setStatusMap(map)
        }
      } catch (error) {
        console.error('Failed to fetch employees:', error)
        toast.error('Failed to load employees')
      } finally {
        setLoading(false)
      }
    }

    fetchEmployees()
  }, [])

  const itemsPerPage = 10

  // Get unique departments from employees
  const departments = Array.from(new Set(employees.map(emp => emp.department)))

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDept =
      departmentFilter === 'all' || emp.department === departmentFilter

    return matchesSearch && matchesDept
  })

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedEmployees = filteredEmployees.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        const response = await fetch(`/api/admin/employees/${id}`, {
          method: 'DELETE',
        })
        const data = await response.json()
        if (data.success) {
          setEmployees(employees.filter((emp) => emp.id !== id))
          toast.success('Employee deleted successfully')
        } else {
          toast.error(data.message || 'Failed to delete employee')
        }
      } catch (error) {
        toast.error('Failed to delete employee')
        console.error('Error deleting employee:', error)
      }
    }
  }

  const handleToggleStatus = async (id: string) => {
    try {
      const employee = employees.find(emp => emp.id === id)
      if (!employee) return

      const newStatus = employee.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
      const response = await fetch(`/api/admin/employees/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await response.json()
      if (data.success) {
        setEmployees(
          employees.map((emp) =>
            emp.id === id ? { ...emp, status: newStatus } : emp
          )
        )
        toast.success('Employee status updated')
      } else {
        toast.error(data.message || 'Failed to update status')
      }
    } catch (error) {
      toast.error('Failed to update employee status')
      console.error('Error updating status:', error)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Employees
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage all employees in your organization
          </p>
        </div>

        <Link
          href="/admin/employees/add"
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
        >
          <Plus size={20} />
          Add Employee
        </Link>
      </div>

      {/* Filters */}
      <motion.div
        className="card-lg bg-white dark:bg-slate-900 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col md:flex-row gap-4 items-end">
          {/* Search */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Search
            </label>
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-3 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="input pl-10 w-full"
              />
            </div>
          </div>

          {/* Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Department
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="input w-full"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Results */}
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {filteredEmployees.length} results
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        className="card-lg bg-white dark:bg-slate-900 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {loading ? (
          <div className="px-6 py-8 text-center">
            <p className="text-slate-600 dark:text-slate-400">Loading employees...</p>
          </div>
        ) : paginatedEmployees.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-slate-600 dark:text-slate-400">No employees found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                      Designation
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                      Salary (Rs.)
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEmployees.map((employee, index) => (
                    <motion.tr
                      key={employee.id}
                      className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">
                            {employee.fullName}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {employee.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-semibold text-slate-600 dark:text-slate-400">
                          {employee.employeeId}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {employee.designation}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium">
                          {employee.department}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {employee.monthlySalary.toLocaleString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {statusMap[employee.id] ? (
                          (() => {
                            const s = statusMap[employee.id]
                            if (s.onBreak) return (<span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">On Break · {s.currentBreakDuration}m</span>)
                            if (s.todaysAttendance && s.todaysAttendance.status === 'LATE') return (<span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">Late</span>)
                            if (s.todaysAttendance && s.todaysAttendance.status === 'ABSENT') return (<span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Absent</span>)
                            return (<span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${employee.status === 'ACTIVE' ? 'bg-success/20 text-success' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>{employee.status === 'ACTIVE' ? '● Active' : '● Inactive'}</span>)
                          })()
                        ) : (
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${employee.status === 'ACTIVE' ? 'bg-success/20 text-success' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>{employee.status === 'ACTIVE' ? '● Active' : '● Inactive'}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/employees/${employee.id}`}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <MoreVertical size={18} className="text-slate-400" />
                          </Link>
                          <Link
                            href={`/admin/employees/${employee.id}/edit`}
                            className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Edit Employee"
                          >
                            <Edit size={18} className="text-blue-600" />
                          </Link>
                          <button
                            onClick={() => handleDelete(employee.id)}
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Delete Employee"
                          >
                            <Trash size={18} className="text-danger" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={18} />
                  Previous
                </button>

                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Page {currentPage} of {totalPages}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  )
}
