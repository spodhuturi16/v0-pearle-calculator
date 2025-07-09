// app/admin/page.tsx
"use client"

import { useState, useEffect } from "react"
import {
  Users,
  Package,
  BarChart3,
  Settings,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  DollarSign,
  TrendingUp,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Navigation } from "@/components/navigation"
import { supabase } from "@/supabase-client.js"

// ... rest of the file remains the same
2. app/calculator/page.tsx
TypeScript

// app/calculator/page.tsx
"use client"

import { useState, useMemo, useEffect } from "react"
import { Calculator, ShoppingCart, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Navigation } from "@/components/navigation"
import { supabase } from "@/supabase-client.js"

export default function AdminPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [userName, setUserName] = useState("Admin User")
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);

  const fetchData = async () => {
      const componentsPromise = supabase.from('components').select('*');
      const usersPromise = supabase.functions.invoke('get-all-users');
      const salesPromise = supabase.from('sales').select('*').order('created_at', { ascending: false });

      const [componentsResult, usersResult, salesResult] = await Promise.all([componentsPromise, usersPromise, salesPromise]);

      if (componentsResult.error) console.error("Error fetching components:", componentsResult.error);
      else setProducts(componentsResult.data);

      if (usersResult.error) console.error("Error fetching users:", usersResult.error);
      else setUsers(usersResult.data);
      
      if (salesResult.error) console.error("Error fetching sales:", salesResult.error);
      else setQuotes(salesResult.data);
  }

  useEffect(() => {
    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { window.location.href = '/'; return; }
        
        const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single();
        if (!profile || profile.role !== 'owner') { window.location.href = '/calculator'; return; }
        
        setUserName(profile.full_name || user.email);
        fetchData();
    }
    checkUser();
  }, [])


  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.Item.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.Category === categoryFilter
    return matchesSearch && matchesCategory
  })
    
  const handleRemoveUser = async (userId: string) => {
      if(confirm('Are you sure you want to remove this user?')) {
        const { error } = await supabase.functions.invoke('delete-user', {
            body: { userId: userId }
        });
        if (error) alert(`Error deleting user: ${error.message}`);
        else {
            alert('User deleted successfully.');
            fetchData();
        }
      }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      <Navigation userName={userName} currentPage="admin" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Portal</h1>
          <p className="text-gray-600">Manage dashboard analytics, users, products, and system settings</p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4 bg-white border border-gray-200">
            <TabsTrigger
              value="dashboard"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">User Management</CardTitle>
                    <CardDescription>Manage opticians and administrators</CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>Create a new user account for the system.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="user-name">Full Name</Label>
                          <Input id="user-name" placeholder="Enter full name" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="user-email">Email</Label>
                          <Input id="user-email" type="email" placeholder="Enter email address" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="user-password">Password</Label>
                          <Input id="user-password" type="password" placeholder="Enter password" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="user-role">Role</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="optician">Optician</SelectItem>
                              <SelectItem value="owner">Owner</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Create User</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-gray-100 text-gray-600 text-sm">
                                {user.full_name
                                  ?.split(" ")
                                  .map((n:string) => n[0])
                                  .join("") || user.email.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.full_name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.role === "owner" ? "default" : "secondary"}>{user.role}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 bg-transparent"
                              onClick={() => handleRemoveUser(user.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
