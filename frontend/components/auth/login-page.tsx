"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Eye, EyeOff, Shield, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MedLinkLogo } from "@/components/medlink-logo"
import { Suspense } from "react"

function LoginForm() {
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") === "register" ? "register" : "login"
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState("")

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,oklch(0.6_0.15_200)_0%,transparent_50%)] opacity-30" />
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" className="text-primary-foreground" stroke="currentColor" />
              </svg>
            </div>
            <span className="text-xl font-bold text-primary-foreground tracking-tight">MedLink</span>
          </div>
        </div>
        <div className="relative space-y-6">
          <h2 className="text-4xl font-bold text-primary-foreground leading-tight">
            Secure access to<br />
            {"Egypt's healthcare<br />network"}
          </h2>
          <div className="space-y-4">
            {[
              { stat: "18,450+", label: "Medical records digitized" },
              { stat: "245+", label: "Healthcare facilities" },
              { stat: "99.9%", label: "Uptime guarantee" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground/60" />
                <span className="text-primary-foreground/90">
                  <strong>{item.stat}</strong> {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative flex items-center gap-2 text-primary-foreground/60 text-sm">
          <Shield className="h-4 w-4" />
          <span>End-to-end encrypted. HIPAA compliant.</span>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex w-full flex-col items-center justify-center px-4 py-8 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-6 lg:hidden">
            <MedLinkLogo />
          </div>

          <Button variant="ghost" size="sm" className="mb-6" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to home
            </Link>
          </Button>

          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card className="border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="font-heading text-2xl">Welcome back</CardTitle>
                  <CardDescription>Enter your credentials to access your dashboard</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-role">I am a</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger id="login-role">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="patient">Patient</SelectItem>
                        <SelectItem value="doctor">Doctor</SelectItem>
                        <SelectItem value="facility">Medical Facility</SelectItem>
                        <SelectItem value="paramedic">Paramedic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email or National ID</Label>
                    <Input id="login-email" placeholder="Enter your email or National ID" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" className="rounded border-input" />
                      <span className="text-muted-foreground">Remember me</span>
                    </label>
                    <span className="text-sm text-primary cursor-pointer hover:underline">Forgot password?</span>
                  </div>
                  <Button className="w-full" size="lg" asChild>
                    <Link href="/dashboard/patient">Sign In</Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="font-heading text-2xl">Create an account</CardTitle>
                  <CardDescription>Register to access the MedLink platform</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="reg-first">First Name</Label>
                      <Input id="reg-first" placeholder="First name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-last">Last Name</Label>
                      <Input id="reg-last" placeholder="Last name" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-national-id">National ID</Label>
                    <Input id="reg-national-id" placeholder="14-digit National ID" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input id="reg-email" type="email" placeholder="your@email.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="reg-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  {role === "doctor" && (
                    <div className="space-y-2">
                      <Label htmlFor="reg-license">Medical License Number</Label>
                      <Input id="reg-license" placeholder="MED-EG-XXXX-XXXX" />
                    </div>
                  )}
                  {role === "facility" && (
                    <div className="space-y-2">
                      <Label htmlFor="reg-facility">Facility Name</Label>
                      <Input id="reg-facility" placeholder="Enter facility name" />
                    </div>
                  )}
                  <Button className="w-full" size="lg">
                    Create Account
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    By registering, you agree to our Terms of Service and Privacy Policy
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginForm />
    </Suspense>
  )
}
