'use client'

import { useState, useMemo } from 'react'
import type { PSU } from '@/components/psu/psu-card'
import { PsuCard } from '@/components/psu/psu-card'
import { PsuFilterBar, type SortKey } from '@/components/psu/psu-filter-bar'
import { Building2, Briefcase, TrendingUp, IndianRupeeIcon } from 'lucide-react'

const PSU_DATA: PSU[] = [
  {
    id: 'iocl', name: 'IOCL', fullName: 'Indian Oil Corporation Limited', website: 'https://iocl.com',
    salaryRange: '₹15–25 LPA', salaryMin: 15,
    eligibility: 'GATE CSE/IT qualified. B.E./B.Tech in CSE/IT with min 60% marks.',
    recruitmentPeriod: 'Jan–Mar 2027', selectionProcess: 'GATE Score + Group Discussion + Personal Interview',
    vacancies: '120+', sector: 'Oil & Gas', status: 'active',
    expectedCutoffs: [
      { category: 'General (UR)', score: '750–800' },
      { category: 'EWS', score: '720–770' },
      { category: 'OBC (NCL)', score: '680–730' },
      { category: 'SC', score: '600–650' },
      { category: 'ST', score: '550–600' },
    ],
  },
  {
    id: 'gail', name: 'GAIL', fullName: 'GAIL (India) Limited', website: 'https://gailonline.com',
    salaryRange: '₹15–24 LPA', salaryMin: 15,
    eligibility: 'GATE CSE qualified. B.E./B.Tech in CSE/IT.',
    recruitmentPeriod: 'Feb–Apr 2027', selectionProcess: 'GATE Score + Group Discussion + Interview',
    vacancies: '80+', sector: 'Natural Gas', status: 'active',
    expectedCutoffs: [
      { category: 'General (UR)', score: '800–850' },
      { category: 'EWS', score: '770–820' },
      { category: 'OBC (NCL)', score: '730–780' },
      { category: 'SC', score: '640–690' },
      { category: 'ST', score: '580–630' },
    ],
  },
  {
    id: 'ntpc', name: 'NTPC', fullName: 'NTPC Limited', website: 'https://ntpc.co.in',
    salaryRange: '₹18–30 LPA', salaryMin: 18,
    eligibility: 'GATE CSE qualified. B.E./B.Tech with min 65% marks.',
    recruitmentPeriod: 'Mar–May 2027', selectionProcess: 'GATE Score + Personal Interview',
    vacancies: '150+', sector: 'Power', status: 'upcoming',
    expectedCutoffs: [
      { category: 'General (UR)', score: '750–800' },
      { category: 'EWS', score: '720–770' },
      { category: 'OBC (NCL)', score: '680–730' },
      { category: 'SC', score: '580–630' },
      { category: 'ST', score: '520–570' },
    ],
  },
  {
    id: 'ongc', name: 'ONGC', fullName: 'Oil and Natural Gas Corporation', website: 'https://ongcindia.com',
    salaryRange: '₹20–35 LPA', salaryMin: 20,
    eligibility: 'GATE CSE qualified. B.E./B.Tech in relevant discipline.',
    recruitmentPeriod: 'Apr–Jun 2027', selectionProcess: 'GATE Score + Group Discussion + Interview',
    vacancies: '200+', sector: 'Oil & Gas', status: 'upcoming',
    expectedCutoffs: [
      { category: 'General (UR)', score: '850–900' },
      { category: 'EWS', score: '820–870' },
      { category: 'OBC (NCL)', score: '780–830' },
      { category: 'SC', score: '680–730' },
      { category: 'ST', score: '600–650' },
    ],
  },
  {
    id: 'bhel', name: 'BHEL', fullName: 'Bharat Heavy Electricals Limited', website: 'https://bhel.com',
    salaryRange: '₹12–20 LPA', salaryMin: 12,
    eligibility: 'GATE CSE qualified. B.E./B.Tech with min 60%.',
    recruitmentPeriod: 'Jan–Mar 2027', selectionProcess: 'GATE Score + Personal Interview',
    vacancies: '100+', sector: 'Engineering', status: 'active',
    expectedCutoffs: [
      { category: 'General (UR)', score: '700–750' },
      { category: 'EWS', score: '680–730' },
      { category: 'OBC (NCL)', score: '640–690' },
      { category: 'SC', score: '540–590' },
      { category: 'ST', score: '480–530' },
    ],
  },
  {
    id: 'pgcil', name: 'PGCIL', fullName: 'Power Grid Corporation of India', website: 'https://powergridindia.com',
    salaryRange: '₹16–28 LPA', salaryMin: 16,
    eligibility: 'GATE CSE qualified. B.E./B.Tech in CSE/IT.',
    recruitmentPeriod: 'May–Jul 2027', selectionProcess: 'GATE Score + Personal Interview',
    vacancies: '90+', sector: 'Power', status: 'upcoming',
    expectedCutoffs: [
      { category: 'General (UR)', score: '750–800' },
      { category: 'EWS', score: '720–770' },
      { category: 'OBC (NCL)', score: '680–730' },
      { category: 'SC', score: '580–630' },
      { category: 'ST', score: '520–570' },
    ],
  },
  {
    id: 'hpcl', name: 'HPCL', fullName: 'Hindustan Petroleum Corporation', website: 'https://hpcl.in',
    salaryRange: '₹15–25 LPA', salaryMin: 15,
    eligibility: 'GATE CSE qualified. B.E./B.Tech with min 60% marks.',
    recruitmentPeriod: 'Feb–Apr 2027', selectionProcess: 'GATE Score + Group Discussion + Interview',
    vacancies: '70+', sector: 'Oil & Gas', status: 'active',
    expectedCutoffs: [
      { category: 'General (UR)', score: '800–850' },
      { category: 'EWS', score: '770–820' },
      { category: 'OBC (NCL)', score: '740–790' },
      { category: 'SC', score: '640–690' },
      { category: 'ST', score: '580–630' },
    ],
  },
  {
    id: 'bpcl', name: 'BPCL', fullName: 'Bharat Petroleum Corporation', website: 'https://bharatpetroleum.in',
    salaryRange: '₹15–25 LPA', salaryMin: 15,
    eligibility: 'GATE CSE qualified. B.E./B.Tech in CSE/IT.',
    recruitmentPeriod: 'Feb–Apr 2027', selectionProcess: 'GATE Score + Group Discussion + Interview',
    vacancies: '60+', sector: 'Oil & Gas', status: 'active',
    expectedCutoffs: [
      { category: 'General (UR)', score: '780–830' },
      { category: 'EWS', score: '750–800' },
      { category: 'OBC (NCL)', score: '720–770' },
      { category: 'SC', score: '620–670' },
      { category: 'ST', score: '560–610' },
    ],
  },
  {
    id: 'hal', name: 'HAL', fullName: 'Hindustan Aeronautics Limited', website: 'https://hal-india.co.in',
    salaryRange: '₹14–22 LPA', salaryMin: 14,
    eligibility: 'GATE CSE qualified. B.E./B.Tech with min 65%.',
    recruitmentPeriod: 'Mar–May 2027', selectionProcess: 'GATE Score + Personal Interview',
    vacancies: '50+', sector: 'Aerospace', status: 'upcoming',
    expectedCutoffs: [
      { category: 'General (UR)', score: '700–750' },
      { category: 'EWS', score: '680–730' },
      { category: 'OBC (NCL)', score: '640–690' },
      { category: 'SC', score: '540–590' },
      { category: 'ST', score: '480–530' },
    ],
  },
  {
    id: 'npcil', name: 'NPCIL', fullName: 'Nuclear Power Corporation of India', website: 'https://npcil.nic.in',
    salaryRange: '₹12–20 LPA', salaryMin: 12,
    eligibility: 'GATE CSE qualified. B.E./B.Tech with min 60%.',
    recruitmentPeriod: 'Jun–Aug 2027', selectionProcess: 'GATE Score + Personal Interview + Medical',
    vacancies: '40+', sector: 'Nuclear Energy', status: 'upcoming',
    expectedCutoffs: [
      { category: 'General (UR)', score: '800–850' },
      { category: 'EWS', score: '770–820' },
      { category: 'OBC (NCL)', score: '740–790' },
      { category: 'SC', score: '640–690' },
      { category: 'ST', score: '580–630' },
    ],
  },
  {
    id: 'cil', name: 'CIL', fullName: 'Coal India Limited', website: 'https://coalindia.in',
    salaryRange: '₹10–18 LPA', salaryMin: 10,
    eligibility: 'GATE CSE qualified. B.E./B.Tech in CSE/IT.',
    recruitmentPeriod: 'Apr–Jun 2027', selectionProcess: 'GATE Score + Personal Interview',
    vacancies: '80+', sector: 'Mining', status: 'upcoming',
    expectedCutoffs: [
      { category: 'General (UR)', score: '750–800' },
      { category: 'EWS', score: '720–770' },
      { category: 'OBC (NCL)', score: '680–730' },
      { category: 'SC', score: '580–630' },
      { category: 'ST', score: '520–570' },
    ],
  },
  {
    id: 'sail', name: 'SAIL', fullName: 'Steel Authority of India Limited', website: 'https://sail.co.in',
    salaryRange: '₹14–22 LPA', salaryMin: 14,
    eligibility: 'GATE CSE qualified. B.E./B.Tech with min 60%.',
    recruitmentPeriod: 'Jan–Mar 2027', selectionProcess: 'GATE Score + Group Discussion + Interview',
    vacancies: '90+', sector: 'Steel', status: 'active',
    expectedCutoffs: [
      { category: 'General (UR)', score: '800–850' },
      { category: 'EWS', score: '770–820' },
      { category: 'OBC (NCL)', score: '740–790' },
      { category: 'SC', score: '640–690' },
      { category: 'ST', score: '580–630' },
    ],
  },
  {
    id: 'indian-oil', name: 'Indian Oil', fullName: 'Indian Oil Corporation (Refineries)', website: 'https://iocl.com',
    salaryRange: '₹18–30 LPA', salaryMin: 18,
    eligibility: 'GATE CSE qualified. B.E./B.Tech with min 65% marks.',
    recruitmentPeriod: 'Feb–Apr 2027', selectionProcess: 'GATE Score + Group Discussion + Interview',
    vacancies: '100+', sector: 'Oil & Gas', status: 'active',
    expectedCutoffs: [
      { category: 'General (UR)', score: '750–800' },
      { category: 'EWS', score: '720–770' },
      { category: 'OBC (NCL)', score: '680–730' },
      { category: 'SC', score: '600–650' },
      { category: 'ST', score: '550–600' },
    ],
  },
  {
    id: 'power-grid', name: 'Power Grid', fullName: 'Power Grid Corporation (IT Wing)', website: 'https://powergridindia.com',
    salaryRange: '₹16–26 LPA', salaryMin: 16,
    eligibility: 'GATE CSE qualified. B.E./B.Tech in IT/CSE.',
    recruitmentPeriod: 'May–Jul 2027', selectionProcess: 'GATE Score + Personal Interview',
    vacancies: '45+', sector: 'Power', status: 'upcoming',
    expectedCutoffs: [
      { category: 'General (UR)', score: '750–800' },
      { category: 'EWS', score: '720–770' },
      { category: 'OBC (NCL)', score: '680–730' },
      { category: 'SC', score: '580–630' },
      { category: 'ST', score: '520–570' },
    ],
  },
  {
    id: 'coal-india', name: 'Coal India', fullName: 'Coal India Limited (Management Trainee)', website: 'https://coalindia.in',
    salaryRange: '₹10–18 LPA', salaryMin: 10,
    eligibility: 'GATE CSE qualified. B.E./B.Tech with min 60%.',
    recruitmentPeriod: 'Apr–Jun 2027', selectionProcess: 'GATE Score + Personal Interview',
    vacancies: '60+', sector: 'Mining', status: 'upcoming',
    expectedCutoffs: [
      { category: 'General (UR)', score: '750–800' },
      { category: 'EWS', score: '720–770' },
      { category: 'OBC (NCL)', score: '680–730' },
      { category: 'SC', score: '580–630' },
      { category: 'ST', score: '520–570' },
    ],
  },
]

