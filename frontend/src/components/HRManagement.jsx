import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Download,
  Upload,
  RefreshCw,
  Settings,
  CreditCard,
  Award,
  PieChart,
  BarChart,
  FileText,
  Calculator,
  ArrowUp,
  ArrowDown,
  DollarSign as MoneyIcon,
  Clock as ClockIcon,
  Award as AwardIcon,
  Download as DownloadIcon,
  Edit,
  Eye,
  Filter,
  Search,
  ChevronRight,
  Moon,
  Sun,
  Building2,
  Mail,
  Phone,
  MapPin,
  Star,
  TrendingDown,
  Plus,
  X,
  CheckCircle as CheckCircleIcon,
  XCircle
} from 'lucide-react'
import { useEmployeeStore } from '../stores/employeeStore'
import { useTimesheetStore } from '../stores/timesheetStore'
import { useOrganizationStore } from '../stores/organizationStore'
import { useSettingsStore } from '../stores/settingsStore'
import { getCurrencySymbol } from '../utils/currencies'
import toast from 'react-hot-toast'

export const HRManagement = () => {
  const { employees } = useEmployeeStore()
  const { timesheets } = useTimesheetStore()
  const { currentOrganization } = useOrganizationStore()
  const { currency } = useSettingsStore()
  
  const currencySymbol = getCurrencySymbol(currency)
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedPeriod, setSelectedPeriod] = useState('currentMonth')
  const [showAdvanceForm, setShowAdvanceForm] = useState(false)
  const [advanceForm, setAdvanceForm] = useState({
    employeeId: '',
    employeeName: '',
    amount: '',
    notes: ''
  })
  const [salaryConfig, setSalaryConfig] = useState({
    hourlyRate: 25,
    overtimeRate: 37.5, // 1.5x
    nightShiftBonus: 2.5,
    weekendBonus: 3.5,
    minimumHours: 160, // per month
    payFrequency: 'monthly' // weekly, biWeekly, semiMonthly, monthly
  })

  const [advances, setAdvances] = useState([
    {
      id: 'adv1',
      employeeId: 'emp001',
      employeeName: 'John Smith',
      amount: 500,
      requestedDate: new Date('2024-01-15'),
      requestedBy: 'Admin',
      status: 'approved',
      approvedDate: new Date('2024-01-16'),
      approvedBy: 'Admin',
      deductedFrom: 'January 2024',
      notes: 'Emergency medical expenses'
    },
    {
      id: 'adv2',
      employeeId: 'emp002',
      employeeName: 'Emily Johnson',
      amount: 1000,
      requestedDate: new Date('2024-01-20'),
      requestedBy: 'Employee',
      status: 'approved',
      approvedDate: new Date('2024-01-20'),
      approvedBy: 'Admin',
      deductedFrom: 'January 2024',
      notes: 'Home repair emergency'
    },
    {
      id: 'adv3',
      employeeId: 'emp003',
      employeeName: 'Michael Brown',
      amount: 300,
      requestedDate: new Date('2024-01-25'),
      requestedBy: 'Employee',
      status: 'pending',
      approvedDate: null,
      approvedBy: null,
      deductedFrom: null,
      notes: 'Pending approval'
    }
  ])

  const [payrollHistory, setPayrollHistory] = useState([
    {
      id: '1',
      employeeId: 'emp001',
      employeeName: 'John Smith',
      period: 'January 2024',
      baseSalary: 4000,
      overtime: 562.5,
      bonuses: 150,
      deductions: 200,
      netPay: 4512.5,
      status: 'paid',
      paymentDate: new Date('2024-01-31'),
      hoursWorked: 180,
      regularHours: 160,
      overtimeHours: 20
    },
    {
      id: '2',
      employeeId: 'emp002',
      employeeName: 'Emily Johnson',
      period: 'January 2024',
      baseSalary: 4500,
      overtime: 750,
      bonuses: 300,
      deductions: 250,
      netPay: 5300,
      status: 'paid',
      paymentDate: new Date('2024-01-31'),
      hoursWorked: 200,
      regularHours: 160,
      overtimeHours: 40
    },
    {
      id: '3',
      employeeId: 'emp003',
      employeeName: 'Michael Brown',
      period: 'January 2024',
      baseSalary: 3500,
      overtime: 187.5,
      bonuses: 100,
      deductions: 150,
      netPay: 3637.5,
      status: 'pending',
      paymentDate: null,
      hoursWorked: 165,
      regularHours: 160,
      overtimeHours: 5
    }
  ])

  // Helper functions - defined before useMemo
  const calculateBonuses = (timesheets) => {
    let bonus = 0
    // Placeholder for bonus calculation logic
    return bonus
  }

  const pairTimesheetEntries = (timesheets) => {
    const pairs = []
    const sorted = [...timesheets].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
    for (let i = 0; i < sorted.length; i += 2) {
      if (i + 1 < sorted.length && sorted[i].event === 'Check In' && sorted[i + 1].event === 'Check Out') {
        pairs.push({ in: sorted[i].timestamp, out: sorted[i + 1].timestamp })
      }
    }
    return pairs
  }

  const getPeriodStart = (period) => {
    const now = new Date()
    switch (period) {
      case 'currentMonth':
        return new Date(now.getFullYear(), now.getMonth(), 1)
      case 'lastMonth':
        return new Date(now.getFullYear(), now.getMonth() - 1, 1)
      case 'currentQuarter':
        const quarter = Math.floor(now.getMonth() / 3)
        return new Date(now.getFullYear(), quarter * 3, 1)
      case 'lastQuarter':
        const lastQuarter = Math.floor((now.getMonth() - 3) / 3)
        return new Date(now.getFullYear(), lastQuarter * 3, 1)
      default:
        return new Date(now.getFullYear(), now.getMonth(), 1)
    }
  }

  // Calculate current period payroll
  const currentPayroll = useMemo(() => {
    const periodStart = getPeriodStart(selectedPeriod)
    const periodEnd = new Date()
    
    return employees.map(emp => {
      const empTimesheets = timesheets.filter(
        t => t.name === emp.name && 
        new Date(t.timestamp) >= periodStart &&
        new Date(t.timestamp) <= periodEnd
      )
      
      // Calculate hours worked
      const inOutPairs = pairTimesheetEntries(empTimesheets)
      const totalMinutes = inOutPairs.reduce((sum, pair) => {
        const duration = Math.abs(new Date(pair.out) - new Date(pair.in)) / (1000 * 60)
        return sum + duration
      }, 0)
      
      const totalHours = totalMinutes / 60
      const regularHours = Math.min(totalHours, salaryConfig.minimumHours)
      const overtimeHours = Math.max(0, totalHours - salaryConfig.minimumHours)
      
      const baseSalary = regularHours * salaryConfig.hourlyRate
      const overtime = overtimeHours * salaryConfig.overtimeRate
      
      // Add bonuses based on timesheet data
      const bonuses = calculateBonuses(empTimesheets)
      
      // Calculate advances for this employee
      const employeeAdvances = advances.filter(a => 
        a.employeeId === emp.id && 
        a.status === 'approved' && 
        !a.deductedFrom
      )
      const totalAdvances = employeeAdvances.reduce((sum, a) => sum + a.amount, 0)
      
      const deductions = Math.round(baseSalary * 0.05) // 5% deduction
      
      return {
        employeeId: emp.id,
        employeeName: emp.name,
        baseSalary: Math.round(baseSalary),
        overtime: Math.round(overtime),
        bonuses: Math.round(bonuses),
        advances: totalAdvances,
        deductions: deductions,
        netPay: Math.round(baseSalary + overtime + bonuses - deductions - totalAdvances),
        totalHours: Math.round(totalHours),
        regularHours: Math.round(regularHours),
        overtimeHours: Math.round(overtimeHours),
        status: 'pending'
      }
    })
  }, [employees, timesheets, salaryConfig, selectedPeriod, advances])

  const stats = {
    totalEmployees: employees.length,
    activeEmployees: employees.filter(e => e.isActive !== false).length,
    totalPayroll: currentPayroll.reduce((sum, p) => sum + p.netPay, 0),
    pendingPayroll: payrollHistory.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.netPay, 0),
    averageHours: currentPayroll.reduce((sum, p) => sum + p.totalHours, 0) / currentPayroll.length || 0,
    overtimeHours: currentPayroll.reduce((sum, p) => sum + p.overtimeHours, 0),
    totalBonuses: currentPayroll.reduce((sum, p) => sum + p.bonuses, 0),
    averageSalary: currentPayroll.reduce((sum, p) => sum + p.netPay, 0) / currentPayroll.length || 0
  }

  const handleProcessPayroll = () => {
    const processed = currentPayroll.map(p => ({
      ...p,
      id: crypto.randomUUID(),
      period: selectedPeriod,
      status: 'paid',
      paymentDate: new Date()
    }))
    setPayrollHistory([...processed, ...payrollHistory])
    toast.success(`Payroll processed for ${processed.length} employees!`)
  }

  const handleExportPayroll = () => {
    const csv = [
      ['Employee', 'Base Salary', 'Overtime', 'Bonuses', 'Deductions', 'Net Pay', 'Hours Worked'],
      ...currentPayroll.map(p => [
        p.employeeName,
        `$${p.baseSalary}`,
        `$${p.overtime}`,
        `$${p.bonuses}`,
        `$${p.deductions}`,
        `$${p.netPay}`,
        p.totalHours
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `payroll_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Payroll exported successfully!')
  }

  const handleDownloadPayslip = (payroll) => {
    const employee = employees.find(e => e.id === payroll.employeeId)
    const periodStart = getPeriodStart(selectedPeriod)
    const periodEnd = new Date()
    
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Payslip - ${payroll.employeeName}</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .payslip {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      border-bottom: 3px solid #667eea;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .company-name {
      font-size: 28px;
      font-weight: bold;
      color: #667eea;
      margin-bottom: 10px;
    }
    .company-address {
      color: #666;
      font-size: 14px;
      line-height: 1.6;
    }
    .employee-info {
      background: #f9fafb;
      padding: 20px;
      border-radius: 6px;
      margin-bottom: 30px;
    }
    .employee-info h2 {
      margin: 0 0 15px 0;
      color: #333;
      font-size: 24px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
    }
    .info-label {
      color: #666;
      font-weight: 600;
    }
    .info-value {
      color: #333;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 30px 0;
    }
    table td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    table td:first-child {
      font-weight: 600;
      color: #666;
    }
    table td:last-child {
      text-align: right;
      font-weight: 600;
      color: #333;
    }
    .earnings { color: #10b981; }
    .deductions { color: #ef4444; }
    .total-row {
      background: #667eea;
      color: white;
      font-weight: bold;
      font-size: 18px;
    }
    .total-row td {
      border: none;
      padding: 15px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    .period {
      text-align: center;
      margin: 20px 0;
      font-size: 18px;
      font-weight: 600;
      color: #667eea;
    }
    @media print {
      body { background: white; }
      .payslip { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="payslip">
    <div class="header">
      <div class="company-name">${currentOrganization?.name || 'Your Company'}</div>
      <div class="company-address">
        ${currentOrganization?.address || '123 Business Street'}<br>
        ${currentOrganization?.phone || 'Phone: (555) 123-4567'}<br>
        ${currentOrganization?.email || 'Email: hr@company.com'}
      </div>
    </div>

    <div class="period">
      PAYSLIP - ${periodStart.toLocaleDateString()} to ${periodEnd.toLocaleDateString()}
    </div>

    <div class="employee-info">
      <h2>${payroll.employeeName}</h2>
      <div class="info-row">
        <span class="info-label">Employee ID:</span>
        <span class="info-value">${payroll.employeeId}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Department:</span>
        <span class="info-value">${employee?.role || 'N/A'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Pay Frequency:</span>
        <span class="info-value">${salaryConfig.payFrequency.charAt(0).toUpperCase() + salaryConfig.payFrequency.slice(1)}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Pay Date:</span>
        <span class="info-value">${new Date().toLocaleDateString()}</span>
      </div>
    </div>

    <table>
      <tr>
        <td>Regular Hours</td>
        <td>${payroll.regularHours}h</td>
      </tr>
      <tr>
        <td>Overtime Hours</td>
        <td>${payroll.overtimeHours}h</td>
      </tr>
      <tr>
        <td>Total Hours Worked</td>
        <td>${payroll.totalHours}h</td>
      </tr>
    </table>

    <table>
      <tr>
        <td colspan="2" style="font-weight: bold; background: #f9fafb; padding: 15px;">
          EARNINGS
        </td>
      </tr>
      <tr>
        <td>Base Salary</td>
        <td class="earnings">${currencySymbol}${payroll.baseSalary.toLocaleString()}</td>
      </tr>
      <tr>
        <td>Overtime Pay</td>
        <td class="earnings">${currencySymbol}${payroll.overtime.toLocaleString()}</td>
      </tr>
      <tr>
        <td>Bonuses</td>
        <td class="earnings">${currencySymbol}${payroll.bonuses.toLocaleString()}</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">Gross Earnings</td>
        <td style="font-weight: bold;">${currencySymbol}${(payroll.baseSalary + payroll.overtime + payroll.bonuses).toLocaleString()}</td>
      </tr>
    </table>

    <table>
      <tr>
        <td colspan="2" style="font-weight: bold; background: #f9fafb; padding: 15px;">
          DEDUCTIONS
        </td>
      </tr>
      ${payroll.advances > 0 ? `
      <tr>
        <td>Salary Advances</td>
        <td class="deductions">-${currencySymbol}${payroll.advances.toLocaleString()}</td>
      </tr>
      ` : ''}
      <tr>
        <td>Other Deductions</td>
        <td class="deductions">-${currencySymbol}${payroll.deductions.toLocaleString()}</td>
      </tr>
      <tr>
        <td style="font-weight: bold;">Total Deductions</td>
        <td class="deductions" style="font-weight: bold;">-${currencySymbol}${(payroll.advances + payroll.deductions).toLocaleString()}</td>
      </tr>
    </table>

    <table>
      <tr class="total-row">
        <td>NET PAY</td>
        <td>${currencySymbol}${payroll.netPay.toLocaleString()}</td>
      </tr>
    </table>

    <div class="footer">
      <p>This is a computer-generated payslip and does not require a signature.</p>
      <p>For queries, contact HR Department</p>
    </div>
  </div>
</body>
</html>
    `
    
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Payslip_${payroll.employeeName.replace(/\s+/g, '_')}_${selectedPeriod}.html`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Payslip generated successfully!')
  }

  const handleApproveAdvance = (advanceId) => {
    setAdvances(advances.map(a => 
      a.id === advanceId 
        ? { ...a, status: 'approved', approvedDate: new Date(), approvedBy: 'Admin' }
        : a
    ))
    toast.success('Advance approved successfully!')
  }

  const handleRejectAdvance = (advanceId) => {
    setAdvances(advances.map(a => 
      a.id === advanceId 
        ? { ...a, status: 'rejected', approvedBy: null, approvedDate: null }
        : a
    ))
    toast.error('Advance rejected')
  }

  const handleSaveAdvance = () => {
    const newAdvance = {
      id: crypto.randomUUID(),
      employeeId: advanceForm.employeeId,
      employeeName: advanceForm.employeeName,
      amount: parseFloat(advanceForm.amount),
      requestedDate: new Date(),
      requestedBy: 'Employee',
      status: 'pending',
      approvedDate: null,
      approvedBy: null,
      deductedFrom: null,
      notes: advanceForm.notes
    }
    setAdvances([newAdvance, ...advances])
    setShowAdvanceForm(false)
    setAdvanceForm({ employeeId: '', employeeName: '', amount: '', notes: '' })
    toast.success('Advance request submitted!')
  }

  const periodOptions = [
    { value: 'currentMonth', label: 'Current Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'currentQuarter', label: 'Current Quarter' },
    { value: 'lastQuarter', label: 'Last Quarter' },
  ]

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/20 to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              HR & Payroll Management
            </h1>
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive workforce and salary management system
            </p>
            <span className="badge badge-secondary">
              Pay: {salaryConfig.payFrequency === 'weekly' && 'Weekly'}
              {salaryConfig.payFrequency === 'biWeekly' && 'Bi-Weekly'}
              {salaryConfig.payFrequency === 'semiMonthly' && 'Semi-Monthly'}
              {salaryConfig.payFrequency === 'monthly' && 'Monthly'}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="select"
          >
            {periodOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <button 
            onClick={handleExportPayroll}
            className="btn btn-secondary gap-2"
          >
            <DownloadIcon className="h-4 w-4" />
            Export
          </button>
          <button 
            onClick={handleProcessPayroll}
            className="btn btn-primary gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <CreditCard className="h-4 w-4" />
            Process Payroll
          </button>
        </div>
      </motion.div>

      {/* Stats Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="card p-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <Users className="h-8 w-8 opacity-90" />
            <TrendingUp className="h-5 w-5 opacity-70" />
          </div>
          <p className="text-sm opacity-90 mb-1">Active Employees</p>
          <p className="text-3xl font-bold">{stats.activeEmployees}</p>
          <p className="text-xs opacity-75 mt-2">{stats.totalEmployees} total workforce</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="card p-6 bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="h-8 w-8 opacity-90" />
            <ArrowUp className="h-5 w-5 opacity-70" />
          </div>
          <p className="text-sm opacity-90 mb-1">Total Payroll</p>
          <p className="text-3xl font-bold">${stats.totalPayroll.toLocaleString()}</p>
          <p className="text-xs opacity-75 mt-2">{currentPayroll.length} employees</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="card p-6 bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <Clock className="h-8 w-8 opacity-90" />
            <ClockIcon className="h-5 w-5 opacity-70" />
          </div>
          <p className="text-sm opacity-90 mb-1">Avg Hours/Employee</p>
          <p className="text-3xl font-bold">{stats.averageHours.toFixed(1)}h</p>
          <p className="text-xs opacity-75 mt-2">{stats.overtimeHours}h overtime</p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="card p-6 bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <Award className="h-8 w-8 opacity-90" />
            <Star className="h-5 w-5 opacity-70" />
          </div>
          <p className="text-sm opacity-90 mb-1">Total Bonuses</p>
          <p className="text-3xl font-bold">${stats.totalBonuses.toLocaleString()}</p>
          <p className="text-xs opacity-75 mt-2">Average: ${stats.averageSalary.toFixed(0)}</p>
        </motion.div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 border-b border-gray-200 dark:border-gray-700"
      >
        {['overview', 'payroll', 'advances', 'employees', 'config'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === tab
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2 space-y-6">
              <div className="card shadow-xl">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-purple-600" />
                  Salary Distribution
                </h3>
                <div className="space-y-3">
                  {currentPayroll
                    .sort((a, b) => b.netPay - a.netPay)
                    .slice(0, 10)
                    .map((payroll, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">{payroll.employeeName}</span>
                            <span className="text-lg font-bold text-purple-600">${payroll.netPay.toLocaleString()}</span>
                          </div>
                          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(payroll.netPay / stats.totalPayroll) * 100}%` }}
                              transition={{ duration: 1, delay: idx * 0.1 }}
                              className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="card shadow-xl">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-blue-600" />
                  Payroll Breakdown
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      ${currentPayroll.reduce((sum, p) => sum + p.baseSalary, 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">Base Salary</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                    <Clock className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      ${currentPayroll.reduce((sum, p) => sum + p.overtime, 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">Overtime</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <Award className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      ${currentPayroll.reduce((sum, p) => sum + p.bonuses, 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">Bonuses</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card shadow-xl">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Quick Stats
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Total Hours</p>
                    <p className="text-2xl font-bold">{stats.averageHours.toFixed(1)}h avg</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Pending Payroll</p>
                    <p className="text-2xl font-bold">${stats.pendingPayroll.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Average Salary</p>
                    <p className="text-2xl font-bold">${stats.averageSalary.toFixed(0)}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'payroll' && (
          <motion.div
            key="payroll"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="card shadow-xl">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                Current Payroll ({selectedPeriod})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Employee</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Hours</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Base</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Overtime</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Bonuses</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Advances</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Deductions</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Net Pay</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentPayroll.map((payroll, idx) => (
                      <motion.tr
                        key={idx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.05 }}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <td className="py-4 px-4">
                          <div className="font-semibold">{payroll.employeeName}</div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="font-medium">{payroll.totalHours}h</div>
                          <div className="text-xs text-gray-500">{payroll.overtimeHours}h OT</div>
                        </td>
                        <td className="py-4 px-4 text-right font-semibold">${payroll.baseSalary.toLocaleString()}</td>
                        <td className="py-4 px-4 text-right text-orange-600 font-semibold">${payroll.overtime.toLocaleString()}</td>
                        <td className="py-4 px-4 text-right text-green-600 font-semibold">${payroll.bonuses.toLocaleString()}</td>
                        <td className="py-4 px-4 text-right font-semibold">
                          {payroll.advances > 0 ? (
                            <span className="text-red-500">-${payroll.advances.toLocaleString()}</span>
                          ) : (
                            <span className="text-gray-400">$0</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right text-red-600 font-semibold">-${payroll.deductions.toLocaleString()}</td>
                        <td className="py-4 px-4 text-right">
                          <div className="font-bold text-lg text-purple-600">${payroll.netPay.toLocaleString()}</div>
                        </td>
                        <td className="py-4 px-4">
                          <button
                            onClick={() => handleDownloadPayslip(payroll)}
                            className="btn btn-sm btn-secondary"
                            title="Download Payslip"
                          >
                            <DownloadIcon className="h-4 w-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <td className="py-4 px-4 font-bold text-gray-900 dark:text-gray-100">TOTAL</td>
                      <td className="py-4 px-4 text-right font-bold">{currentPayroll.reduce((sum, p) => sum + p.totalHours, 0).toFixed(0)}h</td>
                      <td className="py-4 px-4 text-right font-bold">${currentPayroll.reduce((sum, p) => sum + p.baseSalary, 0).toLocaleString()}</td>
                      <td className="py-4 px-4 text-right font-bold text-orange-600">${currentPayroll.reduce((sum, p) => sum + p.overtime, 0).toLocaleString()}</td>
                      <td className="py-4 px-4 text-right font-bold text-green-600">${currentPayroll.reduce((sum, p) => sum + p.bonuses, 0).toLocaleString()}</td>
                      <td className="py-4 px-4 text-right font-bold text-red-500">-${currentPayroll.reduce((sum, p) => sum + p.advances, 0).toLocaleString()}</td>
                      <td className="py-4 px-4 text-right font-bold text-red-600">-${currentPayroll.reduce((sum, p) => sum + p.deductions, 0).toLocaleString()}</td>
                      <td className="py-4 px-4 text-right font-bold text-2xl text-purple-600">${stats.totalPayroll.toLocaleString()}</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="card shadow-xl">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <History className="h-5 w-5 text-blue-600" />
                Payroll History
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold">Period</th>
                      <th className="text-left py-3 px-4 font-semibold">Employee</th>
                      <th className="text-right py-3 px-4 font-semibold">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 font-semibold">Payment Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrollHistory.map((entry) => (
                      <tr key={entry.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-4 px-4">{entry.period}</td>
                        <td className="py-4 px-4 font-semibold">{entry.employeeName}</td>
                        <td className="py-4 px-4 text-right font-bold text-purple-600">${entry.netPay.toLocaleString()}</td>
                        <td className="py-4 px-4">
                          <span className={`badge ${
                            entry.status === 'paid' ? 'badge-success' : 'badge-warning'
                          }`}>
                            {entry.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-500">
                          {entry.paymentDate ? new Date(entry.paymentDate).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'employees' && (
          <motion.div
            key="employees"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="card shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Employee Performance & Details
                </h3>
                <div className="flex gap-2">
                  <button className="btn btn-secondary gap-2">
                    <Download className="h-4 w-4" />
                    Export
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {employees.map((employee, idx) => {
                  const payroll = currentPayroll.find(p => p.employeeId === employee.id)
                  
                  return (
                    <motion.div
                      key={employee.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-lg transition-all bg-white dark:bg-gray-800"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="font-bold text-lg">{employee.name}</div>
                          <div className="text-sm text-gray-500">{employee.role}</div>
                        </div>
                        {employee.isActive !== false ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      
                      {payroll && (
                        <div className="space-y-3">
                          <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Monthly Earnings</p>
                            <p className="text-2xl font-bold text-purple-600">${payroll.netPay.toLocaleString()}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                              <p className="text-xs text-gray-500">Hours</p>
                              <p className="font-semibold">{payroll.totalHours}h</p>
                            </div>
                            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                              <p className="text-xs text-gray-500">Overtime</p>
                              <p className="font-semibold">{payroll.overtimeHours}h</p>
                            </div>
                          </div>
                          
                          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Base Salary:</span>
                              <span className="font-semibold">${payroll.baseSalary.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Overtime:</span>
                              <span className="font-semibold text-orange-600">${payroll.overtime.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Bonuses:</span>
                              <span className="font-semibold text-green-600">${payroll.bonuses.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'advances' && (
          <motion.div
            key="advances"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="card shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                  Salary Advance Management
                </h3>
                <button 
                  className="btn btn-primary gap-2"
                  onClick={() => setShowAdvanceForm(true)}
                >
                  <Plus className="h-4 w-4" />
                  New Advance Request
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold">Employee</th>
                      <th className="text-right py-3 px-4 font-semibold">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold">Requested</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 font-semibold">Deducted From</th>
                      <th className="text-left py-3 px-4 font-semibold">Notes</th>
                      <th className="text-left py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {advances.map((advance) => (
                      <tr key={advance.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-4 px-4 font-semibold">{advance.employeeName}</td>
                        <td className="py-4 px-4 text-right font-bold text-purple-600">${advance.amount.toLocaleString()}</td>
                        <td className="py-4 px-4 text-gray-500">{new Date(advance.requestedDate).toLocaleDateString()}</td>
                        <td className="py-4 px-4">
                          <span className={`badge ${
                            advance.status === 'approved' ? 'badge-success' : 
                            advance.status === 'rejected' ? 'badge-danger' : 
                            'badge-warning'
                          }`}>
                            {advance.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-500">
                          {advance.deductedFrom || '-'}
                        </td>
                        <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">{advance.notes}</td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            {advance.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleApproveAdvance(advance.id)}
                                  className="btn btn-success btn-sm"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleRejectAdvance(advance.id)}
                                  className="btn btn-danger btn-sm"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'config' && (
          <motion.div
            key="config"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto"
          >
            <div className="card shadow-xl">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-600" />
                Salary Configuration
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="label">Hourly Rate ($)</label>
                  <input
                    type="number"
                    className="input"
                    value={salaryConfig.hourlyRate}
                    onChange={(e) => setSalaryConfig({ ...salaryConfig, hourlyRate: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="label">Overtime Rate ($)</label>
                  <input
                    type="number"
                    className="input"
                    value={salaryConfig.overtimeRate}
                    onChange={(e) => setSalaryConfig({ ...salaryConfig, overtimeRate: parseFloat(e.target.value) })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {((salaryConfig.overtimeRate / salaryConfig.hourlyRate) * 100).toFixed(0)}% of hourly rate
                  </p>
                </div>
                <div>
                  <label className="label">Night Shift Bonus ($/hr)</label>
                  <input
                    type="number"
                    className="input"
                    value={salaryConfig.nightShiftBonus}
                    onChange={(e) => setSalaryConfig({ ...salaryConfig, nightShiftBonus: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="label">Weekend Bonus ($/hr)</label>
                  <input
                    type="number"
                    className="input"
                    value={salaryConfig.weekendBonus}
                    onChange={(e) => setSalaryConfig({ ...salaryConfig, weekendBonus: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="label">Minimum Hours/Month</label>
                  <input
                    type="number"
                    className="input"
                    value={salaryConfig.minimumHours}
                    onChange={(e) => setSalaryConfig({ ...salaryConfig, minimumHours: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="label">Pay Frequency</label>
                  <select
                    className="select"
                    value={salaryConfig.payFrequency}
                    onChange={(e) => setSalaryConfig({ ...salaryConfig, payFrequency: e.target.value })}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="biWeekly">Bi-Weekly (Every 2 Weeks)</option>
                    <option value="semiMonthly">Semi-Monthly (Twice a Month)</option>
                    <option value="monthly">Monthly</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {salaryConfig.payFrequency === 'weekly' && 'Employees paid every week'}
                    {salaryConfig.payFrequency === 'biWeekly' && 'Employees paid every 2 weeks'}
                    {salaryConfig.payFrequency === 'semiMonthly' && 'Employees paid twice a month (e.g., 1st and 15th)'}
                    {salaryConfig.payFrequency === 'monthly' && 'Employees paid once a month'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    toast.success('Configuration saved!')
                  }}
                  className="btn btn-primary w-full"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Advance Form Modal */}
      <AnimatePresence>
        {showAdvanceForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Request Salary Advance
                </h2>
                <button
                  onClick={() => setShowAdvanceForm(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">Employee *</label>
                  <select
                    className="select"
                    value={advanceForm.employeeId}
                    onChange={(e) => {
                      const emp = employees.find(em => em.id === e.target.value)
                      setAdvanceForm({
                        ...advanceForm,
                        employeeId: e.target.value,
                        employeeName: emp?.name || ''
                      })
                    }}
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.filter(e => e.isActive !== false).map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Amount ($) *</label>
                  <input
                    type="number"
                    className="input"
                    value={advanceForm.amount}
                    onChange={(e) => setAdvanceForm({ ...advanceForm, amount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <label className="label">Reason/Notes</label>
                  <textarea
                    className="input"
                    rows="3"
                    value={advanceForm.notes}
                    onChange={(e) => setAdvanceForm({ ...advanceForm, notes: e.target.value })}
                    placeholder="Please provide a reason for the advance request..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowAdvanceForm(false)
                      setAdvanceForm({ employeeId: '', employeeName: '', amount: '', notes: '' })
                    }} 
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button type="button" onClick={handleSaveAdvance} className="btn btn-primary flex-1">
                    Submit Request
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const History = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

