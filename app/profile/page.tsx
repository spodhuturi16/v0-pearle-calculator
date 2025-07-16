"use client"

import { useState, useEffect } from "react"
import { Camera, Key, Save, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Navigation } from "@/components/navigation"
import { supabase } from "@/supabase-client.js"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [user, setUser] = useState<any>(null);
  const [profileData, setProfileData] = useState({
    full_name: "",
    role: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            window.location.href = '/';
            return;
        }
        
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (profile) {
            setUser({ ...user, ...profile });
            setProfileData({
                full_name: profile.full_name || '',
                role: profile.role || '',
            });
        }
    };
    fetchUserData();
  }, []);

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if(!user) return;
    
    const { error } = await supabase.from('profiles').update({
        full_name: profileData.full_name,
    }).eq('id', user.id);

    if (error) {
        alert("Error updating profile: " + error.message);
    } else {
        setIsEditing(false)
        alert("Profile updated successfully!")
    }
  }

  const handleInputChange = (field: string, value: string) => {
      setProfileData(prev => ({...prev, [field]: value}));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      {user && <Navigation userName={profileData.full_name} currentPage="profile" />}

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
                      {profileData.full_name
                        ?.split(" ")
                        .map((n: string) => n[0])
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
                  <h3 className="text-lg font-semibold text-gray-900">{profileData.full_name}</h3>
                  <p className="text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-500 mt-1 capitalize">{profileData.role}</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input
                    id="full-name"
                    value={profileData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    disabled={!isEditing}
                    className="h-12 border-gray-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" value={profileData.role} disabled className="h-12 border-gray-200 capitalize" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
