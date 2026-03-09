"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  QrCode as QrIcon,
  Calendar,
  Pill,
  AlertTriangle,
  User as UserIcon,
  Clock,
  Plus,
  Trash2,
  Download,
  Upload,
  ExternalLink,
  Phone as PhoneIcon,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  getProfileApi,
  updateBasicProfileApi,
  updatePatientProfileApi,
  getFilesApi,
  uploadFileApi,
  deleteFileApi,
  getQrApi,
  regenerateQrApi,
  API_BASE_URL,
} from "@/lib/api"
import { useToast } from "@/hooks/use-toast"



export default function PatientDashboardContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [files, setFiles] = useState<any[]>([])
  const [qrImage, setQrImage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  const navItems = [
    {
      title: "Overview",
      icon: LayoutDashboard,
      onClick: () => setActiveTab("overview"),
      isActive: activeTab === "overview"
    },
    {
      title: "Medical Records",
      icon: FileText,
      onClick: () => setActiveTab("records"),
      isActive: activeTab === "records"
    },
    {
      title: "Appointments",
      icon: Calendar,
      badge: "2",
      onClick: () => setActiveTab("appointments"),
      isActive: activeTab === "appointments"
    },
    // {
    //   title: "Medications",
    //   icon: Pill,
    //   badge: "3",
    //   onClick: () => setActiveTab("overview"),
    //   isActive: false
    // },
    {
      title: "QR Code",
      icon: QrIcon,
      onClick: () => setActiveTab("qr"),
      isActive: activeTab === "qr"
    },
    {
      title: "Profile",
      icon: UserIcon,
      onClick: () => setActiveTab("settings"),
      isActive: activeTab === "settings"
    },
  ]

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
    if (!t) {
      router.push("/")
    } else {
      setToken(t)
    }
  }, [router])

  const fetchData = useCallback(async () => {
    if (!token) {
      router.push("/")
      return
    }
    try {
      const profileData = await getProfileApi(token)

      // Handle unauthorized
      if (profileData.message === "Unauthenticated." || profileData.error === "Unauthorized") {
        localStorage.removeItem("auth_token")
        router.push("/")
        return
      }

      if (profileData.user) {
        setProfile(profileData.user)
        setName(profileData.user.name || "")
        setNationalId(profileData.user.national_id || "")
        if (profileData.user.profile) {
          const p = profileData.user.profile
          setPhone(p.phone || "")
          setPhoneAlt(p.phone_alt || "")
          setBirthDate(p.birth_date ? p.birth_date.split('T')[0] : "")
          setGender(p.gender || "")
          setBloodType(p.blood_type || "")
          setHeight(p.height?.toString() || "")
          setWeight(p.weight?.toString() || "")
          setChronicDiseases(p.chronic_diseases || "")
          setAllergies(p.allergies || "")
          setCurrentMedications(p.current_medications || "")
          setNationality(p.nationality || "")
          setMaritalStatus(p.marital_status || "")
          setOccupation(p.occupation || "")
          setGovernorate(p.governorate || "")
          setCity(p.city || "")
          setAddress(p.address || "")
          setPreviousSurgeries(p.previous_surgeries || "")
          setFamilyHistory(p.family_history || "")
          setEmergencyContactName(p.emergency_contact_name || "")
          setEmergencyContactPhone(p.emergency_contact_phone || "")
          setEmergencyContactRelation(p.emergency_contact_relation || "")
        }
      }

      const filesData = await getFilesApi(token)
      if (filesData.files) {
        setFiles(filesData.files)
      }

      const qrData = await getQrApi(token)
      if (qrData.qr_image) {
        setQrImage(qrData.qr_image)
      }
    } finally {
      setFetching(false)
    }
  }, [token, router])

  useEffect(() => {
    if (token) {
      setFetching(true)
      fetchData()
    }
  }, [fetchData, token])

  const handleUpdateProfile = async () => {
    if (!token) return
    setLoading(true)
    try {
      await updateBasicProfileApi(token, { name, national_id: nationalId })
      await updatePatientProfileApi(token, {
        phone,
        phone_alt: phoneAlt,
        birth_date: birthDate,
        gender,
        blood_type: bloodType,
        height: height ? parseFloat(height) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        chronic_diseases: chronicDiseases,
        allergies,
        current_medications: currentMedications,
        nationality,
        marital_status: maritalStatus,
        occupation,
        governorate,
        city,
        address,
        previous_surgeries: previousSurgeries,
        family_history: familyHistory,
        emergency_contact_name: emergencyContactName,
        emergency_contact_phone: emergencyContactPhone,
        emergency_contact_relation: emergencyContactRelation,
      })
      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
      })
      fetchData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUploadFile = async () => {
    if (!token || selectedFiles.length === 0 || !fileType || !fileTitle) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields and select at least one file.",
        variant: "destructive",
      })
      return
    }

    setUploadLoading(true)
    try {
      const formData = new FormData()
      selectedFiles.forEach((file) => {
        formData.append("files[]", file)
      })
      formData.append("type", fileType)
      formData.append("title", fileTitle)

      const res = await uploadFileApi(token, formData)
      if (res.message) {
        toast({
          title: "Success",
          description: "Medical file(s) uploaded successfully.",
        })
        setSelectedFiles([])
        setFileTitle("")
        setFileType("")
        fetchData()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUploadLoading(false)
    }
  }

  const handleDeleteFile = async (id: number) => {
    if (!token) return
    if (!confirm("Are you sure you want to delete this file?")) return

    try {
      await deleteFileApi(token, id)
      toast({
        title: "Deleted",
        description: "The file has been removed from your records.",
      })
      fetchData()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete file.",
        variant: "destructive",
      })
    }
  }

  const handleDownloadFile = async (file: any) => {
    try {
      const url = getFileUrl(file)
      const res = await fetch(url)
      const blob = await res.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = blobUrl
      link.download = file.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error("Download error:", error)
      // Fallback to direct link if fetch fails
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
        toast({
          title: "Success",
          description: "A new QR code has been generated and sent to your email.",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to regenerate QR code.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Get image URL Helper
  const getFileUrl = (file: any) => {
    // The backend stores in public/attachments/PatientProfile/{profile_id}/{filename}
    // We can access it via http://localhost:8000/attachments/PatientProfile/{profile_id}/{filename}
    const baseUrl = API_BASE_URL.replace('/api', '')
    return `${baseUrl}/attachments/PatientProfile/${profile?.profile?.id}/${file.filename}`
  }

  return (
    <DashboardShell
      navItems={navItems}
      userName={profile?.name || "Patient"}
      userRole="Patient"
      userInitials={profile?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase() || "P"}
    >
      {fetching && !profile ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          {/* <Loader2 className="h-10 w-10 animate-spin text-primary" /> */}
          <p className="text-muted-foreground animate-pulse font-medium">Synchronizing your medical records...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">
              Welcome back, {profile?.name?.split(" ")[0] || "there"}
            </h1>
            <p className="text-muted-foreground">
              {"Manage your health records and personal information in one place."}
            </p>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming Appts</p>
                  <p className="text-2xl font-bold text-foreground">0</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                  <FileText className="h-5 w-5 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Medical Files</p>
                  <p className="text-2xl font-bold text-foreground">{files.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Allergies</p>
                  <p className="text-2xl font-bold text-foreground">{profile?.profile?.allergies ? "Yes" : "None"}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <QrIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ID Status</p>
                  <p className="text-sm font-semibold text-accent-foreground">Verified</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for details */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:w-fit lg:grid-cols-5 h-auto lg:h-10">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="records">Medical Records</TabsTrigger>
              <TabsTrigger value="settings">Profile Settings</TabsTrigger>
              <TabsTrigger value="appointments" className="hidden lg:inline-flex">Appointments</TabsTrigger>
              <TabsTrigger value="qr" className="hidden lg:inline-flex">QR Code</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading">Basic Info</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground text-sm">Full Name:</span>
                      <span className="font-semibold text-sm">{profile?.name || "---"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground text-sm">Email:</span>
                      <span className="font-semibold text-sm">{profile?.email || "---"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground text-sm">National ID:</span>
                      <span className="font-semibold text-sm">{profile?.national_id || "---"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground text-sm">Phone:</span>
                      <span className="font-semibold text-sm">{profile?.profile?.phone || "---"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground text-sm">Emergency Contact:</span>
                      <span className="font-semibold text-sm">{profile?.profile?.emergency_contact_name || "---"} ({profile?.profile?.emergency_contact_phone || "---"})</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading">Medical Baseline</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground text-sm">Blood Type:</span>
                      <Badge variant="outline" className="text-primary border-primary">{profile?.profile?.blood_type || "N/A"}</Badge>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground text-sm">Weight / Height:</span>
                      <span className="font-semibold text-sm">
                        {profile?.profile?.weight || "--"}kg / {profile?.profile?.height || "--"}cm
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground text-sm">Chronic Diseases:</span>
                      <span className="font-semibold text-sm text-right max-w-[150px] truncate">{profile?.profile?.chronic_diseases || "None"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground text-sm">Allergies:</span>
                      <span className="font-semibold text-sm text-right max-w-[150px] truncate">{profile?.profile?.allergies || "None"}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-border/50">
                      <span className="text-muted-foreground text-sm">Location:</span>
                      <span className="font-semibold text-sm text-right max-w-[150px] truncate">{profile?.profile?.city || "---"}, {profile?.profile?.governorate || "---"}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="records" className="mt-4">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading flex items-center gap-2 text-primary">
                      <Upload className="h-5 w-5" />
                      Upload Medical Record
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fileTitle">File Title</Label>
                        <Input
                          id="fileTitle"
                          placeholder="e.g. Chest X-Ray Jan 2026"
                          value={fileTitle}
                          onChange={(e) => setFileTitle(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="fileType">Record Type</Label>
                        <Select value={fileType} onValueChange={setFileType}>
                          <SelectTrigger id="fileType">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
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
                        <Input
                          id="fileInput"
                          type="file"
                          multiple
                          accept=".jpg,.jpeg,.png,.pdf"
                          className="cursor-pointer"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || [])
                            setSelectedFiles(files)
                          }}
                        />
                      </div>
                    </div>
                    {selectedFiles.length > 0 && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-xl border border-dashed border-primary/20">
                        <p className="text-xs font-semibold mb-2 flex items-center gap-2">
                          <FileText className="h-3 w-3 text-primary" />
                          Selected Files ({selectedFiles.length}):
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
                      ) : (
                        files.map((file) => (
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
                              <h4 className="font-bold text-base mb-4 flex-1">{file.title}</h4>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 text-xs h-9 rounded-xl"
                                  onClick={() => window.open(getFileUrl(file), '_blank')}
                                >
                                  Preview
                                </Button>
                                <Button
                                  variant="secondary"
                                  size="icon"
                                  className="h-9 w-9 rounded-xl"
                                  onClick={() => handleDownloadFile(file)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

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
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" value={profile?.email || ""} disabled className="bg-muted rounded-xl border-dashed" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nationalId">National ID Number</Label>
                        <Input id="nationalId" value={nationalId} onChange={(e) => setNationalId(e.target.value)} className="rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Primary Phone</Label>
                        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phoneAlt">Alternative Phone</Label>
                        <Input id="phoneAlt" value={phoneAlt} onChange={(e) => setPhoneAlt(e.target.value)} className="rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="birthDate">Birth Date</Label>
                        <Input id="birthDate" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select value={gender} onValueChange={setGender}>
                          <SelectTrigger id="gender" className="rounded-xl">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nationality">Nationality</Label>
                        <Input id="nationality" value={nationality} onChange={(e) => setNationality(e.target.value)} className="rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maritalStatus">Marital Status</Label>
                        <Select value={maritalStatus} onValueChange={setMaritalStatus}>
                          <SelectTrigger id="maritalStatus" className="rounded-xl">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Single</SelectItem>
                            <SelectItem value="married">Married</SelectItem>
                            <SelectItem value="divorced">Divorced</SelectItem>
                            <SelectItem value="widowed">Widowed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="occupation">Occupation</Label>
                        <Input id="occupation" value={occupation} onChange={(e) => setOccupation(e.target.value)} className="rounded-xl" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
                      <LayoutDashboard className="h-5 w-5 text-primary" /> Location & Address
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="governorate">Governorate</Label>
                        <Input id="governorate" value={governorate} onChange={(e) => setGovernorate(e.target.value)} className="rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} className="rounded-xl" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Full Address</Label>
                      <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="min-h-[60px] rounded-xl" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-primary" /> Medical Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="bloodType">Blood Type</Label>
                        <Select value={bloodType} onValueChange={setBloodType}>
                          <SelectTrigger id="bloodType" className="rounded-xl">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(type => (
                              <SelectItem key={type} value={type}>{type}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="height">Height (cm)</Label>
                        <Input id="height" type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input id="weight" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} className="rounded-xl" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="chronic">Chronic Diseases</Label>
                        <Textarea id="chronic" value={chronicDiseases} onChange={(e) => setChronicDiseases(e.target.value)} className="min-h-[100px] rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="allergies">Known Allergies</Label>
                        <Textarea id="allergies" value={allergies} onChange={(e) => setAllergies(e.target.value)} className="min-h-[100px] rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="meds">Current Medications</Label>
                        <Textarea id="meds" value={currentMedications} onChange={(e) => setCurrentMedications(e.target.value)} className="min-h-[100px] rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="surgeries">Previous Surgeries</Label>
                        <Textarea id="surgeries" value={previousSurgeries} onChange={(e) => setPreviousSurgeries(e.target.value)} className="min-h-[100px] rounded-xl" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="familyHistory">Family Medical History</Label>
                      <Textarea id="familyHistory" value={familyHistory} onChange={(e) => setFamilyHistory(e.target.value)} className="min-h-[80px] rounded-xl" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
                      <PhoneIcon className="h-5 w-5 text-primary" /> Emergency Contact
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="emergencyName">Contact Name</Label>
                        <Input id="emergencyName" value={emergencyContactName} onChange={(e) => setEmergencyContactName(e.target.value)} className="rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergencyPhone">Contact Phone</Label>
                        <Input id="emergencyPhone" value={emergencyContactPhone} onChange={(e) => setEmergencyContactPhone(e.target.value)} className="rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergencyRelation">Relation</Label>
                        <Input id="emergencyRelation" value={emergencyContactRelation} onChange={(e) => setEmergencyContactRelation(e.target.value)} className="rounded-xl" />
                      </div>
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

            <TabsContent value="appointments" className="mt-4">
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                    <Calendar className="h-10 w-10 text-muted-foreground opacity-50" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No Active Appointments</h3>
                  <p className="max-w-xs text-muted-foreground mx-auto mb-8">
                    You don't have any appointments scheduled with doctors at this moment.
                  </p>
                  <Button variant="default" className="rounded-full px-8">Book Appointment</Button>
                </CardContent>
              </Card>
            </TabsContent>

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
                    <Button
                      className="rounded-xl px-8"
                      onClick={handleRegenerateQr}
                      disabled={loading}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {loading ? "Generating..." : "Regenerate QR"}
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-xl px-8"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = qrImage || "";
                        link.download = `QR_Code_${profile?.name?.replace(/\s/g, '_')}.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      disabled={!qrImage}
                    >
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
