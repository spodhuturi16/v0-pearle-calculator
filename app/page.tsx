// app/page.tsx
"use client"

import type React from "react"

import { useState } from "react"
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { supabase } from "../supabase-client.js"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [resetEmail, setResetEmail] = useState("")
  const [resetSent, setResetSent] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
        setError(authError.message);
        setIsLoading(false);
        return;
    }

    if (authData.user) {
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', authData.user.id)
            .single();

        if (profileError) {
            setError('Could not retrieve user profile.');
            await supabase.auth.signOut();
            setIsLoading(false);
            return;
        }

        if (profile) {
            const userRole = profile.role;
            if (userRole === 'owner') {
                window.location.href = './admin';
            } else if (userRole === 'optician') {
                window.location.href = './store-select';
            } else {
                setError('Unknown user role. Access denied.');
                await supabase.auth.signOut();
                setIsLoading(false);
            }
        } else {
            setError('No profile found for this user.');
            await supabase.auth.signOut();
            setIsLoading(false);
        }
    } else {
        setError('Authentication failed. Please try again.');
        setIsLoading(false);
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/update-password`,
    });
    if (!error) {
      setResetSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo and Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-24 h-24 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Eye className="w-12 h-12 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pearle Vision</h1>
            <p className="text-gray-600 mt-2">Store Portal</p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-semibold text-center">Welcome back</CardTitle>
            <CardDescription className="text-center text-gray-600">Sign in to your account to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <Dialog>
                  <DialogTrigger asChild>
                    <button type="button" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                      Forgot password?
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Reset password</DialogTitle>
                      <DialogDescription>
                        Enter your email address and we'll send you a link to reset your password.
                      </DialogDescription>
                    </DialogHeader>
                    {!resetSent ? (
                      <form onSubmit={handlePasswordReset} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="reset-email">Email address</Label>
                          <Input
                            id="reset-email"
                            type="email"
                            placeholder="you@example.com"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700">
                          Send reset link
                        </Button>
                      </form>
                    ) : (
                      <div className="text-center py-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Mail className="w-6 h-6 text-emerald-600" />
                        </div>
                        <p className="text-sm text-gray-600">
                          If an account exists for this email, a password reset link has been sent.
                        </p>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Sign in</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2024 Pearle Vision. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
