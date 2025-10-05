"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Gift, LayoutDashboard, Users, Palette, Bell, ScanLine, BarChart3, QrCode } from "lucide-react"
import { cn } from "@/lib/utils"

export function AdminNav() {
  const pathname = usePathname()

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/customers", label: "Customers", icon: Users },
    { href: "/admin/qr-codes", label: "QR Codes", icon: QrCode },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/admin/card-designer", label: "Card Designer", icon: Palette },
    { href: "/admin/marketing", label: "Marketing", icon: Bell },
    { href: "/merchant", label: "Scan QR", icon: ScanLine },
  ]

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Gift className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">LoyaltyHub</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      size="sm"
                      className={cn("gap-2", isActive && "bg-primary/10 text-primary hover:bg-primary/20")}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm">
                Exit Admin
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
