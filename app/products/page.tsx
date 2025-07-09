// app/products/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Plus, Edit, Trash2, Package, DollarSign, ToggleLeft, ToggleRight } from "lucide-react"
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
import { Navigation } from "@/components/navigation"
import { supabase } from "../supabase-client.js"

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [userName, setUserName] = useState("Admin User");
  
  // State for the new product dialog
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');


  const fetchProducts = async () => {
    const { data, error } = await supabase.from('components').select('*');
    if (error) {
      console.error("Error fetching components:", error);
    } else {
      setProducts(data);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
      e.preventDefault();
      const itemData = {
          Item: newItemName,
          Category: newItemCategory,
          Retail: parseFloat(newItemPrice),
      };
      const { error } = await supabase.functions.invoke('create-component', {
          body: { itemData: itemData }
      });

      if (error) {
          alert(`Error creating item: ${error.message}`);
      } else {
          alert('Item created successfully!');
          fetchProducts(); // Refresh the list
          // Close dialog manually if you control its state, or just reset fields
          setNewItemName('');
          setNewItemCategory('');
          setNewItemPrice('');
      }
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
      const { error } = await supabase.functions.invoke('update-component-status', {
          body: { id: id, is_active: isActive }
      });
      if (error) {
          alert(`Error updating status: ${error.message}`);
      } else {
          fetchProducts(); // Refresh list
      }
  };


  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.Item.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.Category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      <Navigation userName={userName} currentPage="products" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Catalog</h1>
              <p className="text-gray-600">Manage your optical products, pricing, and availability</p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                 <form onSubmit={handleAddProduct}>
                    <DialogHeader>
                      <DialogTitle>Add New Product</DialogTitle>
                      <DialogDescription>Create a new product in your catalog.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="product-name">Product Name</Label>
                        <Input id="product-name" placeholder="Enter product name" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} required/>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="product-category">Category</Label>
                        <Input id="product-category" placeholder="Enter category" value={newItemCategory} onChange={(e) => setNewItemCategory(e.target.value)} required/>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="product-price">Price</Label>
                        <Input id="product-price" type="number" step="0.01" placeholder="0.00" value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} required/>
                      </div>
                    </div>
                    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">Create Product</Button>
                 </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Product Catalog</CardTitle>
            <CardDescription>
              Showing {filteredProducts.length} of {products.length} products
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="font-medium">{product.Item}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.Category}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(product.Retail)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                         <Switch checked={product.is_active} onCheckedChange={(checked) => handleToggleActive(product.id, checked)} />
                         <Badge variant={product.is_active ? "default" : "secondary"}>
                           {product.is_active ? "Active" : "Inactive"}
                         </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                       {/* Edit button can be wired to a similar modal in the future */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
