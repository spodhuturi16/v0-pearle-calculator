// app/products/page.tsx
"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Filter, Plus, Edit, Trash2, Package, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
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
import { Switch } from "@/components/ui/switch"
import { Navigation } from "@/components/navigation"
import { supabase } from "@/supabase-client"

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  is_active: boolean;
  created_at: string;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for the new product dialog
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  const fetchProducts = async () => {
    try {
      setLoading(true);
      // Fetch from 'components' table
      const { data, error } = await supabase.from('components').select('*');
      if (error) {
        console.error("Error fetching components:", error);
        setError("Failed to load products. Please try again later.");
        setProducts([]);
      } else {
        // Map components to Product type
        setProducts((data || []).map((item: any) => ({
          id: item.id.toString(),
          name: item.Item,
          category: item.Category,
          price: Number(item.Retail),
          is_active: item.is_active,
          created_at: item.created_at,
        })));
      }
    } catch (err) {
      console.error("Error in fetchProducts:", err);
      setError("Failed to load products. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Try to get user's full name from profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        setUserName(profile?.full_name || user.email || 'User');
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await Promise.all([
        fetchUserData(),
        fetchProducts()
      ]);
    };
    
    initialize();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('products_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'components' 
        }, 
        (payload) => {
          console.log('Change received!', payload);
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('components')
        .insert([
          {
            Item: newItemName,
            Category: newItemCategory,
            Retail: parseFloat(newItemPrice),
            is_active: true,
            created_at: new Date().toISOString(),
          },
        ]);
      if (error) throw error;
      setNewItemName('');
      setNewItemCategory('');
      setNewItemPrice('');
      await fetchProducts();
    } catch (err) {
      console.error('Error adding product:', err);
      alert('Failed to add product. Please try again.');
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('components')
        .update({ is_active: !isActive })
        .eq('id', id);
      if (error) throw error;
      setProducts(products.map(product =>
        product.id === id ? { ...product, is_active: !isActive } : product
      ));
    } catch (err) {
      console.error('Error toggling product status:', err);
      alert('Failed to update product status. Please try again.');
    }
  };


  const filteredProducts = products.filter((product) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      product.name?.toLowerCase().includes(searchLower) ||
      product.category?.toLowerCase().includes(searchLower)
    ) &&
      (categoryFilter === 'all' || product.category?.toLowerCase() === categoryFilter.toLowerCase());
  });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { 
      style: "currency", 
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    }).format(amount || 0)

  // Get unique categories for filter dropdown
  const categories = useMemo(() => {
    const cats = new Set<string>(['all']);
    products.forEach(product => {
      if (product.category) {
        cats.add(product.category.toLowerCase());
      }
    });
    return Array.from(cats).sort();
  }, [products]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
        <Navigation userName={userName} currentPage="products" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
        <Navigation userName={userName} currentPage="products" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      <Navigation userName={userName} currentPage="products" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your product inventory
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Fill in the details below to add a new product to your inventory.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    placeholder="Enter category"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newItemPrice}
                      onChange={(e) => setNewItemPrice(e.target.value)}
                      className="pl-7"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                  <Button type="submit">
                    Add Product
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div>
                <CardTitle>Product Inventory</CardTitle>
                <CardDescription>
                  {products.length} {products.length === 1 ? 'product' : 'products'} found
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search products..."
                    className="pl-9 w-full md:w-[200px] lg:w-[300px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
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
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-3">
                            <Package className="h-5 w-5 text-gray-400" />
                            <div>
                              <div className="font-medium text-gray-900">{product.name}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category || 'Uncategorized'}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(product.price)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            id={`status-${product.id}`}
                            checked={product.is_active}
                            onCheckedChange={(checked) => handleToggleActive(product.id, checked)}
                            className={`${product.is_active ? 'bg-emerald-600' : 'bg-gray-200'}`}
                          />
                          <Label htmlFor={`status-${product.id}`} className="ml-2">
                            {product.is_active ? 'Active' : 'Inactive'}
                          </Label>
                        </TableCell>
                        <TableCell className="text-right">
                          {/* Actions here */}
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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
