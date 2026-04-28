"use client"

import { useState, useEffect, useTransition, useRef } from "react"
import {
  LayoutDashboard,
  Search,
  FileText,
  Activity,
  Pill,
  FlaskConical,
  Clock,
  Loader2,
  ChevronRight,
  AlertTriangle,
  QrCode,
  X,
  User as UserIcon,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import {
  getParamedicMeApi,
  searchParamedicPatientApi,
  getParamedicQrApi,
  regenerateParamedicQrApi,
  API_BASE_URL,
} from "@/lib/api"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"

export function ParamedicDashboardContent() {
  const [isPending, startTransition] = useTransition()
  const [profile, setProfile] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("search")

  // QR Scanner states
  const [scannerOpen, setScannerOpen] = useState(false)
  const [scannerError, setScannerError] = useState<string | null>(null)
  const html5QrCodeRef = useRef<any>(null)

  // My QR Code states
  const [qrImage, setQrImage] = useState<string | null>(null)
  const [qrLoading, setQrLoading] = useState(false)

  const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null

  const navItems = [
    {
      title: "Search Patient",
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

    startTransition(async () => {
      try {
        const profileRes = await getParamedicMeApi(token)
        if (profileRes.user) {
          setProfile(profileRes.user)
        }

        const qrRes = await getParamedicQrApi(token)
        if (qrRes.qr_image) setQrImage(qrRes.qr_image)
      } catch (err) {
        console.error("Failed to fetch dashboard data", err)
        toast.error("Failed to load dashboard data")
      }
    })
  }, [token])

  const handleRegenerateQr = () => {
    if (!token) return
    setQrLoading(true)
    regenerateParamedicQrApi(token)
      .then((res: any) => {
        if (res.qr_image) {
          setQrImage(res.qr_image)
          toast.success(res.message || "New QR code generated.")
        } else toast.error(res.error || "Failed to regenerate QR code")
      })
      .catch(() => toast.error("Failed to regenerate QR code"))
      .finally(() => setQrLoading(false))
  }

  // QR Scanner Effect
  useEffect(() => {
    let isMounted = true

    if (scannerOpen) {
      const timer = setTimeout(async () => {
        if (!isMounted) return

        const container = document.getElementById("paramedic-qr-reader")
        if (!container) return

        try {
          const { Html5Qrcode } = await import("html5-qrcode")
          if (!isMounted) return

          const html5QrCode = new Html5Qrcode("paramedic-qr-reader")
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
                  // QR code might be a full URL, we need the code part
                  const code = decodedText.split('/').pop() || decodedText
                  handleSearch(code)
                })
                .catch(console.error)
            },
            () => {}
          )
        } catch (err) {
          console.error("Scanner error:", err)
          setScannerError("Unable to access camera.")
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

  const handleSearch = (query?: string) => {
    const q = query || searchQuery
    if (!q || !token) {
        toast.error("Please enter a National ID or scan a QR code")
        return
    }

    startTransition(async () => {
      try {
        const res = await searchParamedicPatientApi(token, q)
        if (res.success && res.patient) {
          setSelectedPatient(res.patient)
          toast.success(`Patient record found for ${res.patient.name}`)
        } else {
          toast.error(res.message || "Patient not found")
        }
      } catch (err) {
        toast.error("Search failed")
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
      userRole="Emergency Paramedic"
      userInitials={profile.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
    >
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="font-heading text-3xl font-black text-foreground tracking-tight">Paramedic Dashboard</h1>
          <p className="text-muted-foreground">Emergency medical responder portal. Quick access to patient life-saving data.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px] mb-8 bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="search" className="rounded-lg font-bold">Patient Lookup</TabsTrigger>
            <TabsTrigger value="qr" className="rounded-lg font-bold">My ID QR</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
            {/* Search Controls */}
            <Card className="border-2 border-primary/20 shadow-xl shadow-primary/5 overflow-hidden rounded-2xl">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="p-8 space-y-4 border-b md:border-b-0 md:border-r border-border/50">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">National Identity Lookup</Label>
                    <div className="flex gap-2">
                      <Input
                        className="h-14 rounded-xl border-2 border-primary/10 focus:border-primary bg-background shadow-inner text-lg font-mono"
                        placeholder="Enter 14-digit ID"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      />
                      <Button 
                        size="icon" 
                        className="h-14 w-14 rounded-xl shadow-lg shadow-primary/20" 
                        onClick={() => handleSearch()}
                        disabled={isPending}
                      >
                        {isPending ? <Loader2 className="h-6 w-6 animate-spin" /> : <ChevronRight className="h-6 w-6" />}
                      </Button>
                    </div>
                  </div>

                  <div className="p-8 bg-primary/5 flex flex-col justify-center items-center text-center space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Emergency QR Scan</Label>
                    {scannerOpen ? (
                      <div className="w-full max-w-[200px] space-y-4">
                         <div id="paramedic-qr-reader" className="aspect-square rounded-2xl bg-black overflow-hidden border-4 border-primary shadow-2xl" />
                         <Button variant="destructive" className="w-full rounded-xl" onClick={() => setScannerOpen(false)}>
                           <X className="mr-2 h-4 w-4" /> Stop Scanner
                         </Button>
                      </div>
                    ) : (
                      <Button 
                        variant="secondary" 
                        className="h-14 px-8 rounded-xl font-black text-primary border-2 border-primary/20 shadow-lg hover:shadow-xl transition-all"
                        onClick={() => setScannerOpen(true)}
                      >
                        <QrCode className="mr-2 h-6 w-6" /> Open Scanner
                      </Button>
                    )}
                    {scannerError && <p className="text-xs text-destructive font-bold">{scannerError}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Patient Data Display */}
            {selectedPatient && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                {/* Emergency Summary Card */}
                <Card className="border-l-8 border-l-destructive border-2 bg-card overflow-hidden rounded-2xl shadow-xl">
                  <CardHeader className="flex flex-row items-center gap-6 p-8 bg-destructive/5 border-b">
                    <Avatar className="h-24 w-24 border-4 border-background shadow-2xl scale-110">
                      <AvatarFallback className="bg-destructive text-destructive-foreground text-3xl font-black leading-none">
                        {selectedPatient.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <Badge variant="destructive" className="mb-2 font-black uppercase tracking-wider">Emergency Medical File</Badge>
                      <CardTitle className="text-3xl font-black tracking-tight">{selectedPatient.name}</CardTitle>
                      <CardDescription className="text-base text-muted-foreground font-mono">National ID: {selectedPatient.national_id}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Critical Info */}
                    <div className="space-y-6">
                      <div className="space-y-4 p-6 rounded-2xl bg-destructive/10 border-2 border-destructive/20 shadow-inner">
                         <h3 className="text-xs font-black uppercase tracking-widest text-destructive flex items-center gap-2">
                           <AlertTriangle className="h-4 w-4" /> Life-Saving Data
                         </h3>
                         <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1">
                             <p className="text-[10px] text-muted-foreground uppercase font-bold">Blood Type</p>
                             <p className="text-3xl font-black text-red-600">{selectedPatient.profile?.blood_type || "UNK"}</p>
                           </div>
                           <div className="space-y-1">
                             <p className="text-[10px] text-muted-foreground uppercase font-bold">Gender</p>
                             <p className="text-xl font-black text-foreground">{selectedPatient.profile?.gender || "N/A"}</p>
                           </div>
                         </div>
                         <div className="pt-2 border-t border-destructive/20 space-y-3">
                            <div>
                                <p className="text-[10px] text-destructive/70 uppercase font-black">Allergies</p>
                                <p className="text-sm font-bold text-foreground">{selectedPatient.profile?.allergies || "No Known Allergies"}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-destructive/70 uppercase font-black">Chronic Diseases</p>
                                <p className="text-sm font-bold text-foreground">{selectedPatient.profile?.chronic_diseases || "None Reported"}</p>
                            </div>
                         </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <Activity className="h-4 w-4" /> Bio Metrics
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-3 rounded-xl border-2 border-border/50 bg-muted/30">
                            <p className="text-[9px] text-muted-foreground uppercase font-bold">Birth Date</p>
                            <p className="text-xs font-black">{selectedPatient.profile?.birth_date || "N/A"}</p>
                          </div>
                          <div className="p-3 rounded-xl border-2 border-border/50 bg-muted/30">
                            <p className="text-[9px] text-muted-foreground uppercase font-bold">Emergency Phone</p>
                            <p className="text-xs font-black">{selectedPatient.profile?.phone || "N/A"}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Medical History */}
                    <div className="md:col-span-2 space-y-6">
                       <Tabs defaultValue="reports" className="w-full">
                         <TabsList className="bg-muted/50 w-full justify-start rounded-xl p-1 mb-4 h-11 border">
                           <TabsTrigger value="reports" className="rounded-lg px-6 font-bold flex items-center gap-2">
                             <FileText className="h-4 w-4" /> Reports
                           </TabsTrigger>
                           <TabsTrigger value="meds" className="rounded-lg px-6 font-bold flex items-center gap-2">
                             <Pill className="h-4 w-4" /> Medications
                           </TabsTrigger>
                           <TabsTrigger value="labs" className="rounded-lg px-6 font-bold flex items-center gap-2">
                             <FlaskConical className="h-4 w-4" /> Lab Results
                           </TabsTrigger>
                         </TabsList>

                         <TabsContent value="reports" className="focus-visible:ring-0">
                           <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                             {selectedPatient.reports?.length > 0 ? (
                               selectedPatient.reports.map((report: any) => (
                                 <div key={report.id} className="p-5 rounded-2xl border-2 border-border/50 bg-card hover:border-primary/20 transition-all shadow-sm">
                                   <div className="flex justify-between items-start mb-3">
                                      <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold">
                                        {report.date}
                                      </Badge>
                                      <span className="text-[10px] text-muted-foreground font-black uppercase italic">Dr. {report.doctor_name}</span>
                                   </div>
                                   <h4 className="text-lg font-black text-foreground mb-2">{report.diagnosis}</h4>
                                   <p className="text-sm text-muted-foreground leading-relaxed italic border-l-4 border-primary/20 pl-4">{report.notes}</p>
                                   {report.required_tests && (
                                     <div className="mt-4 pt-4 border-t border-dashed border-border flex flex-wrap gap-2">
                                       <span className="text-[10px] font-black uppercase text-muted-foreground w-full mb-1">Requested Tests:</span>
                                       {report.required_tests.split(',').map((test: string) => (
                                         <Badge key={test} variant="outline" className="text-[9px] border-primary/30 text-primary">{test.trim()}</Badge>
                                       ))}
                                     </div>
                                   )}
                                 </div>
                               ))
                             ) : (
                               <div className="py-20 text-center border-4 border-dashed rounded-3xl opacity-50">
                                 <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                 <p className="text-lg font-black text-muted-foreground uppercase tracking-widest">No Medical Reports</p>
                               </div>
                             )}
                           </div>
                         </TabsContent>

                         <TabsContent value="meds" className="focus-visible:ring-0">
                           <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                             {selectedPatient.prescriptions?.length > 0 ? (
                               selectedPatient.prescriptions.map((p: any) => (
                                 <div key={p.id} className="p-5 rounded-2xl border-2 border-indigo-500/10 bg-indigo-500/5 hover:bg-indigo-500/10 transition-all">
                                   <div className="flex justify-between items-start mb-2">
                                     <h4 className="text-xl font-black text-indigo-700">{p.medication_name}</h4>
                                     <Badge className={p.status === 'dispensed' ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-amber-500 shadow-lg shadow-amber-500/20'}>
                                       {p.status}
                                     </Badge>
                                   </div>
                                   <div className="flex gap-4 text-xs font-bold text-indigo-800/70 mb-3">
                                     <span className="flex items-center gap-1"><Activity className="h-3 w-3" /> {p.dosage}</span>
                                     <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {p.frequency}</span>
                                     <span className="flex items-center gap-1"><ChevronRight className="h-3 w-3" /> {p.duration}</span>
                                   </div>
                                   <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-3 border-t border-indigo-500/10">
                                      <span className="font-black">DR. {p.doctor_name?.toUpperCase()}</span>
                                      <span className="font-mono">{p.date}</span>
                                   </div>
                                 </div>
                               ))
                             ) : (
                               <div className="py-20 text-center border-4 border-dashed rounded-3xl opacity-50">
                                 <Pill className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                 <p className="text-lg font-black text-muted-foreground uppercase tracking-widest">No Active Prescriptions</p>
                               </div>
                             )}
                           </div>
                         </TabsContent>

                         <TabsContent value="labs" className="focus-visible:ring-0">
                           <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                             {selectedPatient.lab_reports?.length > 0 ? (
                                selectedPatient.lab_reports.map((r: any, idx: number) => (
                                 <div key={idx} className="p-5 rounded-2xl border-2 border-emerald-500/10 bg-emerald-500/5 shadow-sm">
                                   <div className="flex justify-between items-start mb-3">
                                     <h4 className="text-lg font-black text-emerald-700">{r.test_name}</h4>
                                     <Badge className="bg-emerald-500">{r.status}</Badge>
                                   </div>
                                   {r.result && (
                                     <div className="p-4 rounded-xl bg-white/50 border border-emerald-200 mb-4 font-mono text-sm uppercase">
                                       {r.result}
                                     </div>
                                   )}
                                   <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                                       <span className="font-black uppercase">Completed: {r.completed_at || "In Progress"}</span>
                                       {r.images?.length > 0 && <span className="text-emerald-600 font-black uppercase">{r.images.length} Image(s) available</span>}
                                   </div>

                                   {/* Lab result images gallery */}
                                   {r.images && r.images.length > 0 && (
                                     <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                       {r.images.map((img: any) => (
                                         <div 
                                           key={img.id} 
                                           className="group relative aspect-square rounded-xl border-2 border-emerald-500/10 overflow-hidden bg-white shadow-sm hover:shadow-emerald-500/20 transition-all cursor-pointer"
                                           onClick={() => window.open(`${API_BASE_URL.replace('/api', '')}/attachments/${selectedPatient.id}/lab_result/${img.filename}`, '_blank')}
                                         >
                                           <img 
                                             src={`${API_BASE_URL.replace('/api', '')}/attachments/${selectedPatient.id}/lab_result/${img.filename}`} 
                                             alt={img.title || 'Lab Result'} 
                                             className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                           />
                                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                             <Search className="h-6 w-6 text-white" />
                                           </div>
                                         </div>
                                       ))}
                                     </div>
                                   )}
                                 </div>
                               ))
                             ) : (
                               <div className="py-20 text-center border-4 border-dashed rounded-3xl opacity-50">
                                 <FlaskConical className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                 <p className="text-lg font-black text-muted-foreground uppercase tracking-widest">No Lab Data Found</p>
                               </div>
                             )}
                           </div>
                         </TabsContent>
                       </Tabs>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* QR Tab */}
          <TabsContent value="qr" className="mt-4 focus-visible:outline-none focus-visible:ring-0">
             <Card className="max-w-md mx-auto rounded-3xl shadow-2xl overflow-hidden border-2 border-primary/10">
               <CardHeader className="bg-primary text-primary-foreground p-8 text-center pb-12">
                 <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 mx-auto mb-4 backdrop-blur-md">
                    <QrCode className="h-8 w-8" />
                 </div>
                 <CardTitle className="text-2xl font-black italic tracking-tighter">OFFICIAL PARAMEDIC ID</CardTitle>
                 <CardDescription className="text-primary-foreground/70 font-bold uppercase tracking-widest text-[10px]">Security Clearance Token</CardDescription>
               </CardHeader>
               <CardContent className="p-8 -mt-8">
                 <div className="bg-background rounded-3xl p-6 shadow-2xl border-t-4 border-t-white relative z-10 text-center space-y-6">
                    <div className="aspect-square w-full max-w-[240px] mx-auto bg-muted rounded-2xl overflow-hidden shadow-inner flex items-center justify-center border-2 border-dashed border-primary/20">
                      {qrLoading ? (
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      ) : qrImage ? (
                        <img src={qrImage} alt="Paramedic QR Code" className="w-full h-full object-contain p-4" />
                      ) : (
                        <p className="text-xs text-muted-foreground font-bold p-8">No QR Code available.</p>
                      )}
                    </div>
                    <div className="space-y-4 pt-4">
                       <div className="inline-block p-1 bg-primary/5 rounded-full px-4 border border-primary/10">
                          <p className="text-xs font-black text-primary uppercase tracking-widest italic">{profile.name}</p>
                       </div>
                       <Button 
                         variant="outline" 
                         className="w-full rounded-2xl h-14 border-2 font-black transition-all hover:bg-primary/5 active:scale-95" 
                         onClick={handleRegenerateQr}
                         disabled={qrLoading}
                       >
                         {qrLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Activity className="mr-2 h-4 w-4" />}
                         Regenerate Access Token
                       </Button>
                    </div>
                 </div>
                 <div className="mt-8 text-center space-y-1">
                   <p className="text-[10px] font-black text-muted-foreground uppercase opacity-50 tracking-widest">HealthHub Emergency Protocol</p>
                   <p className="text-[8px] text-muted-foreground font-medium italic">Use this QR code to login instantly via the mobile scanner.</p>
                 </div>
               </CardContent>
             </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}
