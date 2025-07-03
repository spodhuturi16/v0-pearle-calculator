"use client"

import { useState } from "react"
import { DollarSign, Users, ShoppingCart, TrendingUp, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"

const mockQuotes = [
  { id: "Q-1024", customer: "Alice Johnson", type: "Glasses", total: 489.5, status: "Saved", date: "2024-07-15" },
  { id: "Q-1023", customer: "Bob Williams", type: "Contacts", total: 215.75, status: "Saved", date: "2024-07-15" },
  { id: "Q-1022", customer: "Charlie Brown", type: "Glasses", total: 620.0, status: "Invoiced", date: "2024-07-14" },
  { id: "Q-1021", customer: "Diana Prince", type: "Glasses", total: 350.25, status: "Saved", date: "2024-07-13" },
]

export default function DashboardPage() {
  const [userName] = useState("John Smith")
  const [storeName] = useState("Downtown Vision Center")

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      <Navigation userName={userName} storeName={storeName} currentPage="dashboard" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {userName.split(" ")[0]}!</h1>
          <p className="text-gray-600">Here's a summary of your activity for today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(620.0)}</div>
              <p className="text-xs text-muted-foreground">+5.2% from yesterday</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+3</div>
              <p className="text-xs text-muted-foreground">+150% from last week</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quotes Created</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+4</div>
              <p className="text-xs text-muted-foreground">+1 since yesterday</p>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">25%</div>
              <p className="text-xs text-muted-foreground">Quotes to Invoices</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Recent Quotes</CardTitle>
            <CardDescription>A list of your most recent quotes.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quote ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockQuotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">{quote.id}</TableCell>
                    <TableCell>{quote.customer}</TableCell>
                    <TableCell>{quote.type}</TableCell>
                    <TableCell>
                      <Badge variant={quote.status === "Saved" ? "secondary" : "default"}>{quote.status}</Badge>
                    </TableCell>
                    <TableCell>{quote.date}</TableCell>
                    <TableCell className="text-right">{formatCurrency(quote.total)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
