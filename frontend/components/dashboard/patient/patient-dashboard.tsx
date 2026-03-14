"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard, FileText, QrCode as QrIcon, Calendar, AlertTriangle,
  User as UserIcon, Plus, Trash2, Download, Upload, Phone as PhoneIcon,
  Droplets, Scale, TrendingUp, Sparkles, Loader2
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getProfileApi, updateBasicProfileApi, updatePatientProfileApi,
  getFilesApi, uploadFileApi, deleteFileApi, getQrApi, regenerateQrApi,
  API_BASE_URL, getAppointmentsApi, analyzeMedicalImageApi,
} from "@/lib/api"
import ReactMarkdown from "react-markdown"
import { useToast } from "@/hooks/use-toast"

export default function PatientDashboardContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [files, setFiles] = useState<any[]>([])
  const [appointments, setAppointments] = useState<any[]>([])
  const [qrImage, setQrImage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  // AI Analysis states
  const [analyzing, setAnalyzing] = useState<number | null>(null)
  const [analysisResult, setAnalysisResult] = useState<{ id: number; text: string } | null>(null)

  // Profile form states
  const [name, setName] = useState("")
  const [nationalId, setNationalId] = useState("")
  const [phone, setPhone] = useState("")
  const [phoneAlt, setPhoneAlt] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [gender, setGender] = useState("")
  const [bloodType, setBloodType] = useState("")
  const [height, setHeight] = useState("")
  const [weight, setWeight] = useState("")
  const [chronicDiseases, setChronicDiseases] = useState("")
  const [allergies, setAllergies] = useState("")
  const [currentMedications, setCurrentMedications] = useState("")
  const [nationality, setNationality] = useState("")
  const [maritalStatus, setMaritalStatus] = useState("")
  const [occupation, setOccupation] = useState("")
  const [governorate, setGovernorate] = useState("")
  const [city, setCity] = useState("")
  const [address, setAddress] = useState("")
  const [previousSurgeries, setPreviousSurgeries] = useState("")
  const [familyHistory, setFamilyHistory] = useState("")
  const [emergencyContactName, setEmergencyContactName] = useState("")
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("")
  const [emergencyContactRelation, setEmergencyContactRelation] = useState("")

  // File upload states
  const [uploadLoading, setUploadLoading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [fileType, setFileType] = useState("")
  const [fileTitle, setFileTitle] = useState("")

  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null
    if (!t) router.push("/")
    else setToken(t)
  }, [router])

  const fetchData = useCallback(async () => {
    if (!token) { router.push("/"); return }
    try {
      const profileData = await getProfileApi(token)
      if (profileData.message === "Unauthenticated." || profileData.error === "Unauthorized") {
        localStorage.removeItem("auth_token"); router.push("/"); return
      }
      if (profileData.user) {
        setProfile(profileData.user)
        setName(profileData.user.name || "")
        setNationalId(profileData.user.national_id || "")
        if (profileData.user.profile) {
          const p = profileData.user.profile
          setPhone(p.phone || ""); setPhoneAlt(p.phone_alt || "")
          setBirthDate(p.birth_date ? p.birth_date.split('T')[0] : "")
          setGender(p.gender || ""); setBloodType(p.blood_type || "")
          setHeight(p.height?.toString() || ""); setWeight(p.weight?.toString() || "")
          setChronicDiseases(p.chronic_diseases || ""); setAllergies(p.allergies || "")
          setCurrentMedications(p.current_medications || ""); setNationality(p.nationality || "")
          setMaritalStatus(p.marital_status || ""); setOccupation(p.occupation || "")
          setGovernorate(p.governorate || ""); setCity(p.city || ""); setAddress(p.address || "")
          setPreviousSurgeries(p.previous_surgeries || ""); setFamilyHistory(p.family_history || "")
          setEmergencyContactName(p.emergency_contact_name || "")
          setEmergencyContactPhone(p.emergency_contact_phone || "")
          setEmergencyContactRelation(p.emergency_contact_relation || "")
        }
      }
      const filesData = await getFilesApi(token)
      if (filesData.files) setFiles(filesData.files)
      const qrData = await getQrApi(token)
      if (qrData.qr_image) setQrImage(qrData.qr_image)
      const appointmentsData = await getAppointmentsApi(token)
      if (appointmentsData.appointments) setAppointments(appointmentsData.appointments)
    } finally {
      setFetching(false)
    }
  }, [token, router])

  useEffect(() => {
    if (token) { setFetching(true); fetchData() }
  }, [fetchData, token])

  const handleUpdateProfile = async () => {
    if (!token) return
    setLoading(true)
    try {
      await updateBasicProfileApi(token, { name, national_id: nationalId })
      await updatePatientProfileApi(token, {
        phone, phone_alt: phoneAlt, birth_date: birthDate, gender, blood_type: bloodType,
        height: height ? parseFloat(height) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        chronic_diseases: chronicDiseases, allergies, current_medications: currentMedications,
        nationality, marital_status: maritalStatus, occupation, governorate, city, address,
        previous_surgeries: previousSurgeries, family_history: familyHistory,
        emergency_contact_name: emergencyContactName,
        emergency_contact_phone: emergencyContactPhone,
        emergency_contact_relation: emergencyContactRelation,
      })
      toast({ title: "Success", description: "Your profile has been updated successfully." })
      fetchData()
    } catch {
      toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleUploadFile = async () => {
    if (!token || selectedFiles.length === 0 || !fileType || !fileTitle) {
      toast({ title: "Validation Error", description: "Please fill all required fields and select at least one file.", variant: "destructive" })
      return
    }
    setUploadLoading(true)
    try {
      const formData = new FormData()
      selectedFiles.forEach((file) => formData.append("files[]", file))
      formData.append("type", fileType); formData.append("title", fileTitle)
      const res = await uploadFileApi(token, formData)
      if (res.message) {
        toast({ title: "Success", description: "Medical file(s) uploaded successfully." })
        setSelectedFiles([]); setFileTitle(""); setFileType(""); fetchData()
      }
    } catch {
      toast({ title: "Error", description: "Failed to upload file.", variant: "destructive" })
    } finally {
      setUploadLoading(false)
    }
  }

  const handleDeleteFile = async (id: number) => {
    if (!token || !confirm("Are you sure you want to delete this file?")) return
    try {
      await deleteFileApi(token, id)
      toast({ title: "Deleted", description: "The file has been removed from your records." })
      fetchData()
    } catch {
      toast({ title: "Error", description: "Failed to delete file.", variant: "destructive" })
    }
  }

  const handleDownloadFile = async (file: any) => {
    try {
      const url = getFileUrl(file)
      const res = await fetch(url)
      const blob = await res.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = blobUrl; link.download = file.filename
      document.body.appendChild(link); link.click()
      document.body.removeChild(link); window.URL.revokeObjectURL(blobUrl)
    } catch {
      window.open(getFileUrl(file), '_blank')
    }
  }

  const handleRegenerateQr = async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await regenerateQrApi(token)
      if (res.qr_image) {
        setQrImage(res.qr_image)
        toast({ title: "Success", description: "A new QR code has been generated and sent to your email." })
      }
    } catch {
      toast({ title: "Error", description: "Failed to regenerate QR code.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyzeImage = async (file: any) => {
    if (!token) return
    setAnalyzing(file.id)
    setAnalysisResult(null)
    try {
      const res = await analyzeMedicalImageApi(token, {
        folder: "PatientProfile",
        model_id: profile?.profile?.id,
        filename: file.filename,
      })
      if (res.success) {
        setAnalysisResult({ id: file.id, text: res.explanation })
      } else {
        toast({ title: "Analysis Failed", description: res.message, variant: "destructive" })
      }
    } catch {
      toast({ title: "Error", description: "Failed to analyze image.", variant: "destructive" })
    } finally {
      setAnalyzing(null)
    }
  }

  const getFileUrl = (file: any) => {
    const baseUrl = API_BASE_URL.replace('/api', '')
    return `${baseUrl}/attachments/PatientProfile/${profile?.profile?.id}/${file.filename}`
  }

  const upcomingAppointments = appointments.filter((a) => {
    if (!a.next_visit_date) return false
    const today = new Date(); const date = new Date(a.next_visit_date)
    today.setHours(0, 0, 0, 0); date.setHours(0, 0, 0, 0)
    return date >= today
  })

  const pastAppointments = appointments.filter((a) => {
    if (!a.next_visit_date) return false
    const today = new Date(); const date = new Date(a.next_visit_date)
    today.setHours(0, 0, 0, 0); date.setHours(0, 0, 0, 0)
    return date < today
  })

  const navItems = [
    { title: "Overview", icon: LayoutDashboard, onClick: () => setActiveTab("overview"), isActive: activeTab === "overview" },
    { title: "Medical Records", icon: FileText, onClick: () => setActiveTab("records"), isActive: activeTab === "records" },
    {
      title: "Appointments", icon: Calendar,
      badge: upcomingAppointments.length ? String(upcomingAppointments.length) : undefined,
      onClick: () => setActiveTab("appointments"), isActive: activeTab === "appointments",
    },
    { title: "QR Code", icon: QrIcon, onClick: () => setActiveTab("qr"), isActive: activeTab === "qr" },
    { title: "Profile", icon: UserIcon, onClick: () => setActiveTab("settings"), isActive: activeTab === "settings" },
  ]

  const overviewStats = [
    { label: "Medical Files", value: String(files.length), icon: FileText, change: "Uploaded records", color: "text-primary" },
    { label: "Blood Type", value: profile?.profile?.blood_type || "N/A", icon: Droplets, change: "On file", color: "text-destructive" },
    { label: "Allergies", value: profile?.profile?.allergies ? "Yes" : "None", icon: AlertTriangle, change: profile?.profile?.allergies || "No known allergies", color: "text-chart-4" },
    { label: "QR Status", value: qrImage ? "Active" : "None", icon: QrIcon, change: "Emergency tag", color: "text-accent" },
  ]

  const vitals = [
    { label: "Weight", value: profile?.profile?.weight || "--", unit: "kg", icon: Scale, status: "On file" },
    { label: "Height", value: profile?.profile?.height || "--", unit: "cm", icon: TrendingUp, status: "On file" },
    { label: "Blood Type", value: profile?.profile?.blood_type || "--", unit: "", icon: Droplets, status: "Verified" },
    { label: "Gender", value: profile?.profile?.gender || "--", unit: "", icon: UserIcon, status: "On file" },
    { label: "Birth Year", value: profile?.profile?.birth_date ? new Date(profile.profile.birth_date).getFullYear().toString() : "--", unit: "", icon: Calendar, status: "On file" },
    { label: "Phone", value: profile?.profile?.phone ? "Saved" : "--", unit: "", icon: PhoneIcon, status: profile?.profile?.phone ? "Active" : "Missing" },
  ]

  return (
    <DashboardShell
      navItems={navItems}
      userName={profile?.name || "Patient"}
      userRole="Patient"
      userInitials={profile?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase() || "P"}
    >
      {fetching && !profile ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground animate-pulse font-medium">Synchronizing your medical records...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Welcome back, {profile?.name?.split(" ")[0] || "there"}
            </h1>
            <p className="text-muted-foreground mt-1">Here&apos;s an overview of your health records.</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:w-fit lg:grid-cols-5 h-auto lg:h-10">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="records">Medical Records</TabsTrigger>
              <TabsTrigger value="settings">Profile Settings</TabsTrigger>
              <TabsTrigger value="appointments" className="hidden lg:inline-flex">Appointments</TabsTrigger>
              <TabsTrigger value="qr" className="hidden lg:inline-flex">QR Code</TabsTrigger>
            </TabsList>

            {/* ── OVERVIEW ── */}
            <TabsContent value="overview" className="mt-4">
              <div className="flex flex-col gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {overviewStats.map((s) => (
                    <div key={s.label} className="rounded-xl border border-border bg-card p-5">
                      <div className="flex items-center justify-between mb-3">
                        <s.icon className={`w-5 h-5 ${s.color}`} />
                        <span className="text-xs text-muted-foreground">{s.change}</span>
                      </div>
                      <div className="text-2xl font-bold text-foreground">{s.value}</div>
                      <div className="text-sm text-muted-foreground">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button onClick={() => setActiveTab("records")}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
                    <FileText className="w-4 h-4" /> View Full Records
                  </button>
                  <button onClick={() => setActiveTab("qr")}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                    <QrIcon className="w-4 h-4" /> My QR Code
                  </button>
                  <button onClick={() => setActiveTab("settings")}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors">
                    <UserIcon className="w-4 h-4" /> Edit Profile
                  </button>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-4">Profile Summary</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    {vitals.map((v) => (
                      <div key={v.label} className="rounded-xl border border-border bg-card p-4 text-center">
                        <v.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                        <div className="text-xl font-bold text-foreground">
                          {v.value}<span className="text-xs text-muted-foreground ml-1">{v.unit}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{v.label}</div>
                        <div className="inline-block mt-2 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">{v.status}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="rounded-xl border border-border bg-card">
                    <div className="p-5 border-b border-border">
                      <h2 className="text-lg font-semibold text-foreground">Personal Information</h2>
                    </div>
                    <div className="divide-y divide-border">
                      {[
                        { label: "Full Name", value: profile?.name },
                        { label: "Email", value: profile?.email },
                        { label: "National ID", value: profile?.national_id },
                        { label: "Emergency Contact", value: profile?.profile?.emergency_contact_name ? `${profile.profile.emergency_contact_name} (${profile.profile.emergency_contact_phone})` : null },
                        { label: "Location", value: profile?.profile?.city ? `${profile.profile.city}, ${profile.profile.governorate}` : null },
                      ].map((row) => (
                        <div key={row.label} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                          <span className="text-sm text-muted-foreground">{row.label}</span>
                          <span className="text-sm font-medium text-foreground text-right max-w-[200px] truncate">{row.value || "---"}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-card">
                    <div className="p-5 border-b border-border">
                      <h2 className="text-lg font-semibold text-foreground">Medical Baseline</h2>
                    </div>
                    <div className="divide-y divide-border">
                      {[
                        { label: "Blood Type", value: profile?.profile?.blood_type },
                        { label: "Chronic Diseases", value: profile?.profile?.chronic_diseases },
                        { label: "Allergies", value: profile?.profile?.allergies },
                        { label: "Current Medications", value: profile?.profile?.current_medications },
                        { label: "Previous Surgeries", value: profile?.profile?.previous_surgeries },
                      ].map((row) => (
                        <div key={row.label} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                          <span className="text-sm text-muted-foreground">{row.label}</span>
                          <span className="text-sm font-medium text-foreground text-right max-w-[180px] truncate">{row.value || "None"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ── RECORDS ── */}
            <TabsContent value="records" className="mt-4">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading flex items-center gap-2 text-primary">
                      <Upload className="h-5 w-5" /> Upload Medical Record
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fileTitle">File Title</Label>
                        <Input id="fileTitle" placeholder="e.g. Chest X-Ray Jan 2026" value={fileTitle} onChange={(e) => setFileTitle(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fileType">Record Type</Label>
                        <Select value={fileType} onValueChange={setFileType}>
                          <SelectTrigger id="fileType"><SelectValue placeholder="Select type" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="xray">X-Ray</SelectItem>
                            <SelectItem value="lab_result">Lab Result</SelectItem>
                            <SelectItem value="prescription">Prescription</SelectItem>
                            <SelectItem value="medical_report">Medical Report</SelectItem>
                            <SelectItem value="vaccine">Vaccine</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fileInput">Choose Files</Label>
                        <Input id="fileInput" type="file" multiple accept=".jpg,.jpeg,.png,.pdf" className="cursor-pointer"
                          onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))} />
                      </div>
                    </div>
                    {selectedFiles.length > 0 && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-xl border border-dashed border-primary/20">
                        <p className="text-xs font-semibold mb-2 flex items-center gap-2">
                          <FileText className="h-3 w-3 text-primary" /> Selected Files ({selectedFiles.length}):
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                          {selectedFiles.map((f, i) => (
                            <div key={i} className="flex items-center justify-between text-[10px] bg-background p-2 rounded-lg border border-border">
                              <span className="truncate max-w-[100px]">{f.name}</span>
                              <span className="text-muted-foreground">{(f.size / 1024).toFixed(0)} KB</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="mt-4 flex justify-end">
                      <Button onClick={handleUploadFile} disabled={uploadLoading} className="bg-primary hover:bg-primary/90">
                        {uploadLoading ? "Uploading..." : "Upload to Records"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading">Digital Medical File</CardTitle>
                    <CardDescription>All your historical medical images and records.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {files.length === 0 ? (
                        <div className="col-span-full py-16 text-center text-muted-foreground bg-muted/30 rounded-2xl border-2 border-dashed">
                          <FileText className="h-12 w-12 mx-auto mb-4 opacity-10" />
                          <p className="text-lg font-medium">No records uploaded yet</p>
                          <p className="text-sm">Upload your first record to start your digital history</p>
                        </div>
                      ) : files.map((file) => (
                        <div key={file.id} className="group flex flex-col rounded-2xl border bg-card transition-all hover:shadow-xl hover:-translate-y-1">
                          <div className="aspect-[4/3] w-full overflow-hidden rounded-t-2xl bg-muted relative">
                            {file.filename.match(/\.(jpg|jpeg|png)$/i) ? (
                              <img src={getFileUrl(file)} alt={file.title} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-primary/5">
                                <FileText className="h-16 w-16 text-primary/20" />
                                <span className="absolute bottom-2 right-2 bg-background/80 backdrop-blur px-2 py-1 rounded text-[10px] font-bold">PDF</span>
                              </div>
                            )}
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-lg" onClick={() => handleDeleteFile(file.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>

                          <div className="p-4 flex flex-col flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider">{file.type?.replace('_', ' ')}</Badge>
                              <span className="text-[10px] text-muted-foreground">{new Date(file.created_at).toLocaleDateString()}</span>
                            </div>
                            <h4 className="font-bold text-base mb-3 flex-1">{file.title}</h4>

                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="flex-1 text-xs h-9 rounded-xl" onClick={() => window.open(getFileUrl(file), '_blank')}>
                                Preview
                              </Button>
                            </div>

                            {/* ✅ زر الـ AI بس - من غير النتيجة */}
                            {file.filename.match(/\.(jpg|jpeg|png|webp)$/i) && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full text-xs h-9 rounded-xl mt-2 border-primary/30 text-primary hover:bg-primary/5"
                                onClick={() => handleAnalyzeImage(file)}
                                disabled={analyzing === file.id}
                              >
                                {analyzing === file.id ? (
                                  <><Loader2 className="mr-2 h-3 w-3 animate-spin" /> Analyzing...</>
                                ) : (
                                  <><Sparkles className="mr-2 h-3 w-3" /> AI Analysis</>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* ✅ النتيجة هنا تحت الـ grid كلها */}
                    {analysisResult && (
                      <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-semibold text-primary flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            AI Analysis — {files.find(f => f.id === analysisResult.id)?.title}
                          </p>
                          <button
                            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                            onClick={() => setAnalysisResult(null)}
                          >
                            Dismiss ✕
                          </button>
                        </div>
                        <div className="prose prose-sm max-w-none text-muted-foreground text-xs leading-relaxed
        [&>p]:mb-2 [&>ul]:list-disc [&>ul]:pl-4 [&>ul]:mb-2
        [&>ol]:list-decimal [&>ol]:pl-4 [&>ol]:mb-2
        [&>h1]:text-sm [&>h1]:font-bold [&>h1]:text-foreground
        [&>h2]:text-sm [&>h2]:font-bold [&>h2]:text-foreground
        [&>h3]:text-xs [&>h3]:font-semibold [&>h3]:text-foreground
        [&>strong]:font-semibold [&>strong]:text-foreground">
                          <ReactMarkdown>{analysisResult.text}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ── SETTINGS ── */}
            <TabsContent value="settings" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Profile Settings</CardTitle>
                  <CardDescription>Keep your personal and medical information current.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
                      <UserIcon className="h-5 w-5 text-primary" /> Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2"><Label>Full Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" /></div>
                      <div className="space-y-2"><Label>Email</Label><Input value={profile?.email || ""} disabled className="bg-muted rounded-xl border-dashed" /></div>
                      <div className="space-y-2"><Label>National ID</Label><Input type="number" value={nationalId} onChange={(e) => setNationalId(e.target.value)} className="rounded-xl" /></div>
                      <div className="space-y-2"><Label>Primary Phone</Label><Input type="number" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-xl" /></div>
                      <div className="space-y-2"><Label>Alternative Phone</Label><Input type="number" value={phoneAlt} onChange={(e) => setPhoneAlt(e.target.value)} className="rounded-xl" /></div>
                      <div className="space-y-2"><Label>Birth Date</Label><Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="rounded-xl" /></div>
                      <div className="space-y-2">
                        <Label>Gender</Label>
                        <Select value={gender} onValueChange={setGender}>
                          <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select gender" /></SelectTrigger>
                          <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2"><Label>Nationality</Label><Input value={nationality} onChange={(e) => setNationality(e.target.value)} className="rounded-xl" /></div>
                      <div className="space-y-2">
                        <Label>Marital Status</Label>
                        <Select value={maritalStatus} onValueChange={setMaritalStatus}>
                          <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select status" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Single</SelectItem><SelectItem value="married">Married</SelectItem>
                            <SelectItem value="divorced">Divorced</SelectItem><SelectItem value="widowed">Widowed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2"><Label>Occupation</Label><Input value={occupation} onChange={(e) => setOccupation(e.target.value)} className="rounded-xl" /></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
                      <LayoutDashboard className="h-5 w-5 text-primary" /> Location & Address
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2"><Label>Governorate</Label><Input value={governorate} onChange={(e) => setGovernorate(e.target.value)} className="rounded-xl" /></div>
                      <div className="space-y-2"><Label>City</Label><Input value={city} onChange={(e) => setCity(e.target.value)} className="rounded-xl" /></div>
                    </div>
                    <div className="space-y-2"><Label>Full Address</Label><Textarea value={address} onChange={(e) => setAddress(e.target.value)} className="min-h-[60px] rounded-xl" /></div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-primary" /> Medical Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label>Blood Type</Label>
                        <Select value={bloodType} onValueChange={setBloodType}>
                          <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select type" /></SelectTrigger>
                          <SelectContent>{["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2"><Label>Height (cm)</Label><Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="rounded-xl" /></div>
                      <div className="space-y-2"><Label>Weight (kg)</Label><Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="rounded-xl" /></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2"><Label>Chronic Diseases</Label><Textarea value={chronicDiseases} onChange={(e) => setChronicDiseases(e.target.value)} className="min-h-[100px] rounded-xl" /></div>
                      <div className="space-y-2"><Label>Known Allergies</Label><Textarea value={allergies} onChange={(e) => setAllergies(e.target.value)} className="min-h-[100px] rounded-xl" /></div>
                      <div className="space-y-2"><Label>Current Medications</Label><Textarea value={currentMedications} onChange={(e) => setCurrentMedications(e.target.value)} className="min-h-[100px] rounded-xl" /></div>
                      <div className="space-y-2"><Label>Previous Surgeries</Label><Textarea value={previousSurgeries} onChange={(e) => setPreviousSurgeries(e.target.value)} className="min-h-[100px] rounded-xl" /></div>
                    </div>
                    <div className="space-y-2"><Label>Family Medical History</Label><Textarea value={familyHistory} onChange={(e) => setFamilyHistory(e.target.value)} className="min-h-[80px] rounded-xl" /></div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
                      <PhoneIcon className="h-5 w-5 text-primary" /> Emergency Contact
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2"><Label>Contact Name</Label><Input value={emergencyContactName} onChange={(e) => setEmergencyContactName(e.target.value)} className="rounded-xl" /></div>
                      <div className="space-y-2"><Label>Contact Phone</Label><Input type="number" value={emergencyContactPhone} onChange={(e) => setEmergencyContactPhone(e.target.value)} className="rounded-xl" /></div>
                      <div className="space-y-2"><Label>Relation</Label><Input value={emergencyContactRelation} onChange={(e) => setEmergencyContactRelation(e.target.value)} className="rounded-xl" /></div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-6">
                    <Button onClick={handleUpdateProfile} disabled={loading} className="w-full md:w-auto px-12 py-6 rounded-xl font-bold text-base shadow-lg bg-primary hover:shadow-primary/20">
                      {loading ? "Updating Records..." : "Save My Information"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── APPOINTMENTS ── */}
            <TabsContent value="appointments" className="mt-4">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" /> Upcoming Visits
                    </CardTitle>
                    <CardDescription>Follow-up dates set by your doctors.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {upcomingAppointments.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                          <Calendar className="h-8 w-8 text-muted-foreground opacity-60" />
                        </div>
                        <h3 className="text-lg font-semibold mb-1">No upcoming visits</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                          Once a doctor schedules a next visit date for you, it will appear here.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {upcomingAppointments.map((a) => (
                          <div key={a.id} className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 hover:bg-muted/60 transition-colors">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground">{a.doctor_name || "Doctor"}</span>
                                {a.specialty && <Badge variant="outline" className="text-xs">{a.specialty}</Badge>}
                              </div>
                              {a.facility && <p className="text-xs text-muted-foreground">{a.facility}</p>}
                              {a.diagnosis && <p className="text-xs text-muted-foreground line-clamp-2">Diagnosis: {a.diagnosis}</p>}
                              {a.notes && <p className="text-xs text-muted-foreground line-clamp-2">Notes: {a.notes}</p>}
                              {a.required_tests && <p className="text-xs text-muted-foreground line-clamp-2">Required tests: {a.required_tests}</p>}
                            </div>
                            <div className="flex flex-col items-start md:items-end gap-1">
                              <Badge className="rounded-full px-3 py-1 text-xs">
                                Next visit: {new Date(a.next_visit_date).toLocaleDateString()}
                              </Badge>
                              {a.created_at && <span className="text-[11px] text-muted-foreground">Set on {new Date(a.created_at).toLocaleString()}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {pastAppointments.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-semibold">Visit History</CardTitle>
                      <CardDescription className="text-xs">Previous follow-up dates that have already passed.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {pastAppointments.map((a) => (
                          <div key={a.id} className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b last:border-0 pb-3 last:pb-0">
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium">{a.doctor_name || "Doctor"}</p>
                              {a.diagnosis && <p className="text-xs text-muted-foreground line-clamp-1">Diagnosis: {a.diagnosis}</p>}
                              {a.notes && <p className="text-xs text-muted-foreground line-clamp-1">Notes: {a.notes}</p>}
                              {a.required_tests && <p className="text-xs text-muted-foreground line-clamp-1">Required tests: {a.required_tests}</p>}
                            </div>
                            <span className="text-xs text-muted-foreground">{new Date(a.next_visit_date).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* ── QR ── */}
            <TabsContent value="qr" className="mt-4 text-center">
              <Card className="max-w-2xl mx-auto">
                <CardContent className="py-12">
                  <div className="inline-block p-10 bg-white rounded-3xl border-2 border-dashed border-primary/20 mb-8 overflow-hidden shadow-inner">
                    {qrImage ? (
                      <img src={qrImage} alt="User QR Code" className="h-48 w-48 object-contain" />
                    ) : (
                      <div className="h-48 w-48 flex items-center justify-center">
                        <QrIcon className="h-20 w-20 text-foreground opacity-10 animate-pulse" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Smart Emergency Tag</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-8">
                    This QR code encrypts your vital medical info for paramedics in case of an emergency.
                    It shows your blood type, chronic diseases and emergency contacts instantly.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button className="rounded-xl px-8" onClick={handleRegenerateQr} disabled={loading}>
                      <Plus className="mr-2 h-4 w-4" />
                      {loading ? "Generating..." : "Regenerate QR"}
                    </Button>
                    <Button variant="outline" className="rounded-xl px-8" disabled={!qrImage}
                      onClick={() => {
                        const link = document.createElement('a')
                        link.href = qrImage || ""
                        link.download = `QR_Code_${profile?.name?.replace(/\s/g, '_')}.png`
                        document.body.appendChild(link); link.click(); document.body.removeChild(link)
                      }}>
                      <Download className="mr-2 h-4 w-4" /> Download QR
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </DashboardShell>
  )
}