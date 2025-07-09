// app/store-select/page.tsx
"use client"

import { useState, useEffect } from "react"
import { MapPin, ArrowRight, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { supabase } from "../supabase-client.js"

export default function StoreSelectPage() {
  const [selectedStore, setSelectedStore] = useState<number | null>(null)
  const [user, setUser] = useState<any>(null)
  const [stores, setStores] = useState<any[]>([])
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndAssignments = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.href = '/';
            return;
        }

        const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single();
        setUser({ ...user, ...profile });

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
              <p>You are not assigned to any stores. Please contact an administrator.</p>
          )}
        </div>
      </main>
    </div>
  )
}
