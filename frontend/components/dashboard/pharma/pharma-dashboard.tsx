"use client"

import { useState, useEffect, useTransition, useRef } from "react"
import {
  LayoutDashboard,
  Search,
  Pill,
  Clock,
  Users,
  Loader2,
  ChevronRight,
  AlertTriangle,
  Info,
  QrCode,
  X,
  CheckCircle2,
  Download,
  Plus,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import {
  getPharmaStatsApi,
  searchPharmaPatientApi,
  verifyPharmaAccessApi,
  dispensePrescriptionApi,
  cancelPrescriptionApi,
  getPharmaQrApi,
  regeneratePharmaQrApi,
  getPharmaMeApi,
  API_BASE_URL,
} from "@/lib/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp"

export function PharmaDashboardContent() {
  const [isPending, startTransition] = useTransition()
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [recentSearches, setRecentSearches] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any>(null)
  const [pendingPatient, setPendingPatient] = useState<{ id: number; name: string } | null>(null)
  const [otpCode, setOtpCode] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  // ✅ QR Scanner states
  const [scannerOpen, setScannerOpen] = useState(false)
  const [scannerError, setScannerError] = useState<string | null>(null)
  const html5QrCodeRef = useRef<any>(null)

  // QR Generate States
  const [qrImage, setQrImage] = useState<string | null>(null)
  const [qrLoading, setQrLoading] = useState(false)

  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null

  const navItems = [
    {
      title: "Overview",
      icon: LayoutDashboard,
      onClick: () => setActiveTab("overview"),
      isActive: activeTab === "overview",
    },
    {
      title: "Search & Dispense",
      icon: Search,
      onClick: () => setActiveTab("search"),
      isActive: activeTab === "search",
    },
    {
      title: "My QR Code",
      icon: QrCode,
      onClick: () => setActiveTab("qr"),
      isActive: activeTab === "qr",
    },
  ]

  const fetchStatsAndInfo = () => {
    if (!token) return
    startTransition(async () => {
      try {
        const statsRes = await getPharmaStatsApi(token)
        if (statsRes.success) {
          setStats(statsRes.stats)
          setRecentSearches(statsRes.recent_searches || [])
        }

        const meRes = await getPharmaMeApi(token)
        if (meRes.user) {
          setProfile(meRes.user)
        }

        const qrRes = await getPharmaQrApi(token)
        if (qrRes.qr_image) setQrImage(qrRes.qr_image)
      } catch (err) {
        console.error("Failed to fetch dashboard data", err)
        toast.error("Failed to load dashboard data")
      }
    })
  }

  useEffect(() => {
    fetchStatsAndInfo()
  }, [token])

  // ✅ QR Scanner useEffect
  useEffect(() => {
    let isMounted = true

    if (scannerOpen) {
      const timer = setTimeout(async () => {
        if (!isMounted) return

        const container = document.getElementById("pharma-qr-reader")
        if (!container) return

        try {
          const { Html5Qrcode } = await import("html5-qrcode")
          if (!isMounted) return

          const html5QrCode = new Html5Qrcode("pharma-qr-reader")
          html5QrCodeRef.current = html5QrCode

          await html5QrCode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText: string) => {
              html5QrCode.stop()
                .then(() => {
                  html5QrCodeRef.current = null
                  setScannerOpen(false)
                  setScannerError(null)
                  handleSearchRequest(decodedText)
                })
                .catch(console.error)
            },
            () => {
              // ignore per-frame errors
            }
          )
        } catch (err) {
          console.error("Scanner error:", err)
          setScannerError("Unable to access camera. Please check permissions.")
        }
      }, 500)

      return () => {
        isMounted = false
        clearTimeout(timer)
        if (html5QrCodeRef.current?.isScanning) {
          html5QrCodeRef.current.stop().catch(console.error)
          html5QrCodeRef.current = null
        }
      }
    }
  }, [scannerOpen])

  const handleSearchRequest = (query?: string) => {
    let q = query || searchQuery
    if (!q || !token) return

    // Extract code from URL if query is a URL
    if (q.includes('/')) {
      q = q.split('/').filter(Boolean).pop() || q
    }

    startTransition(async () => {
      try {
        const res = await searchPharmaPatientApi(token, q)
        if (res.status === "pending" && res.patient_id) {
          setPendingPatient({ id: res.patient_id, name: res.patient_name })
          setOtpCode("")
          setSearchResults(null)
          toast.message("OTP sent to patient", {
            description: res.message || "Ask the patient for the 6‑digit code.",
          })
        } else if (res.success && res.patient) {
          setSearchResults({ patient: res.patient, prescriptions: res.prescriptions })
          setPendingPatient(null)
          toast.success("Patient records found")
          // Refresh statistics and recent searches
          fetchStatsAndInfo()
        } else {
          setSearchResults(null)
          setPendingPatient(null)
          toast.error(res.message || "Patient not found")
        }
      } catch (err) {
        toast.error("Search failed")
      }
    })
  }

  const handleVerifyOtp = () => {
    if (!token || !pendingPatient) return
    if (!otpCode || otpCode.length !== 6) {
      toast.error("Please enter the 6‑digit OTP code")
      return
    }

    startTransition(async () => {
      try {
        const res = await verifyPharmaAccessApi(token, {
          patient_id: pendingPatient.id,
          otp: otpCode,
        })

        if (res.success && res.patient) {
          setSearchResults({ patient: res.patient, prescriptions: res.prescriptions })
          setPendingPatient(null)
          setOtpCode("")
          toast.success(`Access granted to ${res.patient.name}`)
          fetchStatsAndInfo()
        } else {
          toast.error(res.message || "Invalid OTP code")
        }
      } catch (err) {
        toast.error("Failed to verify OTP")
      }
    })
  }

  const handleDispense = (prescriptionId: number) => {
    if (!token) return

    startTransition(async () => {
      try {
        const res = await dispensePrescriptionApi(token, prescriptionId)
        if (res.success) {
          toast.success(res.message || "Medication dispensed")
          // Update the list
          setSearchResults((prev: any) => ({
            ...prev,
            prescriptions: prev.prescriptions.map((p: any) => 
               p.id === prescriptionId ? { ...p, status: 'dispensed', dispensed_at: new Date().toISOString() } : p
            )
          }))
          // Refresh stats
          const statsRes = await getPharmaStatsApi(token)
          if (statsRes.success) setStats(statsRes.stats)
        } else {
          toast.error(res.message || "Failed to dispense")
        }
      } catch (err) {
        toast.error("An error occurred")
      }
    })
  }

  const handleCancel = (prescriptionId: number) => {
    if (!token) return

    startTransition(async () => {
      try {
        const res = await cancelPrescriptionApi(token, prescriptionId)
        if (res.success) {
          toast.success(res.message || "Prescription marked as inactive")
          setSearchResults((prev: any) => ({
            ...prev,
            prescriptions: prev.prescriptions.map((p: any) => 
               p.id === prescriptionId ? { ...p, status: 'cancelled' } : p
            )
          }))
        } else {
          toast.error(res.message || "Failed to mark as inactive")
        }
      } catch (err) {
        toast.error("An error occurred")
      }
    })
  }

  const handleRegenerateQr = () => {
    if (!token) return
    setQrLoading(true)
    regeneratePharmaQrApi(token)
      .then((res) => {
        if (res.qr_image) {
          setQrImage(res.qr_image)
          toast.success(res.message || "New QR code generated.")
        } else toast.error(res.error || "Failed to regenerate QR code")
      })
      .catch(() => toast.error("Failed to regenerate QR code"))
      .finally(() => setQrLoading(false))
  }

  if (!profile) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <DashboardShell
      navItems={navItems}
      userName={profile.name}
      userRole="Pharmacy"
      userInitials={profile.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
    >
      <div className="space-y-6 pb-20">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Pharmacy Dashboard</h1>
            <p className="text-muted-foreground">Manage prescriptions and dispense medications across the network.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1 text-sm bg-primary/5 border-primary/20 text-primary font-medium">
              Active Session
            </Badge>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md h-auto p-1 bg-muted/30">
            <TabsTrigger value="overview" className="rounded-xl py-2">Overview</TabsTrigger>
            <TabsTrigger value="search" className="rounded-xl py-2">Search & Dispense</TabsTrigger>
            <TabsTrigger value="qr" className="rounded-xl py-2">My QR Code</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-primary/5 border-primary/10 shadow-lg shadow-primary/5 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <LayoutDashboard className="h-10 w-10 text-primary" />
                </div>
                <CardContent className="p-6">
                  <p className="text-sm font-bold text-primary/60 uppercase tracking-wider mb-1">Total Dispensed</p>
                  <p className="text-3xl font-black text-foreground">{stats?.total_dispensed || 0}</p>
                </CardContent>
              </Card>

              <Card className="bg-emerald-500/5 border-emerald-500/10 shadow-lg shadow-emerald-500/5 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <Users className="h-10 w-10 text-emerald-500" />
                </div>
                <CardContent className="p-6">
                  <p className="text-sm font-bold text-emerald-600/60 uppercase tracking-wider mb-1">Patients Served</p>
                  <p className="text-3xl font-black text-foreground">{stats?.unique_patients || 0}</p>
                </CardContent>
              </Card>

              <Card className="bg-amber-500/5 border-amber-500/10 shadow-lg shadow-amber-500/5 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <Search className="h-10 w-10 text-amber-500" />
                </div>
                <CardContent className="p-6">
                  <p className="text-sm font-bold text-amber-600/60 uppercase tracking-wider mb-1">Total Looks-up</p>
                  <p className="text-3xl font-black text-foreground">{stats?.total_searched || 0}</p>
                </CardContent>
              </Card>

              <Card className="bg-slate-500/5 border-slate-500/10 shadow-lg shadow-slate-500/5 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <LayoutDashboard className="h-10 w-10 text-slate-500" />
                </div>
                <CardContent className="p-6">
                  <p className="text-sm font-bold text-slate-600/60 uppercase tracking-wider mb-1">System Users</p>
                  <p className="text-3xl font-black text-foreground">{stats?.total_system_patients || 0}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card className="border-border/40 shadow-xl shadow-black/5">
                <CardHeader className="border-b border-border/40">
                  <CardTitle className="font-heading text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    Recently Searched Patients
                  </CardTitle>
                  <CardDescription>History of patient IDs you've looked up recently.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/40">
                    {recentSearches.length > 0 ? recentSearches.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                             {log.name?.charAt(0) || 'P'}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-foreground">{log.name}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{log.national_id}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] text-muted-foreground italic">{log.last_seen}</span>
                          <Button
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              setSearchQuery(log.national_id)
                              setActiveTab("search")
                              handleSearchRequest(log.national_id)
                            }}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )) : (
                      <div className="py-12 text-center space-y-3">
                        <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto opacity-20">
                          <Search className="h-6 w-6" />
                        </div>
                        <p className="text-sm text-muted-foreground">No recent searches yet.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/40 shadow-xl shadow-black/5 bg-primary/5">
                <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      <QrCode className="h-12 w-12" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">Your Pharmacy Portal</h3>
                      <p className="text-sm text-muted-foreground max-w-[280px]">
                        Use this dashboard to manage prescriptions, dispense medications, and ensure patient safety with accurate medical records.
                      </p>
                    </div>
                    <Button className="rounded-xl h-11 px-8 font-bold shadow-lg shadow-primary/20" onClick={() => setActiveTab("search")}>
                      Start New Dispensing
                    </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="search" className="mt-6">
            <Card className="border-border/50 shadow-xl shadow-black/5 rounded-3xl overflow-hidden">
              <CardHeader className="bg-muted/30 pb-8">
                <CardTitle className="font-heading text-2xl">Patient Search & Dispensing</CardTitle>
                <CardDescription>Enter National ID or scan the patient's QR code to access their prescriptions.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-secondary/20 rounded-3xl border border-border/50">
                  {/* National ID Search */}
                  <div className="space-y-4">
                    <Label className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                      <Search className="h-4 w-4" /> National Database Lookup
                    </Label>
                    <div className="flex gap-3">
                      <Input
                        className="pl-5 rounded-2xl border-none bg-background h-14 shadow-inner text-lg focus-visible:ring-2 focus-visible:ring-primary"
                        placeholder="Enter 14-digit National ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchRequest()}
                      />
                      <Button onClick={() => handleSearchRequest()} disabled={isPending} className="rounded-2xl h-14 px-8 font-bold shadow-xl shadow-primary/25 bg-primary hover:bg-primary/90 transition-all">
                        {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Search"}
                      </Button>
                    </div>
                  </div>

                  {/* QR Scanner */}
                  <div className="space-y-4">
                    <Label className="text-xs font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                      <QrCode className="h-4 w-4" /> Hardware QR Scanner
                    </Label>
                    {scannerOpen ? (
                      <div className="space-y-3">
                        <div className="aspect-square max-w-[240px] mx-auto bg-black rounded-3xl border-4 border-primary/30 relative overflow-hidden shadow-2xl">
                          <div id="pharma-qr-reader" className="w-full h-full" />
                          <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40">
                            <div className="w-full h-1 bg-primary/60 absolute top-1/2 left-0 animate-pulse" />
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full rounded-2xl h-12 border-destructive/20 hover:bg-destructive/5 hover:text-destructive transition-colors font-bold"
                          onClick={() => setScannerOpen(false)}
                        >
                          <X className="mr-2 h-5 w-5" /> Cancel Scan
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="secondary"
                        className="w-full rounded-2xl h-14 font-bold shadow-xl shadow-black/5 bg-background border border-border/50 hover:bg-secondary/20 transition-all text-foreground"
                        onClick={() => setScannerOpen(true)}
                        disabled={isPending}
                      >
                        <QrCode className="mr-3 h-6 w-6 text-primary" />
                        Open Camera Scanner
                      </Button>
                    )}
                  </div>
                </div>

                {/* OTP Verification UI */}
                {pendingPatient && (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-500 rounded-3xl border-2 border-primary/20 bg-primary/5 p-8 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-xs font-black uppercase tracking-widest text-primary/70">Verify Patient Access</p>
                        <h3 className="text-2xl font-bold text-foreground">{pendingPatient.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          An OTP has been sent. Please enter the 6-digit code provided by the patient.
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <InputOTP
                          maxLength={6}
                          value={otpCode}
                          onChange={(value) => setOtpCode(value)}
                          containerClassName="justify-center"
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} className="h-12 w-10 sm:h-14 sm:w-12 bg-background border-primary/20 rounded-l-xl" />
                            <InputOTPSlot index={1} className="h-12 w-10 sm:h-14 sm:w-12 bg-background border-primary/20" />
                            <InputOTPSlot index={2} className="h-12 w-10 sm:h-14 sm:w-12 bg-background border-primary/20" />
                          </InputOTPGroup>
                          <InputOTPSeparator />
                          <InputOTPGroup>
                            <InputOTPSlot index={3} className="h-12 w-10 sm:h-14 sm:w-12 bg-background border-primary/20" />
                            <InputOTPSlot index={4} className="h-12 w-10 sm:h-14 sm:w-12 bg-background border-primary/20" />
                            <InputOTPSlot index={5} className="h-12 w-10 sm:h-14 sm:w-12 bg-background border-primary/20 rounded-r-xl" />
                          </InputOTPGroup>
                        </InputOTP>
                        <Button
                          size="lg"
                          className="rounded-2xl h-14 px-10 font-bold shadow-xl shadow-primary/30"
                          disabled={isPending || otpCode.length !== 6}
                          onClick={handleVerifyOtp}
                        >
                          {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                          Verify
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Results Section */}
                {searchResults && (
                  <div className="animate-in fade-in duration-700 space-y-6 pt-4">
                    <div className="flex items-center justify-between border-b border-border/50 pb-4">
                      <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16 border-4 border-primary/10 shadow-lg">
                            <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">
                              {searchResults.patient.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-2xl font-bold text-foreground">{searchResults.patient.name}</h3>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="font-mono bg-secondary/50 border-none">{searchResults.patient.national_id}</Badge>
                              <Badge className="bg-emerald-500/10 text-emerald-600 border-none">Verified Account</Badge>
                            </div>
                          </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-bold flex items-center gap-2">
                        <Pill className="h-5 w-5 text-primary" /> Active Prescriptions
                      </h4>
                      
                      {searchResults.prescriptions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {searchResults.prescriptions.map((p: any) => (
                            <Card key={p.id} className={`overflow-hidden rounded-3xl border-none shadow-md transition-all hover:shadow-xl ${p.status === 'dispensed' ? 'bg-secondary/10 opacity-70' : 'bg-background border border-primary/10 ring-1 ring-primary/5'}`}>
                              <CardContent className="p-6 space-y-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h5 className="text-xl font-bold text-foreground">{p.medication_name}</h5>
                                    <p className="text-sm text-muted-foreground font-medium">{p.dosage} • {p.frequency}</p>
                                  </div>
                                  <Badge variant={p.status === 'dispensed' ? 'secondary' : 'default'} className="rounded-full px-3 py-1">
                                    {p.status.toUpperCase()}
                                  </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-4 py-3 border-y border-border/50">
                                  <div className="space-y-1">
                                      <p className="text-[10px] font-black uppercase text-muted-foreground/80">Doctor</p>
                                      <p className="text-xs font-bold truncate">Dr. {p.doctor_name}</p>
                                      <p className="text-[9px] text-primary font-medium">{p.doctor_specialty}</p>
                                  </div>
                                  <div className="space-y-1">
                                      <p className="text-[10px] font-black uppercase text-muted-foreground/80">Prescribed On</p>
                                      <p className="text-xs font-bold">{p.visit_date}</p>
                                      <p className="text-[9px] text-muted-foreground">{p.duration}</p>
                                  </div>
                                </div>

                                {p.notes && (
                                  <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/10">
                                    <p className="text-[10px] font-black uppercase text-amber-600/70 mb-1">Pharmacist Notes</p>
                                    <p className="text-xs text-amber-800/80 leading-relaxed italic">{p.notes}</p>
                                  </div>
                                )}

                                <div className="pt-2 flex flex-col gap-2">
                                  {p.status === 'pending' ? (
                                    <>
                                      <Button 
                                        className="w-full rounded-2xl h-12 font-bold shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90"
                                        onClick={() => handleDispense(p.id)}
                                        disabled={isPending}
                                      >
                                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Pill className="mr-2 h-4 w-4" />}
                                        Dispense Medication
                                      </Button>
                                      <Button 
                                        variant="outline"
                                        className="w-full rounded-2xl h-12 font-bold border-destructive/20 text-destructive hover:bg-destructive/10"
                                        onClick={() => handleCancel(p.id)}
                                        disabled={isPending}
                                      >
                                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />}
                                        Mark as Inactive
                                      </Button>
                                    </>
                                  ) : (
                                    <div className={`flex items-center justify-center gap-2 py-3 rounded-2xl font-bold border ${p.status === 'dispensed' ? 'bg-emerald-500/5 text-emerald-600 border-emerald-500/10' : 'bg-destructive/5 text-destructive border-destructive/10'}`}>
                                      {p.status === 'dispensed' ? <CheckCircle2 className="h-5 w-5" /> : <X className="h-5 w-5" />}
                                      {p.status === 'dispensed' ? `Dispensed on ${p.dispensed_at?.split('T')[0]}` : 'Cancelled / Not Used'}
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-secondary/20 rounded-3xl p-12 text-center border-2 border-dashed border-border">
                          <Clock className="h-10 w-10 mx-auto text-muted-foreground opacity-30 mb-4" />
                          <h5 className="text-lg font-bold opacity-60">No Pending Prescriptions</h5>
                          <p className="text-sm text-muted-foreground max-w-[250px] mx-auto mt-1">This patient has no active medications waiting for pickup.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qr" className="mt-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Card className="max-w-2xl mx-auto border-none shadow-2xl shadow-black/5 bg-card/80 backdrop-blur-xl">
              <CardContent className="py-12">
                <div className="inline-block p-10 bg-white dark:bg-muted rounded-[3rem] border-2 border-dashed border-primary/20 mb-8 overflow-hidden shadow-inner relative group">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    {qrImage ? (
                      <img src={qrImage} alt="Pharma QR Code" className="h-56 w-56 object-contain relative z-10" />
                    ) : (
                      <div className="h-56 w-56 flex items-center justify-center relative z-10">
                        <QrCode className="h-24 w-24 text-foreground opacity-10 animate-pulse" />
                      </div>
                    )}
                </div>
                <h3 className="text-2xl font-black mb-3">Pharmacist Access Card</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-10 leading-relaxed">
                  This is your unique digital identifier. Scan it on any authorized HealthHub terminal to instantly securely log into your workspace.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="rounded-2xl px-10 h-14 font-black shadow-xl shadow-primary/25 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleRegenerateQr} disabled={qrLoading}>
                    <Plus className="mr-2 h-5 w-5" />
                    {qrLoading ? "Generating..." : "Renew Digital ID"}
                  </Button>
                  <Button
                      variant="outline"
                      className="rounded-2xl px-10 h-14 font-black border-2 hover:bg-muted shadow-lg shadow-black/5 transition-all active:scale-95"
                      disabled={!qrImage}
                      onClick={() => {
                        if (!qrImage) return
                        const link = document.createElement("a")
                        link.href = qrImage
                        link.download = `Pharma_Digitial_ID_${profile?.name?.replace(/\s/g, "_")}.png`
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                      }}
                    >
                      <Download className="mr-2 h-5 w-5" /> Download ID
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}