function getSalaryNumber(psu: PSU): number {
  return psu.salaryMin
}

export default function PsuPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [salaryRange, setSalaryRange] = useState('all')
  const [sort, setSort] = useState<SortKey>('name')

  const filtered = useMemo(() => {
    let list = [...PSU_DATA]

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.fullName.toLowerCase().includes(q))
    }

    if (statusFilter !== 'all') {
      list = list.filter(p => p.status === statusFilter)
    }

    if (salaryRange !== 'all') {
      list = list.filter(p => {
        const s = p.salaryMin
        switch (salaryRange) {
          case 'below15': return s < 15
          case '15-25': return s >= 15 && s <= 25
          case '25-40': return s > 25 && s <= 40
          case 'above40': return s > 40
          default: return true
        }
      })
    }

    list.sort((a, b) => {
      switch (sort) {
        case 'name': return a.name.localeCompare(b.name)
        case 'salary': return b.salaryMin - a.salaryMin
        case 'status': {
          const order = { active: 0, upcoming: 1, closed: 2 }
          return order[a.status] - order[b.status]
        }
        default: return 0
      }
    })

    return list
  }, [search, statusFilter, salaryRange, sort])

  const stats = useMemo(() => {
    const total = PSU_DATA.length
    const active = PSU_DATA.filter(p => p.status === 'active').length
    const avgSalary = Math.round(PSU_DATA.reduce((s, p) => s + getSalaryNumber(p), 0) / total)
    return { total, active, avgSalary }
  }, [])

  return (
    <div className="mx-auto max-w-6xl space-y-5 p-4 md:p-6">
      <title>GATE 2027 PSU Recruitment Tracker & Cutoffs | GATE CSE</title>
      <meta name="description" content="Track PSU job opportunities recruiting through GATE 2027. Review expected GATE cutoffs, eligibility criteria, recruitment timelines, and packages." />
      <div>
        <h1 className="text-lg font-semibold text-foreground">PSU Recruitment Tracker</h1>
        <p className="text-xs text-muted-foreground">Track PSU recruitments through GATE 2027</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg border bg-card p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Building2 className="size-3.5" />
            Total PSUs
          </div>
          <p className="text-xl font-bold font-mono">{stats.total}</p>
        </div>
        <div className="rounded-lg border bg-card p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Briefcase className="size-3.5" />
            Active
          </div>
          <p className="text-xl font-bold font-mono text-green-600">{stats.active}</p>
        </div>
        <div className="rounded-lg border bg-card p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <TrendingUp className="size-3.5" />
            Your Matches
          </div>
          <p className="text-xl font-bold font-mono text-blue-600">{filtered.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <IndianRupeeIcon className="size-3.5" />
            Avg Salary
          </div>
          <p className="text-xl font-bold font-mono">₹{stats.avgSalary} LPA</p>
        </div>
      </div>

      <PsuFilterBar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        salaryRange={salaryRange}
        onSalaryRangeChange={setSalaryRange}
        sort={sort}
        onSortChange={setSort}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(psu => (
          <PsuCard key={psu.id} psu={psu} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-8">No PSUs match your filters.</p>
      )}
    </div>
  )
}
