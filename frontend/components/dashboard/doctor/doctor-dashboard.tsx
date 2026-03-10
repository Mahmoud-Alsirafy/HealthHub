"use client"

import { useState, useEffect, useTransition, useRef } from "react"
import {
  LayoutDashboard,
  Search,
  UserPlus,
  FileText,
  Stethoscope,
  Pill,
  FlaskConical,
  Clock,
  Users,
  Loader2,
  ChevronRight,
  AlertTriangle,
  Info,
  Plus,
  User as UserIcon,
  QrCode,
  X,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import {
  getDoctorMeApi,
  getDoctorPatientsApi,
  getPatientDetailsApi,
  searchPatientApi,
  searchByQrApi,
  storeReportApi,
  API_BASE_URL,
} from "@/lib/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp"
import { verifyPatientAccessApi } from "@/lib/api"

const navItems = [
  { title: "Overview", href: "/dashboard/doctor", icon: LayoutDashboard },
  { title: "Search Patient", href: "/dashboard/doctor", icon: Search },
  { title: "My Patients", href: "/dashboard/doctor", icon: Users, badge: "4" },
  { title: "Add Diagnosis", href: "/dashboard/doctor", icon: Stethoscope },
  { title: "Prescriptions", href: "/dashboard/doctor", icon: Pill },
  { title: "Lab Results", href: "/dashboard/doctor", icon: FlaskConical },
]

export function DoctorDashboardContent() {
  const [isPending, startTransition] = useTransition()
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [patients, setPatients] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [pendingPatient, setPendingPatient] = useState<{ id: number; name: string } | null>(null)
  const [otpCode, setOtpCode] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("overview")

  // ✅ QR Scanner states
  const [scannerOpen, setScannerOpen] = useState(false)
  const [scannerError, setScannerError] = useState<string | null>(null)
  const html5QrCodeRef = useRef<any>(null)

  // Report Form State
  const [reportPatientId, setReportPatientId] = useState("")
  const [diagnosis, setDiagnosis] = useState("")
  const [notes, setNotes] = useState("")
  const [requiredTests, setRequiredTests] = useState("")
  const [nextVisit, setNextVisit] = useState("")

  const token = typeof window !== 'undefined' ? localStorage.getItem("auth_token") : null

  useEffect(() => {
    if (!token) return

    startTransition(async () => {
      try {
        const profileRes = await getDoctorMeApi(token)
        if (profileRes.doctor) {
          setProfile(profileRes.doctor)
          setStats(profileRes.stats)
        }

        const patientsRes = await getDoctorPatientsApi(token)
        if (patientsRes.patients) {
          setPatients(patientsRes.patients)
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data", err)
        toast.error("Failed to load dashboard data")
      }
    })
  }, [token])

  // ✅ QR Scanner useEffect - نفس الـ pattern المصلح
  useEffect(() => {
    let isMounted = true

    if (scannerOpen) {
      const timer = setTimeout(async () => {
        if (!isMounted) return

        const container = document.getElementById("doctor-qr-reader")
        if (!container) return

        try {
          const { Html5Qrcode } = await import("html5-qrcode")
          if (!isMounted) return

          const html5QrCode = new Html5Qrcode("doctor-qr-reader")
          html5QrCodeRef.current = html5QrCode

          await html5QrCode.start(
            { facingMode: "environment" }, // ✅ الكاميرا الخلفية
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText: string) => {
              html5QrCode.stop()
                .then(() => {
                  html5QrCodeRef.current = null
                  setScannerOpen(false)
                  setScannerError(null)
                  handleQrSearch(decodedText) // ✅ بيعدي الـ code مباشرة
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

  const handleSearch = () => {
    if (!searchQuery || !token) return

    startTransition(async () => {
      try {
        const res = await searchPatientApi(token, searchQuery)
        // New flow: backend sends OTP to patient and returns basic info + patient_id
        if (res.status === "pending" && res.patient_id) {
          setPendingPatient({ id: res.patient_id, name: res.patient_name })
          setOtpCode("")
          setSearchResults([])
          toast.message("OTP sent to patient", {
            description: res.message || "Ask the patient for the 6‑digit code.",
          })
        } else if (res.patient) {
          // Fallback if API ever returns full patient directly
          setSearchResults([res.patient])
          setPendingPatient(null)
        } else {
          setSearchResults([])
          setPendingPatient(null)
          toast.error(res.error || "Patient not found")
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
        const res = await verifyPatientAccessApi(token, {
          patient_id: pendingPatient.id,
          otp: otpCode,
        })

        if (res.patient) {
          setSelectedPatient(res.patient)
          setReportPatientId(String(res.patient.id))
          setActiveTab("diagnosis")
          setPendingPatient(null)
          setOtpCode("")
          toast.success(`Access granted to ${res.patient.name}`)
        } else {
          toast.error(res.error || "Invalid OTP code")
        }
      } catch (err) {
        toast.error("Failed to verify OTP")
      }
    })
  }

  // ✅ بيقبل code argument من الـ scanner مباشرة
  const handleQrSearch = (code: string) => {
    if (!code || !token) return

    startTransition(async () => {
      try {
        const res = await searchByQrApi(token, code)
        if (res.patient) {
          setSearchResults([res.patient])
          setActiveTab("search") // ✅ روح لـ tab النتيجة
          toast.success("Patient found via QR")
        } else {
          setSearchResults([])
          toast.error("Invalid QR Code")
        }
      } catch (err) {
        toast.error("QR Scan failed")
      }
    })
  }

  const handleSelectPatient = (patientId: string | number) => {
    if (!token) return

    startTransition(async () => {
      try {
        const res = await getPatientDetailsApi(token, patientId)
        if (res.patient) {
          setSelectedPatient(res.patient)
          setReportPatientId(patientId.toString())
          setActiveTab("diagnosis")
          toast.success(`Loaded details for ${res.patient.name}`)
        } else {
          toast.error("Failed to load patient details")
        }
      } catch (err) {
        toast.error("An error occurred while fetching details")
      }
    })
  }

  const handleSubmitReport = () => {
    if (!reportPatientId || !diagnosis || !token) {
      toast.error("Please fill in required fields")
      return
    }

    startTransition(async () => {
      try {
        const res = await storeReportApi(token, {
          patient_id: reportPatientId,
          diagnosis,
          notes,
          required_tests: requiredTests,
          next_visit_date: nextVisit,
        })

        if (res.report) {
          toast.success("Report submitted successfully")
          setDiagnosis("")
          setNotes("")
          setRequiredTests("")
          setNextVisit("")

          const profileRes = await getDoctorMeApi(token)
          if (profileRes.stats) setStats(profileRes.stats)
        } else {
          toast.error(res.message || "Failed to submit report")
        }
      } catch (err) {
        toast.error("An error occurred")
      }
    })
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
      userRole={profile.specialty}
      userInitials={profile.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Doctor Dashboard</h1>
            <p className="text-muted-foreground">
              {profile.facility} - {profile.specialty}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {stats?.today_reports || 0} reports today
            </Badge>
          </div>
        </div>

        {/* Overview */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Patients</p>
                <p className="text-2xl font-bold text-foreground">{stats?.total_patients || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                <Stethoscope className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Today</p>
                <p className="text-2xl font-bold text-foreground">{stats?.today_reports || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Facility</p>
                <p className="text-lg font-bold text-foreground truncate max-w-[150px]">{profile.facility}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Badge className="h-5 w-5 rounded-full p-0 flex items-center justify-center">?</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dept</p>
                <p className="text-lg font-bold text-foreground">{profile.department || "General"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-fit h-auto">
            <TabsTrigger value="patients">My Patients</TabsTrigger>
            <TabsTrigger value="search">Search Patient</TabsTrigger>
            <TabsTrigger value="diagnosis">Add Diagnosis & Records</TabsTrigger>
          </TabsList>

          {/* Patients Tab */}
          <TabsContent value="patients" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Patient List</CardTitle>
                <CardDescription>Your assigned and recent patients</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>National ID</TableHead>
                      <TableHead>Blood Type</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Last Visit</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.length > 0 ? patients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                                {patient.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">{patient.name}</p>
                              <p className="text-xs text-muted-foreground">ID: {patient.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{patient.national_id}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{patient.blood_type || "N/A"}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate">{patient.condition || "No diagnosis"}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{patient.last_visit || "Never"}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={() => handleSelectPatient(patient.id)}>
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                          No patients found yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-xl">Patient Discovery</CardTitle>
                <CardDescription>Search the national database or scan a patient's smart medical tag.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 bg-primary/5 rounded-2xl border border-primary/10">

                  {/* Search by National ID */}
                  <div className="space-y-4">
                    <Label className="text-xs font-black uppercase tracking-wider text-primary flex items-center gap-2">
                      <Search className="h-4 w-4" /> Search by National ID
                    </Label>
                    <div className="flex gap-3">
                      <Input
                        className="pl-4 rounded-xl border-primary/20 focus:border-primary h-12 shadow-sm"
                        placeholder="14-digit National ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      />
                      <Button onClick={handleSearch} disabled={isPending} className="rounded-xl h-12 px-6 font-bold shadow-lg shadow-primary/20">
                        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Lookup ID"}
                      </Button>
                    </div>
                  </div>

                  {/* ✅ Scan QR - كاميرا حقيقية */}
                  <div className="space-y-4">
                    <Label className="text-xs font-black uppercase tracking-wider text-accent-foreground flex items-center gap-2">
                      <QrCode className="h-4 w-4" /> Scan Medical QR
                    </Label>

                    {scannerOpen ? (
                      <div className="space-y-3">
                        <div className="aspect-square max-w-[280px] mx-auto bg-muted rounded-2xl border-2 border-dashed relative overflow-hidden">
                          <div id="doctor-qr-reader" className="w-full h-full" />
                        </div>
                        {scannerError && (
                          <p className="text-xs text-destructive text-center">{scannerError}</p>
                        )}
                        <Button
                          variant="outline"
                          className="w-full rounded-xl h-10"
                          onClick={() => {
                            setScannerOpen(false)
                            setScannerError(null)
                          }}
                        >
                          <X className="mr-2 h-4 w-4" /> Cancel Scan
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="secondary"
                        className="w-full rounded-xl h-12 font-bold shadow-lg shadow-black/5 border border-border/50"
                        onClick={() => {
                          setScannerError(null)
                          setScannerOpen(true)
                        }}
                        disabled={isPending}
                      >
                        <QrCode className="mr-2 h-5 w-5" />
                        Open Camera & Scan
                      </Button>
                    )}
                  </div>
                </div>

                {/* OTP Verification Step for National ID search */}
                {pendingPatient && (
                  <div className="mt-2 rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase text-primary/80">Access Verification</p>
                        <p className="text-sm font-semibold text-foreground">
                          Patient: <span className="font-bold">{pendingPatient.name}</span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          An OTP code was sent to the patient's email / phone. Ask them to read it to you and enter it here.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <InputOTP
                        maxLength={6}
                        value={otpCode}
                        onChange={(value) => setOtpCode(value)}
                        containerClassName="w-full justify-center md:justify-start"
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSeparator />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                      <Button
                        className="h-11 rounded-xl px-6 font-bold"
                        disabled={isPending || otpCode.length !== 6}
                        onClick={handleVerifyOtp}
                      >
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ChevronRight className="mr-2 h-4 w-4" />}
                        Verify & Open Records
                      </Button>
                    </div>
                    <p className="text-[11px] text-primary/70">
                      For security, this code expires after a short time. If it fails, search again to send a new OTP.
                    </p>
                  </div>
                )
                }

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="pt-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" /> Search Results
                      </h3>
                      <Badge variant="secondary" className="rounded-full">{searchResults.length} Match found</Badge>
                    </div>
                    {searchResults.map((patient) => (
                      <div key={patient.id} className="flex flex-col gap-5 rounded-2xl border border-border/50 p-6 bg-card shadow-sm hover:shadow-md transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-14 w-14 border-2 border-primary/10">
                              <AvatarFallback className="bg-primary/5 text-primary text-lg font-bold">
                                {patient.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-lg text-foreground">{patient.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-[10px] font-mono">{patient.national_id}</Badge>
                                <Badge className="text-[10px] bg-primary/10 text-primary border-none">{patient.profile?.blood_type || "N/A"}</Badge>
                              </div>
                            </div>
                          </div>
                          <Button className="rounded-xl font-bold" onClick={() => handleSelectPatient(patient.id)}>
                            View Full Records
                          </Button>
                        </div>

                        <div className="mt-2 space-y-2">
                          <h4 className="text-sm font-semibold flex items-center gap-2">
                            <FileText className="h-4 w-4" /> Medical History
                          </h4>
                          <div className="space-y-2">
                            {patient.reports && patient.reports.length > 0 ? (
                              patient.reports.map((report: any) => (
                                <div key={report.id} className="text-sm p-2 bg-secondary/30 rounded border border-border/50">
                                  <div className="flex justify-between items-start mb-1">
                                    <span className="font-medium">{report.diagnosis}</span>
                                    <span className="text-xs text-muted-foreground">{report.date}</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground italic">By {report.doctor_name}</p>
                                  {report.notes && <p className="text-xs mt-1">{report.notes}</p>}
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-muted-foreground">No previous reports found.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Diagnosis Tab */}
          <TabsContent value="diagnosis" className="mt-4">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading border-b pb-2">Patient Records</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {selectedPatient ? (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-sm">
                          <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">
                            {selectedPatient.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="text-xl font-bold text-foreground">{selectedPatient.name}</h3>
                          <Badge variant="secondary" className="mt-1 font-mono">
                            {selectedPatient.national_id}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="p-3 bg-secondary/30 rounded-xl border border-border/50">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Blood Type</p>
                          <p className="font-bold text-primary">{selectedPatient.profile?.blood_type || "N/A"}</p>
                        </div>
                        <div className="p-3 bg-secondary/30 rounded-xl border border-border/50">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Gender</p>
                          <p className="font-bold">{selectedPatient.profile?.gender || "N/A"}</p>
                        </div>
                        <div className="p-3 bg-secondary/30 rounded-xl border border-border/50">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Weight</p>
                          <p className="font-bold">{selectedPatient.profile?.weight ? `${selectedPatient.profile.weight} kg` : "N/A"}</p>
                        </div>
                        <div className="p-3 bg-secondary/30 rounded-xl border border-border/50">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Height</p>
                          <p className="font-bold">{selectedPatient.profile?.height ? `${selectedPatient.profile.height} cm` : "N/A"}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-bold flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-destructive" /> Medical Baseline
                        </h4>
                        <div className="p-4 bg-destructive/5 rounded-xl border border-destructive/10 space-y-3">
                          <div>
                            <p className="text-[10px] font-bold text-destructive/70 uppercase">Chronic Diseases</p>
                            <p className="text-sm font-medium">{selectedPatient.profile?.chronic_diseases || "No chronic diseases reported."}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-destructive/70 uppercase">Allergies</p>
                            <p className="text-sm font-medium">{selectedPatient.profile?.allergies || "No allergies reported."}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm font-bold flex items-center gap-2 uppercase tracking-tight text-muted-foreground">
                          <FlaskConical className="h-4 w-4" /> Patient Attachments
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          {selectedPatient.profile?.images && selectedPatient.profile.images.length > 0 ? (
                            selectedPatient.profile.images.map((img: any) => (
                              <div key={img.id} className="group relative aspect-video rounded-xl border bg-muted overflow-hidden shadow-sm hover:shadow-md transition-all">
                                {img.filename.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                                  <img
                                    src={`${API_BASE_URL.replace('/api', '')}/attachments/PatientProfile/${selectedPatient.profile.id}/${img.filename}`}
                                    className="h-full w-full object-cover"
                                    alt={img.title}
                                  />
                                ) : (
                                  <div className="flex h-full w-full flex-col items-center justify-center gap-2">
                                    <FileText className="h-8 w-8 text-primary/40" />
                                    <span className="text-[10px] font-bold uppercase opacity-40">Document</span>
                                  </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-3 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                  <p className="text-[10px] text-white truncate font-bold mb-1">{img.title}</p>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    className="h-7 text-[10px] font-bold rounded-lg w-full"
                                    onClick={() => window.open(`${API_BASE_URL.replace('/api', '')}/attachments/PatientProfile/${selectedPatient.profile.id}/${img.filename}`, '_blank')}
                                  >
                                    View Document
                                  </Button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="col-span-2 text-sm text-muted-foreground italic bg-secondary/10 p-8 rounded-2xl border border-dashed border-border flex flex-col items-center gap-2">
                              <Info className="h-5 w-5 opacity-20" />
                              <p>No medical files uploaded by patient.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-24 text-center space-y-4">
                      <div className="h-20 w-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto text-primary/20">
                        <Users className="h-10 w-10" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-lg">No Patient Selected</p>
                        <p className="text-muted-foreground text-sm max-w-[200px] mx-auto">
                          Select a patient from <span className="text-primary font-medium">My Patients</span> or search to view records.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-primary/20 shadow-lg shadow-primary/5">
                <CardHeader>
                  <CardTitle className="font-heading flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-primary" />
                    Medical Reporting
                  </CardTitle>
                  <CardDescription>Document the patient's current clinical status and treatment plan.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">Primary Diagnosis</Label>
                      <Input
                        className="rounded-xl border-primary/20 focus:border-primary h-12"
                        placeholder="Clinical diagnosis or findings..."
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        disabled={!selectedPatient}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">Doctor's Notes & Advice</Label>
                      <Textarea
                        className="rounded-xl border-primary/20 focus:border-primary min-h-[160px]"
                        placeholder="Detailed observations, recommended medications, and patient advice..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        disabled={!selectedPatient}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Required Tests</Label>
                        <Input
                          className="rounded-xl border-primary/20"
                          placeholder="e.g. Blood Work, Imaging"
                          value={requiredTests}
                          onChange={(e) => setRequiredTests(e.target.value)}
                          disabled={!selectedPatient}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-muted-foreground">Follow-up Date</Label>
                        <Input
                          type="date"
                          className="rounded-xl border-primary/20 h-10"
                          value={nextVisit}
                          onChange={(e) => setNextVisit(e.target.value)}
                          disabled={!selectedPatient}
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full h-14 rounded-xl font-bold text-base shadow-xl shadow-primary/20"
                    onClick={handleSubmitReport}
                    disabled={isPending || !selectedPatient || !diagnosis}
                  >
                    {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Plus className="mr-2 h-5 w-5" />}
                    Save Clinical Report
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Medical Timeline */}
            {selectedPatient && selectedPatient.reports && selectedPatient.reports.length > 0 && (
              <div className="mt-10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" /> Longitudinal Medical History
                  </h3>
                  <Badge variant="outline">{selectedPatient.reports.length} Records found</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {selectedPatient.reports.map((report: any) => (
                    <Card key={report.id} className="relative overflow-hidden border-none shadow-md shadow-black/5 bg-background group">
                      <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                      <CardHeader className="pb-3 px-6">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">{report.diagnosis}</CardTitle>
                          <span className="text-[10px] font-black text-muted-foreground opacity-40">{report.date}</span>
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                          <UserIcon className="h-3 w-3" /> Dr. {report.doctor_name}
                        </p>
                      </CardHeader>
                      <CardContent className="px-6 pb-6 pt-0">
                        <div className="space-y-4">
                          {report.notes && (
                            <div className="text-sm bg-secondary/20 p-3 rounded-xl border border-border/40">
                              <p className="leading-relaxed opacity-90">{report.notes}</p>
                            </div>
                          )}
                          <div className="flex flex-wrap gap-2 pt-2">
                            {report.required_tests && (
                              <Badge variant="outline" className="text-[10px] rounded-lg border-primary/20 text-primary">
                                Tests: {report.required_tests}
                              </Badge>
                            )}
                            {report.next_visit_date && (
                              <Badge variant="outline" className="text-[10px] rounded-lg border-accent-foreground/20 text-accent-foreground">
                                Next Visit: {report.next_visit_date}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}