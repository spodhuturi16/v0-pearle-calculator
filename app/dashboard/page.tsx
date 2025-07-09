// app/dashboard/page.tsx
"use client"

import { useState, useEffect } from "react"
import { DollarSign, Users, ShoppingCart, TrendingUp, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Navigation } from "@/components/navigation"
import { supabase } from "../supabase-client.js"

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [allSales, setAllSales] = useState<any[]>([]);
    const [allProfiles, setAllProfiles] = useState<any[]>([]);
    const [allStores, setAllStores] = useState<any[]>([]);
    
    const [dateFilter, setDateFilter] = useState('30');
    const [storeFilter, setStoreFilter] = useState('all');
    
    const [kpis, setKpis] = useState({
        totalSales: 0,
        newCustomers: 0, // This KPI is hard to calculate without a customer table
        quotesCreated: 0,
        conversionRate: 0, // This requires knowing which quotes become invoices
    });
    const [recentQuotes, setRecentQuotes] = useState<any[]>([]);


    useEffect(() => {
        const checkUserAndFetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { window.location.href = '/'; return; }
            
            const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single();
            setUser({ ...user, ...profile });

            const [salesResult, profilesResult, storesResult] = await Promise.all([
                supabase.from('sales').select('*').order('created_at', { ascending: false }),
                supabase.from('profiles').select('id, full_name'),
                supabase.from('stores').select('*')
            ]);
            
            if (salesResult.data) setAllSales(salesResult.data);
            if (profilesResult.data) setAllProfiles(profilesResult.data);
            if (storesResult.data) setAllStores(storesResult.data);
        };
        checkUserAndFetchData();
    }, []);

    useEffect(() => {
        const filteredSales = getFilteredSales();
        
        const totalSales = filteredSales.reduce((sum, sale) => sum + sale.final_cost, 0);
        const quotesCreated = filteredSales.length;

        setKpis(prev => ({ ...prev, totalSales, quotesCreated }));
        setRecentQuotes(filteredSales.slice(0, 5));

    }, [allSales, dateFilter, storeFilter]);

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

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

    return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      {user && <Navigation userName={user.full_name || user.email} storeName={allStores.find(s => s.id.toString() === storeFilter)?.name || "All Stores"} currentPage="dashboard" />}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {user?.full_name?.split(" ")[0]}!</h1>
          <p className="text-gray-600">Here's a summary of your activity.</p>
        </div>
        
        {/* Filters would go here */}

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
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{kpis.quotesCreated}</div>
            </CardContent>
          </Card>
          {/* Other KPIs can be added here if data is available */}
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
                  <TableHead>Customer</TableHead>
                  <TableHead>Optician</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentQuotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">{quote.customer_name}</TableCell>
                    <TableCell>{allProfiles.find(p => p.id === quote.optician_id)?.full_name || 'N/A'}</TableCell>
                    <TableCell>{quote.quote_details?.type || 'Glasses'}</TableCell>
                    <TableCell>{new Date(quote.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">{formatCurrency(quote.final_cost)}</TableCell>
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
