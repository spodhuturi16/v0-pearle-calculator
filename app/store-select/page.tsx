"use client"

import { useState } from "react"
import { MapPin, ArrowRight, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const mockStores = [
  { id: 1, name: "Downtown Vision Center", address: "123 Main St, Downtown", city: "New York, NY" },
  { id: 2, name: "Westside Optical", address: "456 West Ave, Westside", city: "New York, NY" },
  { id: 3, name: "Mall Vision Plaza", address: "789 Shopping Center Dr", city: "New York, NY" },
]

export default function StoreSelectPage() {
  const [selectedStore, setSelectedStore] = useState<number | null>(null)
  const [userName] = useState("John Smith")

  const handleStoreSelect = (storeId: number) => {
    setSelectedStore(storeId)
    // Simulate navigation delay
    setTimeout(() => {
      window.location.href = "/calculator"
    }, 500)
  }

  const handleLogout = () => {
    window.location.href = "/"
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
                    {userName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-gray-700">{userName}</span>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome back, {userName.split(" ")[0]}!</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select your store location to begin your session and access the calculator tools.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockStores.map((store) => (
            <Card
              key={store.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 ${
                selectedStore === store.id
                  ? "border-emerald-500 bg-emerald-50 shadow-lg"
                  : "border-gray-200 hover:border-emerald-300"
              }`}
              onClick={() => handleStoreSelect(store.id)}
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
          ))}
        </div>

        {/* Help Section */}
        <div className="mt-16 text-center">
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="py-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Need help?</h3>
              <p className="text-gray-600 mb-4">
                If you don't see your store listed or need access to additional locations, please contact your
                administrator.
              </p>
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100 bg-transparent">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
