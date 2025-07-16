// app/store-select/page.tsx
"use client"

import { useState, useEffect } from "react"

// Force dynamic rendering to prevent build-time errors with authentication
export const dynamic = 'force-dynamic'
import { MapPin, ArrowRight, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { supabase } from "@/supabase-client.js"

export default function StoreSelectPage() {
  const [selectedStore, setSelectedStore] = useState<number | null>(null)
  const [user, setUser] = useState<any>(null)
  const [stores, setStores] = useState<any[]>([])
  const [loading, setLoading] = useState(true);

  // Debug effect for logging stores
  useEffect(() => {
    console.log('Stores updated:', stores);
  }, [stores]);

  useEffect(() => {
    const fetchUserAndAssignments = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.href = '/';
            return;
        }

        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
        console.log('User profile:', { profile, user_metadata: user.user_metadata });
        setUser({ ...user, ...profile });

        // Check both possible locations for owner role
        const isOwner = user.user_metadata?.user_role === 'owner';
        console.log('Is owner?', isOwner, { user_metadata: user.user_metadata, profile });
        
        if (isOwner) {
            try {
                // For admin users, fetch all stores with error handling
                const { data: allStores, error: storesError } = await supabase
                    .from('stores')
                    .select('*')
                    .order('name', { ascending: true });
                    
                if (storesError) throw storesError;
                
                console.log('Fetched stores for admin:', allStores);
                if (allStores && allStores.length > 0) {
                    setStores(allStores);
                } else {
                    console.log('No stores found in the database');
                    setStores([]);
                }
            } catch (error) {
                console.error("Error fetching all stores:", error);
                // Optionally show error to user
            } finally {
                setLoading(false);
            }
        } else {
            // For regular users, only show assigned stores
            const { data: assignments, error } = await supabase
                .from('store_assignments')
                .select('stores (id, name, address)')
                .eq('optician_id', user.id);
            
            if (error) {
                console.error("Error fetching assignments", error);
                setLoading(false);
                return;
            }

            if (assignments && assignments.length === 1) {
                const store = assignments[0].stores;
                sessionStorage.setItem('selectedStore', JSON.stringify(store));
                window.location.href = '/calculator';
            } else if (assignments) {
                setStores(assignments.map(a => a.stores));
                setLoading(false);
            } else {
                setLoading(false);
            }
        }
    };
    fetchUserAndAssignments();
  }, [])


  const handleStoreSelect = (store: any) => {
    setSelectedStore(store.id);
    sessionStorage.setItem('selectedStore', JSON.stringify(store));
    setTimeout(() => {
      window.location.href = "/calculator"
    }, 500)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    sessionStorage.removeItem('selectedStore');
    window.location.href = "/"
  }

  if (loading) {
      return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">PV</span>
              </div>
              <span className="font-semibold text-gray-900">Pearle Vision</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm">
                    {user?.full_name?.split(" ").map((n: string) => n[0]).join("") || user?.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">{user?.full_name || user?.email}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-600 hover:text-gray-900">
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome back, {user?.full_name?.split(" ")[0] || user?.email}!</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select your store location to begin your session and access the calculator tools.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {stores.length > 0 ? stores.map((store) => (
            <Card
              key={store.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 ${
                selectedStore === store.id
                  ? "border-emerald-500 bg-emerald-50 shadow-lg"
                  : "border-gray-200 hover:border-emerald-300"
              }`}
              onClick={() => handleStoreSelect(store)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-2">{store.name}</CardTitle>
                    <CardDescription className="flex items-start space-x-2 text-gray-600">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <div>{store.address}</div>
                        <div className="font-medium">{store.city}</div>
                      </div>
                    </CardDescription>
                  </div>
                  {selectedStore === store.id && (
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center ml-4">
                      <ArrowRight className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  variant={selectedStore === store.id ? "default" : "outline"}
                  className={`w-full ${
                    selectedStore === store.id
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  }`}
                  disabled={selectedStore === store.id}
                >
                  {selectedStore === store.id ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Loading...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Select Store</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          )) : (
              <div className="col-span-3 text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900">No stores available</h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {user?.user_metadata?.user_role === 'owner' 
                      ? 'No stores found in the database. Please add stores first.'
                      : 'You are not assigned to any stores. Please contact an administrator.'
                    }
                  </p>
                </div>
                {user?.user_metadata?.user_role === 'owner' ? (
                  <Button onClick={() => window.location.href = '/admin/stores'} className="mt-4">
                    Go to Admin Panel
                  </Button>
                ) : (
                  <Button variant="outline" onClick={handleLogout} className="mt-4">
                    Sign out
                  </Button>
                )}
              </div>
          )}
        </div>
      </main>
    </div>
  )
}
