"use client"

import { useState } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Navbar } from "@/components/layout/navbar"

export function LayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col md:pl-[270px]">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="content-area flex-1">{children}</main>
      </div>
    </div>
  )
}
