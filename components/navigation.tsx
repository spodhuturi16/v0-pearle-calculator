"use client"

import { Eye, Calculator, BarChart3, Users, Package, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface NavigationProps {
  userName: string
  storeName?: string
  currentPage?: string
}

export function Navigation({ userName, storeName, currentPage }: NavigationProps) {
  const navigationItems = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/calculator", label: "Glasses", icon: Eye },
    { href: "/contacts", label: "Contacts", icon: Calculator },
    { href: "/admin", label: "Management", icon: Users },
    { href: "/products", label: "Products", icon: Package },
  ]

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-semibold text-gray-900">Pearle Vision</span>
              {storeName && <div className="text-xs text-gray-500">{storeName}</div>}
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.href.slice(1)
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "text-emerald-600 border-b-2 border-emerald-600 pb-1"
                      : "text-gray-600 hover:text-emerald-600"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </a>
              )
            })}
          </nav>

          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm">
                      {userName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-700">{userName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <a href="/profile" className="flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Profile Settings
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
