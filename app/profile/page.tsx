"use client"

import { useState } from "react"
import { Camera, Key, Save, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Navigation } from "@/components/navigation"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [userData, setUserData] = useState({
    fullName: "John Smith",
    email: "john.smith@pearlevision.com",
    phone: "(555) 123-4567",
    role: "optician",
    storeAssignments: ["Downtown Vision Center", "Mall Plaza"],
    notifications: {
      email: true,
      sms: false,
      push: true,
    },
  })
  const [storeName] = useState("Downtown Vision Center")

  const handleSave = () => {
    setIsEditing(false)
    alert("Profile updated successfully!")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      <Navigation userName={userData.fullName} storeName={storeName} currentPage="profile" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
              <p className="text-gray-600">Manage your account information and preferences</p>
            </div>
            <div className="flex items-center space-x-3">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} className="bg-emerald-600 hover:bg-emerald-700">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-2xl">
                      {userData.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-emerald-600 hover:bg-emerald-700"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{userData.fullName}</h3>
                  <p className="text-gray-600">{userData.email}</p>
                  <p className="text-sm text-gray-500 mt-1 capitalize">{userData.role}</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input
                    id="full-name"
                    value={userData.fullName}
                    onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                    disabled={!isEditing}
                    className="h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userData.email}
                    onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                    disabled={!isEditing}
                    className="h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={userData.phone}
                    onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                    disabled={!isEditing}
                    className="h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" value={userData.role} disabled className="h-12 border-gray-200 capitalize" />
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <Label className="text-sm font-medium">Store Assignments</Label>
                <div className="flex flex-wrap gap-2">
                  {userData.storeAssignments.map((store) => (
                    <span
                      key={store}
                      className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium"
                    >
                      {store}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-500">Contact your administrator to modify store assignments</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security and password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Key className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Password</h3>
                    <p className="text-sm text-gray-600">Last updated 30 days ago</p>
                  </div>
                </div>
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent">
                  Change Password
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h3 className="font-medium">Email Notifications</h3>
                    <p className="text-sm text-gray-600">Receive updates via email</p>
                  </div>
                  <Switch
                    checked={userData.notifications.email}
                    onCheckedChange={(checked) =>
                      setUserData({
                        ...userData,
                        notifications: { ...userData.notifications, email: checked },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h3 className="font-medium">SMS Notifications</h3>
                    <p className="text-sm text-gray-600">Receive updates via text message</p>
                  </div>
                  <Switch
                    checked={userData.notifications.sms}
                    onCheckedChange={(checked) =>
                      setUserData({
                        ...userData,
                        notifications: { ...userData.notifications, sms: checked },
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h3 className="font-medium">Push Notifications</h3>
                    <p className="text-sm text-gray-600">Receive browser notifications</p>
                  </div>
                  <Switch
                    checked={userData.notifications.push}
                    onCheckedChange={(checked) =>
                      setUserData({
                        ...userData,
                        notifications: { ...userData.notifications, push: checked },
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
