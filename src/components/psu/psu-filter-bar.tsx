'use client'

import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { SearchIcon } from 'lucide-react'

export type SortKey = 'name' | 'salary' | 'status'

interface PsuFilterBarProps {
  search: string
  onSearchChange: (v: string) => void
  statusFilter: string
  onStatusFilterChange: (v: string) => void
  salaryRange: string
  onSalaryRangeChange: (v: string) => void
  sort: SortKey
  onSortChange: (v: SortKey) => void
}

export function PsuFilterBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  salaryRange,
  onSalaryRangeChange,
  sort,
  onSortChange,
}: PsuFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Search PSUs..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>
      <Select value={statusFilter} onValueChange={(v) => v && onStatusFilterChange(v)}>
        <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="upcoming">Upcoming</SelectItem>
          <SelectItem value="closed">Closed</SelectItem>
        </SelectContent>
      </Select>
      <Select value={salaryRange} onValueChange={(v) => v && onSalaryRangeChange(v)}>
        <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Salaries</SelectItem>
          <SelectItem value="below15">&lt; ₹15 LPA</SelectItem>
          <SelectItem value="15-25">₹15–25 LPA</SelectItem>
          <SelectItem value="25-40">₹25–40 LPA</SelectItem>
          <SelectItem value="above40">&gt; ₹40 LPA</SelectItem>
        </SelectContent>
      </Select>
      <Select value={sort} onValueChange={(v) => v && onSortChange(v as SortKey)}>
        <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="name">Sort: Name</SelectItem>
          <SelectItem value="salary">Sort: Salary</SelectItem>
          <SelectItem value="status">Sort: Status</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
