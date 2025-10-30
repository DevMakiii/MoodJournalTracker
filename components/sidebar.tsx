"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Home, FileText, BarChart3, Bot, Settings, LogOut, Menu, X } from "lucide-react"
import { useIsMobile } from "@/components/ui/use-mobile"

interface SidebarProps {
  currentPage?: string
}

export function Sidebar({ currentPage }: SidebarProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const isMobile = useIsMobile()

  const menuItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/entries", icon: FileText, label: "Entries" },
    { href: "/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/assistant", icon: Bot, label: "Assistant" },
  ]

  if (isMobile) {
    return (
      <>
        {/* Mobile Menu Button */}
        <div className="fixed top-4 left-4 z-50 md:hidden">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="bg-card shadow-lg"
          >
            {isMobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setIsMobileOpen(false)} />
        )}

        {/* Mobile Sidebar */}
        <aside
          className={`fixed top-0 left-0 z-50 h-full bg-card shadow-lg transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
            isMobileOpen ? "translate-x-0" : "-translate-x-full"
          } w-40`}
        >
          <div className="p-4 border-b">
            <h1 className="font-bold text-foreground text-center">Serenote</h1>
          </div>

          <nav className="flex flex-col gap-2 px-4 py-4">
            {menuItems.map((item) => {
              const IconComponent = item.icon
              return (
                <Link key={item.href} href={item.href} onClick={() => setIsMobileOpen(false)}>
                  <Button
                    variant={currentPage === item.href ? "default" : "outline"}
                    className="w-full justify-start px-4 gap-3"
                  >
                    <IconComponent className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </nav>

          <div className="mt-auto p-4 space-y-2 border-t">
            <div className="flex justify-start">
              <ThemeToggle />
            </div>
            <Link href="/settings" onClick={() => setIsMobileOpen(false)}>
              <Button variant="outline" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
            <form action="/auth/logout" method="POST">
              <Button
                variant="outline"
                className="w-full justify-start px-4 gap-3"
                type="submit"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </form>
          </div>
        </aside>
      </>
    )
  }

  return (
    <aside
      className={`sticky top-0 bg-card shadow-sm transition-all duration-300 ease-in-out flex flex-col h-screen ${
        isHovered ? "w-40" : "w-12"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-4">
        <h1 className={`font-bold text-foreground text-center transition-opacity duration-300 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}>
          {isHovered ? "Serenote" : ""}
        </h1>
      </div>

      <nav className="flex flex-col gap-2 flex-1 px-2">
        {menuItems.map((item) => {
          const IconComponent = item.icon
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={currentPage === item.href ? "default" : "outline"}
                className={`w-full transition-all duration-300 items-center ${
                  isHovered ? "justify-start px-4 gap-2" : "justify-center px-2 gap-0"
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span className={`ml-2 transition-opacity duration-300 ${
                  isHovered ? "opacity-100" : "opacity-0 hidden"
                }`}>
                  {isHovered ? item.label : ""}
                </span>
              </Button>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto p-2 space-y-2">
        <div className={`transition-opacity duration-300 ${
          isHovered ? "opacity-100" : "opacity-50"
        }`}>
          <ThemeToggle />
        </div>
        <Link href="/settings">
          <Button
            variant="outline"
            size="icon"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </Link>
        <form action="/auth/logout" method="POST" className="mt-4">
          <Button
            variant="outline"
            className={`w-full transition-all duration-300 ${
              isHovered ? "justify-start px-4" : "justify-center px-2"
            }`}
            type="submit"
          >
            <LogOut className="w-4 h-4" />
            <span className={`ml-2 transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0 hidden"
            }`}>
              {isHovered ? "Logout" : ""}
            </span>
          </Button>
        </form>
      </div>
    </aside>
  )
}