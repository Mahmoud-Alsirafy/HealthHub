"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Eye, EyeOff, Shield, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MedLinkLogo } from "@/components/medlink-logo"
import { Suspense, useRef } from "react"
import { loginApi, registerApi, verifyOtpApi, resendOtpApi } from "@/lib/api"

// OTP Input Component
function OtpInput({ value, onChange, length = 6 }: { value: string, onChange: (val: string) => void, length?: number }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (!val) return;

    const newValue = value.split('');
    newValue[index] = val.substring(val.length - 1);
    const finalValue = newValue.join('').padEnd(length, ' ').substring(0, length);
    onChange(finalValue.replace(/ /g, ''));

    if (val && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      const newValue = value.split('');
      if (newValue[index]) {
        newValue[index] = ' ';
        const finalValue = newValue.join('').padEnd(length, ' ').substring(0, length);
        onChange(finalValue.replace(/ /g, ''));
      } else if (index > 0) {
        inputs.current[index - 1]?.focus();
      }
    }
  };

  return (
    <div className="flex justify-between gap-2">
      {Array.from({ length }).map((_, i) => (
        <Input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          className="w-12 h-14 text-center text-xl font-bold"
          maxLength={1}
          value={value[i] || ''}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
        />
      ))}
    </div>
  );
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") === "register" ? "register" : "login"
  const [activeTab, setActiveTab] = useState(defaultTab)

  const [showPassword, setShowPassword] = useState(false)
  const [isPending, startTransition] = useTransition()

  // App states
  const [view, setView] = useState<"auth" | "otp">("auth")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form States
  const [role, setRole] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [nationalId, setNationalId] = useState("")
  const [license, setLicense] = useState("")
  const [facility, setFacility] = useState("")

  // OTP State
  const [otp, setOtp] = useState("")
  const [userId, setUserId] = useState<number | string | null>(null)
  const [userType, setUserType] = useState<string>("users") // ✅ لحفظ الـ type للـ OTP

  // ✅ Login Handler
  const handleLogin = () => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await loginApi({ email, password, type: role });

        if (res.errors) {
          setError(Object.values(res.errors).flat().join(', '));
          return;
        }

        if (res.error || res.message === 'بيانات الدخول غير صحيحة') {
          setError(res.error || res.message);
          return;
        }

        // ✅ Login بيرجع id مش token - لازم OTP
        if (res.id) {
          setUserId(res.id);
          setUserType(role);
          setView("otp");
        } else {
          setError("Something went wrong. Please try again.");
        }
      } catch (err) {
        setError("Invalid email or password. Please try again.");
      }
    });
  };

  // ✅ Register Handler
  const handleRegister = () => {
    setError(null);
    startTransition(async () => {
      try {
        const fullName = `${firstName} ${lastName}`.trim();
        const payload = {
          name: fullName,
          email,
          password,
          password_confirmation: password, // ✅ مطلوب من الـ API
          national_id: nationalId,
          type: "users",
        };

        const res = await registerApi(payload);

        if (res.errors) {
          setError(Object.values(res.errors).flat().join(', '));
          return;
        }

        if (res.error) {
          setError(res.error);
          return;
        }

        if (res.user) {
          setUserId(res.user.id);
          setUserType("users");
          setView("otp");
        }
      } catch (err) {
        setError("Registration failed. Please check your data and try again.");
      }
    });
  };

  // ✅ OTP Verify Handler
  const handleVerifyOtp = () => {
    if (otp.length !== 6) {
      setError("Please enter all 6 digits.");
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const res = await verifyOtpApi({ type: userType, id: userId, otp });

        if (res.errors) {
          setError(Object.values(res.errors).flat().join(', '));
          return;
        }

        if (res.error) {
          setError(res.error);
          return;
        }

        if (res.token) {
          localStorage.setItem("auth_token", res.token);
          localStorage.setItem("auth_type", userType);
          router.push("/dashboard/patient");
        } else {
          setError(res.message || "Invalid OTP code.");
        }
      } catch (err) {
        setError("Failed to verify OTP. Please try again.");
      }
    });
  };

  // ✅ Resend OTP Handler
  const handleResendOtp = () => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      try {
        const res = await resendOtpApi(userType, userId as string);
        if (res.error) {
          setError(res.error);
        } else if (res.message) {
          // If the OTP is still working, it might be better displayed as an error/warning
          // since no new code was sent, but the backend returns 200.
          if (res.message.includes("Work") || res.message.includes("شغال") || res.message.includes("يعمل")) {
            setError(res.message);
          } else {
            setSuccess(res.message);
          }
        } else {
          setSuccess("New code sent successfully!");
        }
      } catch (err) {
        setError("Failed to resend code.");
      }
    });
  };

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
            {"Egypt's healthcare"}<br />
            {"network"}
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
      <div className="flex w-full flex-col items-center justify-center px-4 py-8 lg:w-1/2 overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          <div className="mb-6 lg:hidden">
            <MedLinkLogo />
          </div>

          <Button variant="ghost" size="sm" className="mb-6" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to home
            </Link>
          </Button>

          {/* OTP View */}
          {view === "otp" ? (
            <Card className="border-border/50 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardHeader>
                <CardTitle className="font-heading text-2xl">Verify your account</CardTitle>
                <CardDescription>
                  We've sent a 6-digit verification code to <span className="font-medium text-foreground">{email}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md">{error}</div>}
                {success && <div className="p-3 text-sm bg-green-500/10 text-green-600 rounded-md">{success}</div>}

                <div className="space-y-4">
                  <Label>Verification Code</Label>
                  <OtpInput value={otp} onChange={setOtp} length={6} />
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleVerifyOtp}
                  disabled={isPending || otp.length !== 6}
                >
                  {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Verify & Continue
                </Button>

                <div className="text-center text-sm">
                  <span className="text-muted-foreground">Didn't receive a code? </span>
                  <button
                    type="button"
                    className="text-primary hover:underline font-medium disabled:opacity-50"
                    disabled={isPending}
                    onClick={handleResendOtp}
                  >
                    Resend
                  </button>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 border-t px-6 py-4">
                <button
                  onClick={() => { setView("auth"); setOtp(""); setError(null); }}
                  className="text-sm text-muted-foreground hover:text-foreground flex items-center transition-colors"
                >
                  <ArrowLeft className="mr-2 h-3.5 w-3.5" /> Back to Login
                </button>
              </CardFooter>
            </Card>

          ) : (
            // Auth View (Login / Register)
            <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setError(null); }} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login" className="animate-in fade-in duration-300">
                <Card className="border-border/50 shadow-lg">
                  <CardHeader>
                    <CardTitle className="font-heading text-2xl">Welcome back</CardTitle>
                    <CardDescription>Enter your credentials to access your dashboard</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {error && <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md">{error}</div>}

                    <div className="space-y-2">
                      <Label htmlFor="login-role">I am a</Label>
                      <Select value={role} onValueChange={setRole}>
                        <SelectTrigger id="login-role">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="users">Patient</SelectItem>
                          <SelectItem value="doctors">Doctor</SelectItem>
                          <SelectItem value="laps">Lab</SelectItem>
                          <SelectItem value="paramedics">Paramedic</SelectItem>
                          <SelectItem value="pharmas">Pharmacy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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

                    <Button
                      className="w-full"
                      size="lg"
                      disabled={isPending || !email || !password || !role}
                      onClick={handleLogin}
                    >
                      {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Sign In
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register" className="animate-in fade-in duration-300">
                <Card className="border-border/50 shadow-lg">
                  <CardHeader>
                    <CardTitle className="font-heading text-2xl">Create an account</CardTitle>
                    <CardDescription>Register to access the MedLink platform</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {error && <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md">{error}</div>}

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="reg-first">First Name</Label>
                        <Input id="reg-first" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-last">Last Name</Label>
                        <Input id="reg-last" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-national-id">National ID</Label>
                      <Input id="reg-national-id" placeholder="14-digit National ID" value={nationalId} onChange={(e) => setNationalId(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Email</Label>
                      <Input id="reg-email" type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="reg-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      className="w-full"
                      size="lg"
                      disabled={isPending || !email || !password || !firstName || !lastName || !nationalId}
                      onClick={handleRegister}
                    >
                      {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Create Account
                    </Button>

                    <p className="text-center text-xs text-muted-foreground">
                      By registering, you agree to our Terms of Service and Privacy Policy
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
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