// app/admin/page.tsx
"use client"

import { useState, useEffect } from "react"

// Force dynamic rendering to prevent build-time errors with authentication
export const dynamic = 'force-dynamic'
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

export default function AdminPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [userName, setUserName] = useState("Admin User")
  const [users, setUsers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);
  
  // Dashboard states
  const [allSales, setAllSales] = useState<any[]>([]);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [dateFilter, setDateFilter] = useState('30');
  const [storeFilter, setStoreFilter] = useState('all');
  const [kpis, setKpis] = useState({
    totalSales: 0,
    newCustomers: 0,
    quotesCreated: 0,
    conversionRate: 0,
  });
  const [recentQuotes, setRecentQuotes] = useState<any[]>([]);
  
  // Product form states
  const [newProductName, setNewProductName] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [customCategoryName, setCustomCategoryName] = useState("");
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);

  const fetchData = async () => {
      const componentsPromise = supabase.from('components').select('*');
      const usersPromise = supabase.functions.invoke('get-all-users');
      const salesPromise = supabase.from('sales').select('*').order('created_at', { ascending: false });
      const storesPromise = supabase.from('stores').select('*').order('name', { ascending: true });
      const userStoresPromise = supabase.from('store_assignments').select('optician_id, store_id');
      const profilesPromise = supabase.from('profiles').select('id, full_name');

      const [componentsResult, usersResult, salesResult, storesResult, userStoresResult, profilesResult] = await Promise.all([componentsPromise, usersPromise, salesPromise, storesPromise, userStoresPromise, profilesPromise]);

      if (componentsResult.error) console.error("Error fetching components:", componentsResult.error);
      else setProducts(componentsResult.data);

      if (usersResult.error) console.error("Error fetching users:", usersResult.error);
      else setUsers(usersResult.data);
      
      if (salesResult.error) console.error("Error fetching sales:", salesResult.error);
      else {
        setQuotes(salesResult.data);
        setAllSales(salesResult.data);
      }

      if (storesResult.error) console.error("Error fetching stores:", storesResult.error);
      else setStores(storesResult.data);

      if (userStoresResult.error) console.error("Error fetching user stores:", userStoresResult.error);
      else {
        // Group store assignments by user
        const assignments: {[key: string]: string[]} = {};
        userStoresResult.data?.forEach((assignment: any) => {
          if (!assignments[assignment.optician_id]) {
            assignments[assignment.optician_id] = [];
          }
          assignments[assignment.optician_id].push(assignment.store_id);
        });
        setUserStoreAssignments(assignments);
      }

      if (profilesResult.error) console.error("Error fetching profiles:", profilesResult.error);
      else setAllProfiles(profilesResult.data);
  }

  const handleAddProduct = async () => {
    const finalCategory = newProductCategory === "custom" ? customCategoryName : newProductCategory;
    
    if (!newProductName || !finalCategory || !newProductPrice) {
      alert("Please fill in all fields");
      return;
    }

    if (newProductCategory === "custom" && !customCategoryName.trim()) {
      alert("Please enter a category name");
      return;
    }

    try {
      const { error } = await supabase
        .from('components')
        .insert([
          {
            Item: newProductName,
            Category: finalCategory,
            Retail: parseFloat(newProductPrice),
            is_active: true,
            created_at: new Date().toISOString(),
          },
        ]);
      
      if (error) throw error;
      
      // Clear form and close dialog
      setNewProductName("");
      setNewProductCategory("");
      setNewProductPrice("");
      setCustomCategoryName("");
      setIsProductDialogOpen(false);
      
      // Refresh data
      await fetchData();
      alert("Product added successfully!");
    } catch (err) {
      console.error('Error adding product:', err);
      alert('Failed to add product. Please try again.');
    }
  };

  const handleEditProduct = async () => {
    const finalCategory = newProductCategory === "custom" ? customCategoryName : newProductCategory;
    
    if (!editingProduct || !newProductName || !finalCategory || !newProductPrice) {
      alert("Please fill in all fields");
      return;
    }

    if (newProductCategory === "custom" && !customCategoryName.trim()) {
      alert("Please enter a category name");
      return;
    }

    try {
      const { error } = await supabase
        .from('components')
        .update({
          Item: newProductName,
          Category: finalCategory,
          Retail: parseFloat(newProductPrice),
        })
        .eq('id', editingProduct.id);
      
      if (error) throw error;
      
      // Clear form and close dialog
      setNewProductName("");
      setNewProductCategory("");
      setNewProductPrice("");
      setCustomCategoryName("");
      setEditingProduct(null);
      setIsProductDialogOpen(false);
      
      // Refresh data
      await fetchData();
      alert("Product updated successfully!");
    } catch (err) {
      console.error('Error updating product:', err);
      alert('Failed to update product. Please try again.');
    }
  };

  const handleToggleProductStatus = async (productId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('components')
        .update({ is_active: !currentStatus })
        .eq('id', productId);
      
      if (error) throw error;
      
      // Update local state
      setProducts(products.map(product =>
        product.id === productId ? { ...product, is_active: !currentStatus } : product
      ));
    } catch (err) {
      console.error('Error toggling product status:', err);
      alert('Failed to update product status. Please try again.');
    }
  };

  const openProductDialog = (product?: any) => {
    if (product) {
      // Edit mode
      setEditingProduct(product);
      setNewProductName(product.Item);
      setNewProductCategory(product.Category);
      setNewProductPrice(product.Retail.toString());
    } else {
      // Add mode
      setEditingProduct(null);
      setNewProductName("");
      setNewProductCategory("");
      setNewProductPrice("");
    }
    setIsProductDialogOpen(true);
  };

  const closeProductDialog = () => {
    setIsProductDialogOpen(false);
    setEditingProduct(null);
    setNewProductName("");
    setNewProductCategory("");
    setNewProductPrice("");
    setCustomCategoryName("");
  };

  // Store assignment states
  const [selectedUserForStore, setSelectedUserForStore] = useState<any>(null);
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [isStoreAssignmentOpen, setIsStoreAssignmentOpen] = useState(false);
  const [userStoreAssignments, setUserStoreAssignments] = useState<{[key: string]: string[]}>({});

  const handleAssignToStores = async () => {
    if (!selectedUserForStore || selectedStores.length === 0) {
      alert("Please select at least one store");
      return;
    }

    try {
      // First, remove any existing store assignments for this user
      const { error: deleteError } = await supabase
        .from('store_assignments')
        .delete()
        .eq('optician_id', selectedUserForStore.id);

      if (deleteError) throw deleteError;

      // Then add new store assignments
      const storeAssignments = selectedStores.map(storeId => ({
        optician_id: selectedUserForStore.id,
        store_id: storeId
      }));
      
      console.log('Saving store assignments:', storeAssignments);

      const { error: insertError } = await supabase
        .from('store_assignments')
        .insert(storeAssignments);

      if (insertError) throw insertError;

      // Clear form and close dialog
      setSelectedUserForStore(null);
      setSelectedStores([]);
      setIsStoreAssignmentOpen(false);

      // Refresh user store assignments
      await fetchData();

      alert("Store assignments updated successfully!");
    } catch (err) {
      console.error('Error assigning stores:', err);
      alert('Failed to assign stores. Please try again.');
    }
  };

  const openStoreAssignment = async (user: any) => {
    setSelectedUserForStore(user);
    // Fetch existing store assignments for this user
    try {
      const { data: userStores, error } = await supabase
        .from('store_assignments')
        .select('store_id')
        .eq('optician_id', user.id);
      
      if (error) {
        console.error('Error fetching user store assignments:', error);
        setSelectedStores([]);
      } else {
        // Extract store IDs from the user_stores data and ensure they're strings
        const assignedStoreIds = userStores?.map(us => String(us.store_id)) || [];
        console.log('User:', user.email, 'Assigned store IDs:', assignedStoreIds);
        console.log('Available stores:', stores.map(s => ({ id: String(s.id), name: s.name })));
        setSelectedStores(assignedStoreIds);
      }
      setIsStoreAssignmentOpen(true); // Only open dialog after selectedStores is set
    } catch (err) {
      console.error('Error in openStoreAssignment:', err);
      setSelectedStores([]);
      setIsStoreAssignmentOpen(true); // Still open dialog, but with no stores checked
    }
  };

  const closeStoreAssignment = () => {
    setIsStoreAssignmentOpen(false);
    setSelectedUserForStore(null);
    setSelectedStores([]);
  };

  const toggleStoreSelection = (storeId: string) => {
    setSelectedStores(prev => 
      prev.includes(storeId) 
        ? prev.filter(id => id !== storeId)
        : [...prev, storeId]
    );
  };

  // Get store names for display
  const getStoreNames = (storeIds: string[]) => {
    return storeIds
      .map(id => stores.find(store => store.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

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

  // Dashboard calculations
  useEffect(() => {
    const getFilteredSales = () => {
      const now = new Date();
      return allSales.filter(sale => {
        const saleDate = new Date(sale.created_at);
        let dateCondition = true;
        if (dateFilter !== 'all') {
          const days = parseInt(dateFilter);
          const pastDate = new Date();
          pastDate.setDate(now.getDate() - days);
          dateCondition = saleDate >= pastDate;
        }
        const storeCondition = storeFilter === 'all' || sale.store_id.toString() === storeFilter;
        return dateCondition && storeCondition;
      });
    };

    const filteredSales = getFilteredSales();
    const totalSales = filteredSales.reduce((sum, sale) => sum + sale.final_cost, 0);
    const quotesCreated = filteredSales.length;

    setKpis(prev => ({ ...prev, totalSales, quotesCreated }));
    setRecentQuotes(filteredSales.slice(0, 5));
  }, [allSales, dateFilter, storeFilter])


  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)

  const filteredProducts = products.filter((product) => {
    const matchesSearch = searchTerm === "" || 
      (product.Item && product.Item.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.Category && product.Category.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || product.Category === categoryFilter;
    return matchesSearch && matchesCategory;
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
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        userName={userName} 
        storeName="Pearle Vision" 
        currentPage="admin" 
        userRole="admin" 
      />

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

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(kpis.totalSales)}</div>
                </CardContent>
              </Card>
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Quotes Created</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+{kpis.quotesCreated}</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Recent Quotes</CardTitle>
                <CardDescription>A list of the most recent quotes in the system.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Optician</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentQuotes.length > 0 ? (
                      recentQuotes.map((quote) => (
                        <TableRow key={quote.id}>
                          <TableCell className="font-medium">{quote.customer_name}</TableCell>
                          <TableCell>{allProfiles.find(p => p.id === quote.optician_id)?.full_name || 'N/A'}</TableCell>
                          <TableCell>{quote.quote_details?.type || 'Glasses'}</TableCell>
                          <TableCell>{new Date(quote.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">{formatCurrency(quote.final_cost)}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center space-y-2">
                            <TrendingUp className="h-8 w-8 text-gray-400" />
                            <p className="text-gray-500">No quotes found</p>
                            <p className="text-sm text-gray-400">Start creating quotes to see them here</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

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
                              className="text-blue-600 hover:text-blue-700 bg-transparent"
                              onClick={() => openStoreAssignment(user)}
                              title="Edit store assignments"
                            >
                              {userStoreAssignments[user.id]?.length > 0 ? 'Edit Stores' : 'Assign to Store'}
                            </Button>
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

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Product Management</CardTitle>
                    <CardDescription>Manage your component inventory and pricing</CardDescription>
                  </div>
                  <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => openProductDialog()}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                        <DialogDescription>
                          {editingProduct ? 'Update the product details below.' : 'Add a new component to your inventory.'}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="product-name">Product Name</Label>
                          <Input 
                            id="product-name" 
                            placeholder="Enter product name"
                            value={newProductName}
                            onChange={(e) => setNewProductName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="product-category">Category</Label>
                          <Select value={newProductCategory} onValueChange={setNewProductCategory}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from(new Set(products.map(p => p.Category))).filter(Boolean).sort().map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                              <SelectItem value="custom">+ Add New Category</SelectItem>
                            </SelectContent>
                          </Select>
                          {newProductCategory === "custom" && (
                            <Input 
                              placeholder="Enter new category name"
                              value={customCategoryName}
                              onChange={(e) => setCustomCategoryName(e.target.value)}
                              className="mt-2"
                              autoFocus
                            />
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="product-price">Retail Price</Label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">$</span>
                            </div>
                            <Input 
                              id="product-price" 
                              type="number" 
                              step="0.01" 
                              min="0"
                              placeholder="0.00"
                              className="pl-7"
                              value={newProductPrice}
                              onChange={(e) => setNewProductPrice(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={closeProductDialog}
                          >
                            Cancel
                          </Button>
                          <Button 
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                            onClick={editingProduct ? handleEditProduct : handleAddProduct}
                          >
                            {editingProduct ? 'Update Product' : 'Add Product'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Search products..."
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {Array.from(new Set(products.map(p => p.Category))).filter(Boolean).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Package className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="font-medium">{product.Item}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{product.Category || 'Uncategorized'}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(product.Retail)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={product.is_active ? "default" : "secondary"}>
                              {product.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => openProductDialog(product)}
                                title="Edit product"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleToggleProductStatus(product.id, product.is_active)}
                                title={product.is_active ? "Deactivate product" : "Activate product"}
                                className={product.is_active ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}
                              >
                                {product.is_active ? <ToggleLeft className="w-4 h-4" /> : <ToggleRight className="w-4 h-4" />}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          No products found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">System Settings</CardTitle>
                <CardDescription>Configure system-wide settings and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Settings panel coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Store Assignment Dialog */}
      <Dialog open={isStoreAssignmentOpen} onOpenChange={setIsStoreAssignmentOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {userStoreAssignments[selectedUserForStore?.id]?.length > 0 ? 'Edit Store Assignments' : 'Assign User to Stores'}
            </DialogTitle>
            <DialogDescription>
              {userStoreAssignments[selectedUserForStore?.id]?.length > 0 
                ? `Current assignments: ${getStoreNames(userStoreAssignments[selectedUserForStore?.id] || [])}`
                : `Select which stores ${selectedUserForStore?.full_name || selectedUserForStore?.email} should have access to.`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Available Stores</Label>
              <div className="max-h-48 overflow-y-auto space-y-2 border rounded-md p-3">
                {stores.length > 0 ? (
                  stores.map((store) => (
                    <div key={store.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`store-${store.id}`}
                        checked={selectedStores.includes(String(store.id))}
                        onChange={() => toggleStoreSelection(String(store.id))}
                        className="h-4 w-4 text-emerald-600 border-gray-300 rounded"
                      />
                      <Label htmlFor={`store-${store.id}`} className="text-sm font-medium">
                        {store.name}
                      </Label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No stores available</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={closeStoreAssignment}
              >
                Cancel
              </Button>
              <Button 
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={handleAssignToStores}
                disabled={selectedStores.length === 0}
              >
                {userStoreAssignments[selectedUserForStore?.id]?.length > 0 ? 'Update Store Assignments' : 'Assign to Selected Stores'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
