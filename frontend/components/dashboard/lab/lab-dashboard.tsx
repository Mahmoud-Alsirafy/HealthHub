"use client"

import { useState, useEffect, useTransition, useRef } from "react"
import {
  LayoutDashboard,
  Search,
  FileText,
  Clock,
  QrCode,
  Loader2,
  CheckCircle2,
  X,
  Plus,
  Download,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import {
  searchLabPatientApi,
  verifyLabAccessApi,
  completeLabReportApi,
  getLabQrApi,
  regenerateLabQrApi,
  getLabMeApi,
} from "@/lib/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp"

export function LabDashboardContent() {
  const [isPending, startTransition] = useTransition()
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState<any>({ total_completed: 0, pending: 0 })
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any>(null)
  const [pendingPatient, setPendingPatient] = useState<{ id: number; name: string } | null>(null)
  const [otpCode, setOtpCode] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  // ✅ QR Scanner states
  const [scannerOpen, setScannerOpen] = useState(false)
  const html5QrCodeRef = useRef<any>(null)

  // QR Generate States
  const [qrImage, setQrImage] = useState<string | null>(null)
  const [qrLoading, setQrLoading] = useState(false)

  // Result Upload States
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [resultText, setResultText] = useState("")
  const [notesText, setNotesText] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null

  const navItems = [
    {
      title: "Overview",
      icon: LayoutDashboard,
      onClick: () => setActiveTab("overview"),
      isActive: activeTab === "overview",
    },
    {
      title: "Patient Search",
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

  useEffect(() => {
    if (!token) return
    // Fetch Lab Profile
    getLabMeApi(token).then(res => {
      if (res.user) {
        setProfile(res.user)
        setStats(res.stats)
      }
    })
    // Fetch Lab QR
    getLabQrApi(token).then(res => {
      if (res.qr_image) setQrImage(res.qr_image)
    })
  }, [token])

  const handleSearchRequest = (query?: string) => {
    const q = query || searchQuery
    if (!q || !token) return

    startTransition(async () => {
      try {
        const res = await searchLabPatientApi(token, q)
        if (res.success && res.status === "pending") {
          setPendingPatient({ id: res.patient_id, name: res.patient_name })
          setOtpCode("")
          setSearchResults(null)
          toast.message("OTP sent to patient")
        } else if (res.success && res.patient) {
          setSearchResults({ patient: res.patient, reports: res.pending_reports || [] })
          setPendingPatient(null)
          toast.success("Patient records found")
        } else {
          toast.error(res.message || "Patient not found")
        }
      } catch (err) {
        toast.error("Search failed")
      }
    })
  }

  const handleVerifyOtp = () => {
    if (!token || !pendingPatient || otpCode.length !== 6) return

    startTransition(async () => {
      try {
        const res = await verifyLabAccessApi(token, {
          patient_id: pendingPatient.id,
          otp: otpCode,
        })

        if (res.success && res.patient) {
          setSearchResults({ patient: res.patient, reports: res.pending_reports || [] })
          setPendingPatient(null)
          setOtpCode("")
          toast.success(`Access granted`)
        } else {
          toast.error(res.error || "Invalid OTP code")
        }
      } catch (err) {
        toast.error("Failed to verify OTP")
      }
    })
  }

  const handleCompleteReport = () => {
    if (!token || !selectedReport) return

    const formData = new FormData()
    formData.append("result", resultText)
    formData.append("notes", notesText)
    selectedFiles.forEach((file) => {
      formData.append("files[]", file)
    })

    startTransition(async () => {
      try {
        const res = await completeLabReportApi(token, selectedReport.id, formData)
        if (res.success) {
          toast.success("Report uploaded successfully")
          // Remove from list
          setSearchResults((prev: any) => ({
            ...prev,
            reports: prev.reports.filter((r: any) => r.id !== selectedReport.id)
          }))
          setSelectedReport(null)
          setResultText("")
          setNotesText("")
          setSelectedFiles([])
        } else {
          toast.error(res.message || "Upload failed")
        }
      } catch (err) {
        toast.error("An error occurred")
      }
    })
  }

  const handleRegenerateQr = () => {
    if (!token) return
    setQrLoading(true)
    regenerateLabQrApi(token)
      .then((res) => {
        if (res.qr_image) {
          setQrImage(res.qr_image)
          toast.success("New QR code generated.")
        } else toast.error("Failed to regenerate QR code")
      })
      .catch(() => toast.error("Failed to regenerate QR code"))
      .finally(() => setQrLoading(false))
  }

  // ✅ QR Scanner useEffect
  useEffect(() => {
    let isMounted = true
    if (scannerOpen) {
      const timer = setTimeout(async () => {
        if (!isMounted) return
        try {
          const { Html5Qrcode } = await import("html5-qrcode")
          const html5QrCode = new Html5Qrcode("lab-qr-reader")
          html5QrCodeRef.current = html5QrCode
          await html5QrCode.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText: string) => {
              html5QrCode.stop().then(() => {
                setScannerOpen(false)
                handleSearchRequest(decodedText)
              })
            },
            () => {}
          )
        } catch (err) {
          console.error("Scanner error:", err)
        }
      }, 500)
      return () => {
        isMounted = false
        clearTimeout(timer)
        if (html5QrCodeRef.current?.isScanning) {
          html5QrCodeRef.current.stop()
        }
      }
    }
  }, [scannerOpen])

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
      userName={profile?.email || "Laboratory"}
      userRole={profile?.name || "Cairo Lab"}
      userInitials={profile?.name?.charAt(0) || "L"}
    >
      <div className="space-y-6 pb-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Lab Dashboard</h1>
            <p className="text-muted-foreground">Search patients and upload diagnostic results.</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md h-auto p-1 bg-muted/30">
            <TabsTrigger value="overview" className="rounded-xl py-2">Overview</TabsTrigger>
            <TabsTrigger value="search" className="rounded-xl py-2">Search & Results</TabsTrigger>
            <TabsTrigger value="qr" className="rounded-xl py-2">My QR Code</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-emerald-500/5 border-emerald-500/10">
                <CardContent className="p-6">
                  <p className="text-sm font-bold text-emerald-600/60 uppercase tracking-wider mb-1 text-emerald-600">Reports Completed</p>
                  <p className="text-3xl font-black text-foreground">{stats?.completed_tests ?? 48}</p>
                </CardContent>
              </Card>
              <Card className="bg-amber-500/5 border-amber-500/10">
                <CardContent className="p-6">
                  <p className="text-sm font-bold text-amber-600/60 uppercase tracking-wider mb-1 text-amber-600">Pending Tests</p>
                  <p className="text-3xl font-black text-foreground">{stats?.pending_tests ?? 12}</p>
                </CardContent>
              </Card>
              <Card className="bg-blue-500/5 border-blue-500/10">
                <CardContent className="p-6">
                  <p className="text-sm font-bold text-blue-600/60 uppercase tracking-wider mb-1 text-blue-600">Total Reports</p>
                  <p className="text-3xl font-black text-foreground">{stats?.total_reports ?? 156}</p>
                </CardContent>
              </Card>
              <Card className="bg-indigo-500/5 border-indigo-500/10">
                <CardContent className="p-6">
                  <p className="text-sm font-bold text-indigo-600/60 uppercase tracking-wider mb-1 text-indigo-600">Verified Staff</p>
                  <p className="text-3xl font-black text-foreground">{stats?.staff_count ?? 4}</p>
                </CardContent>
              </Card>
            </div>
            
            <Card className="border-border/40 bg-primary/5">
                <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <FileText className="h-10 w-10" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold">Ready to process?</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            Search for a patient by National ID or QR code to view their required medical tests and upload results.
                        </p>
                    </div>
                    <Button className="rounded-xl h-11 px-8 font-bold" onClick={() => setActiveTab("search")}>
                        Search Patient
                    </Button>
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="search" className="mt-6 space-y-8">
            <Card className="border-border/50 shadow-xl rounded-3xl overflow-hidden">
               <CardHeader className="bg-muted/30 pb-8">
                <CardTitle className="font-heading text-2xl text-foreground">Patient Lookup</CardTitle>
                <CardDescription>Scan QR or enter National ID to fetch required laboratory tests.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-secondary/20 rounded-3xl border border-border/50">
                  <div className="space-y-4">
                    <Label className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                      <Search className="h-4 w-4" /> National ID Search
                    </Label>
                    <div className="flex gap-3">
                      <Input
                        className="pl-5 rounded-2xl border-none bg-background h-14 shadow-inner text-lg"
                        placeholder="14-digit ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearchRequest()}
                      />
                      <Button onClick={() => handleSearchRequest()} disabled={isPending} className="rounded-2xl h-14 px-8 font-bold bg-primary shadow-lg shadow-primary/25">
                        {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Search"}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-xs font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                      <QrCode className="h-4 w-4" /> QR Access
                    </Label>
                    {scannerOpen ? (
                        <div className="space-y-3">
                            <div className="aspect-square max-w-[240px] mx-auto bg-black rounded-3xl border-4 border-primary/30 relative overflow-hidden">
                                <div id="lab-qr-reader" className="w-full h-full" />
                            </div>
                            <Button variant="outline" className="w-full rounded-2xl h-12" onClick={() => setScannerOpen(false)}>
                                <X className="mr-2 h-5 w-5" /> Cancel
                            </Button>
                        </div>
                    ) : (
                        <Button
                            variant="secondary"
                            className="w-full rounded-2xl h-14 font-bold bg-background border border-border/50"
                            onClick={() => setScannerOpen(true)}
                        >
                            <QrCode className="mr-3 h-6 w-6 text-primary" />
                            Scan Patient QR
                        </Button>
                    )}
                  </div>
                </div>

                {pendingPatient && (
                  <div className="rounded-3xl border-2 border-primary/20 bg-primary/5 p-8 space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <p className="text-xs font-black uppercase text-primary/70">OTP Verification Required</p>
                            <h3 className="text-2xl font-bold">{pendingPatient.name}</h3>
                            <p className="text-sm text-muted-foreground">Ask the patient for the 6-digit code sent to their phone.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode}>
                                <InputOTPGroup>
                                    <InputOTPSlot index={0} className="h-14 w-12 bg-background border-primary/20 rounded-l-xl" />
                                    <InputOTPSlot index={1} className="h-14 w-12 bg-background border-primary/20" />
                                    <InputOTPSlot index={2} className="h-14 w-12 bg-background border-primary/20" />
                                </InputOTPGroup>
                                <InputOTPSeparator />
                                <InputOTPGroup>
                                    <InputOTPSlot index={3} className="h-14 w-12 bg-background border-primary/20" />
                                    <InputOTPSlot index={4} className="h-14 w-12 bg-background border-primary/20" />
                                    <InputOTPSlot index={5} className="h-14 w-12 bg-background border-primary/20 rounded-r-xl" />
                                </InputOTPGroup>
                            </InputOTP>
                            <Button size="lg" className="rounded-2xl h-14 px-10 font-bold" onClick={handleVerifyOtp} disabled={otpCode.length !== 6 || isPending}>
                                Verify Access
                            </Button>
                        </div>
                    </div>
                  </div>
                )}

                {searchResults && (
                  <div className="space-y-6 pt-4">
                    <div className="flex items-center gap-4 border-b pb-6 border-border/50">
                        <Avatar className="h-16 w-16 border-4 border-primary/10">
                            <AvatarFallback className="bg-primary/5 text-primary text-xl font-bold">
                                {searchResults.patient.name?.charAt(0) || "P"}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-2xl font-bold">{searchResults.patient.name}</h3>
                            <Badge variant="outline" className="font-mono bg-secondary/50 text-foreground">{searchResults.patient.national_id}</Badge>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-lg font-bold flex items-center gap-2 text-foreground">
                            <FileText className="h-5 w-5 text-primary" /> Requested Laboratory Tests
                        </h4>
                        
                        {searchResults.reports.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {searchResults.reports.map((report: any) => (
                                    <Card key={report.id} className="rounded-3xl border-primary/10 overflow-hidden hover:shadow-lg transition-shadow">
                                        <CardContent className="p-6 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h5 className="text-xl font-bold text-primary">{report.test_name}</h5>
                                                    <p className="text-sm text-muted-foreground mt-1">Requested on {report.created_at?.split('T')[0]}</p>
                                                </div>
                                                <Badge className="bg-secondary text-secondary-foreground font-bold">PENDING</Badge>
                                            </div>

                                            <div className="bg-muted/30 p-3 rounded-2xl space-y-1">
                                                <p className="text-[10px] font-black uppercase text-muted-foreground">Prescribing Physician</p>
                                                <p className="text-sm font-bold text-foreground">{"Dr. " + (report.doctor_name || "Medical Professional")}</p>
                                            </div>

                                            {report.notes && (
                                                <div className="p-3 bg-amber-500/5 rounded-2xl border border-amber-500/10">
                                                    <p className="text-[10px] font-black uppercase text-amber-600">Doctor's Notes</p>
                                                    <p className="text-xs italic text-foreground">{report.notes}</p>
                                                </div>
                                            )}

                                            <Button 
                                                className="w-full rounded-2xl h-12 font-bold" 
                                                onClick={() => setSelectedReport(report)}
                                            >
                                                Upload Results
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-secondary/10 rounded-3xl p-12 text-center border-2 border-dashed">
                                <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500 opacity-50 mb-3" />
                                <h5 className="text-lg font-bold">All tests completed</h5>
                                <p className="text-sm text-muted-foreground">No pending lab orders for this patient.</p>
                            </div>
                        )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results Upload Form */}
            {selectedReport && (
                <Card className="border-primary/20 shadow-2xl rounded-3xl animate-in zoom-in-95 duration-300">
                    <CardHeader className="flex flex-row items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-[10px] font-bold text-primary border-primary/20">PATIENT: {searchResults.patient.name}</Badge>
                                <Badge variant="outline" className="text-[10px] font-mono">{searchResults.patient.national_id}</Badge>
                            </div>
                            <CardTitle className="text-2xl font-bold">Process Result: {selectedReport.test_name}</CardTitle>
                            <CardDescription>Fill in the diagnosis results and upload scanned images or documents.</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedReport(null)}>
                            <X className="h-6 w-6" />
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label className="font-bold flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" /> Result Interpretation
                            </Label>
                            <Textarea 
                                placeholder="Enter specific readings, positive/negative, or summary findings..." 
                                className="min-h-[120px] rounded-2xl border-border/50 bg-muted/20"
                                value={resultText}
                                onChange={(e) => setResultText(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="font-bold">Additional Notes</Label>
                            <Textarea 
                                placeholder="Any internal lab notes or observations..." 
                                className="min-h-[80px] rounded-2xl border-border/50 bg-muted/20"
                                value={notesText}
                                onChange={(e) => setNotesText(e.target.value)}
                            />
                        </div>

                        <div className="space-y-4">
                            <Label className="font-bold flex items-center gap-2">
                                <Upload className="h-4 w-4" /> Lab Result Files (Photos/PDF)
                            </Label>
                            <div 
                                className="border-2 border-dashed border-primary/20 rounded-3xl p-8 text-center bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
                                onClick={() => document.getElementById('lab-file-upload')?.click()}
                            >
                                <input 
                                    id="lab-file-upload" 
                                    type="file" 
                                    multiple 
                                    className="hidden" 
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            setSelectedFiles(Array.from(e.target.files))
                                        }
                                    }}
                                />
                                <div className="flex flex-col items-center gap-2">
                                    <ImageIcon className="h-10 w-10 text-primary opacity-50" />
                                    <p className="font-bold text-primary">Click to upload files</p>
                                    <p className="text-xs text-muted-foreground">JPEG, PNG, PDF up to 10MB each</p>
                                </div>
                            </div>

                            {selectedFiles.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {selectedFiles.map((f, i) => (
                                        <Badge key={i} variant="secondary" className="px-3 py-1 rounded-full gap-2">
                                            {f.name}
                                            <X className="h-3 w-3 cursor-pointer" onClick={(e) => {
                                                e.stopPropagation()
                                                setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))
                                            }} />
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button 
                                className="flex-1 rounded-2xl h-14 font-black text-lg" 
                                onClick={handleCompleteReport}
                                disabled={isPending || (!resultText && selectedFiles.length === 0)}
                            >
                                {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Save & Mark as Completed"}
                            </Button>
                            <Button 
                                variant="outline" 
                                className="rounded-2xl h-14 px-8 font-bold"
                                onClick={() => setSelectedReport(null)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
          </TabsContent>

          <TabsContent value="qr" className="mt-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
             <Card className="max-w-2xl mx-auto border-none shadow-2xl bg-card/80 backdrop-blur-xl">
              <CardContent className="py-12">
                <div className="inline-block p-10 bg-white dark:bg-muted rounded-[3rem] border-2 border-dashed border-primary/20 mb-8 overflow-hidden shadow-inner relative group">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    {qrImage ? (
                      <img src={qrImage} alt="Lab QR Code" className="h-56 w-56 object-contain relative z-10" />
                    ) : (
                      <div className="h-56 w-56 flex items-center justify-center relative z-10">
                        <QrCode className="h-24 w-24 text-foreground opacity-10 animate-pulse" />
                      </div>
                    )}
                </div>
                <h3 className="text-2xl font-black mb-3">Facility Access Card</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-10 leading-relaxed">
                  Laboratory staff can use this QR to log into shared terminals or verify their identity at check-in.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="rounded-2xl px-10 h-14 font-black shadow-xl shadow-primary/25 bg-primary" onClick={handleRegenerateQr} disabled={qrLoading}>
                    <Plus className="mr-2 h-5 w-5" />
                    {qrLoading ? "Generating..." : "Regenerate ID"}
                  </Button>
                  <Button
                      variant="outline"
                      className="rounded-2xl px-10 h-14 font-black border-2"
                      disabled={!qrImage}
                      onClick={() => {
                        if (!qrImage) return
                        const link = document.createElement("a")
                        link.href = qrImage
                        link.download = `Lab_ID_${profile?.name?.replace(/\s/g, "_")}.png`
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                      }}
                    >
                      <Download className="mr-2 h-5 w-5" /> Download
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
