"use client"

import { useState, useEffect, useTransition } from "react"
import {
  LayoutDashboard,
  Users,
  Plus,
  Pencil,
  Trash2,
  Search,
  Loader2,
  Mail,
  User,
  Phone,
  Stethoscope,
  Building2,
  MapPin,
  Briefcase,
  MoreVertical,
  QrCode,
  RefreshCw,
  Shield,
  ShieldCheck,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { toast } from "sonner"
import {
  getMeApi,
  adminGetDoctorsApi,
  adminStoreDoctorApi,
  adminUpdateDoctorApi,
  adminDeleteDoctorApi,
  adminGetLabsApi,
  adminStoreLabApi,
  adminUpdateLabApi,
  adminDeleteLabApi,
  adminGetPharmasApi,
  adminStorePharmaApi,
  adminUpdatePharmaApi,
  adminDeletePharmaApi,
  adminGetParamedicsApi,
  adminStoreParamedicApi,
  adminUpdateParamedicApi,
  adminDeleteParamedicApi,
  adminGetQrApi,
  adminRegenerateQrApi,
} from "@/lib/api"

export function AdminDashboardContent() {
  const [admin, setAdmin] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [searchQuery, setSearchQuery] = useState("")
  const [qrImage, setQrImage] = useState<string | null>(null)
  const [isQrLoading, setIsQrLoading] = useState(false)

  // Form states
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [formData, setFormData] = useState<any>({
    name: "",
    email: "",
    password: "",
    phone: "",
    national_id: "",
    birth_date: "",
    gender: "male",
    specialty: "",
    facility: "",
    department: "",
    experience_years: "",
    license_number: "",
  })

  useEffect(() => {
    fetchAdminAndData()
  }, [])

  const fetchAdminAndData = async () => {
    const token = localStorage.getItem("auth_token")
    if (!token) return

    try {
      // First check localStorage for a saved user session
      const savedUser = localStorage.getItem("auth_user")
      if (savedUser) {
        const user = JSON.parse(savedUser)
        setAdmin(user)
        await fetchData(user.type, token)
        setLoading(false)
        return
      }

      // Fallback to API if not in localStorage (though for admins /me might fail)
      const meRes = await getMeApi(token)
      if (meRes.user) {
        setAdmin(meRes.user)
        localStorage.setItem("auth_user", JSON.stringify(meRes.user))
        await fetchData(meRes.user.type, token)
      } else {
        // If we reach here, we really don't have user info
        window.location.href = "/login"
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err)
      // Only redirect if we don't even have the admin state set
      if (!admin) window.location.href = "/login"
    } finally {
      setLoading(false)
    }
  }

  const fetchQr = async () => {
    const token = localStorage.getItem("auth_token")
    if (!token) return
    setIsQrLoading(true)
    try {
      const res = await adminGetQrApi(token)
      if (res.qr_image) {
        setQrImage(res.qr_image)
      }
    } catch (err) {
      toast.error("Failed to fetch QR code")
    } finally {
      setIsQrLoading(false)
    }
  }

  const handleRegenerateQr = async () => {
    const token = localStorage.getItem("auth_token")
    if (!token) return
    setIsQrLoading(true)
    try {
      const res = await adminRegenerateQrApi(token)
      if (res.qr_image) {
        setQrImage(res.qr_image)
        toast.success("QR Code regenerated successfully")
      }
    } catch (err) {
      toast.error("Failed to regenerate QR code")
    } finally {
      setIsQrLoading(false)
    }
  }

  const fetchData = async (type: string, token: string) => {
    let res
    switch (type) {
      case "doctor":
        res = await adminGetDoctorsApi(token)
        break
      case "lab":
        res = await adminGetLabsApi(token)
        break
      case "pharma":
        res = await adminGetPharmasApi(token)
        break
      case "paramedic":
        res = await adminGetParamedicsApi(token)
        break
    }
    if (res && res.data) {
      setItems(res.data)
    } else if (Array.isArray(res)) {
      setItems(res)
    }
  }

  const handleOpenDialog = (item: any = null) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        name: item.name || "",
        email: item.email || "",
        password: "", 
        phone: item.phone || "",
        national_id: item.national_id || "",
        birth_date: item.birth_date || "",
        gender: item.gender || "male",
        specialty: item.specialty || "",
        facility: item.facility || "",
        department: item.department || "",
        experience_years: item.experience_years || "",
        license_number: item.license_number || "",
      })
    } else {
      setEditingItem(null)
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        national_id: "",
        birth_date: "",
        gender: "male",
        specialty: "",
        facility: "",
        department: "",
        experience_years: "",
        license_number: "",
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    const token = localStorage.getItem("auth_token")
    if (!token || !admin) return

    startTransition(async () => {
      try {
        let res
        const payload = { ...formData }
        if (editingItem && !payload.password) delete payload.password

        if (admin.type === "doctor") {
          res = editingItem 
            ? await adminUpdateDoctorApi(token, editingItem.id, payload)
            : await adminStoreDoctorApi(token, payload)
        } else if (admin.type === "lab") {
          res = editingItem
            ? await adminUpdateLabApi(token, editingItem.id, payload)
            : await adminStoreLabApi(token, payload)
        } else if (admin.type === "pharma") {
          res = editingItem
            ? await adminUpdatePharmaApi(token, editingItem.id, payload)
            : await adminStorePharmaApi(token, payload)
        } else if (admin.type === "paramedic") {
          res = editingItem
            ? await adminUpdateParamedicApi(token, editingItem.id, payload)
            : await adminStoreParamedicApi(token, payload)
        }

        if (res.success || res.id || res.doctor || res.lab || res.pharma || res.paramedic) {
          toast.success(editingItem ? "Updated successfully" : "Created successfully")
          setIsDialogOpen(false)
          fetchData(admin.type, token)
        } else {
          toast.error(res.message || "Operation failed")
        }
      } catch (err) {
        toast.error("An error occurred")
      }
    })
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return

    const token = localStorage.getItem("auth_token")
    if (!token || !admin) return

    try {
      let res
      if (admin.type === "doctor") res = await adminDeleteDoctorApi(token, id)
      else if (admin.type === "lab") res = await adminDeleteLabApi(token, id)
      else if (admin.type === "pharma") res = await adminDeletePharmaApi(token, id)
      else if (admin.type === "paramedic") res = await adminDeleteParamedicApi(token, id)

      if (res.success) {
        toast.success("Deleted successfully")
        fetchData(admin.type, token)
      } else {
        toast.error(res.message || "Delete failed")
      }
    } catch (err) {
      toast.error("An error occurred")
    }
  }

  const filteredItems = items.filter(item => 
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const navItems = [
    { title: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
    { title: "Management", href: "/dashboard/admin", icon: Users },
    { title: "Security", href: "/dashboard/admin", icon: Shield },
  ]

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <DashboardShell
      navItems={navItems}
      userName={admin?.name || "Admin"}
      userRole={`Admin - ${admin?.type?.toUpperCase()}`}
      userInitials={admin?.name?.substring(0, 2).toUpperCase() || "AD"}
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {admin?.type?.charAt(0).toUpperCase() + admin?.type?.slice(1)} Management
            </h1>
            <p className="text-muted-foreground">
              Create, update, and manage {admin?.type} accounts.
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="shadow-lg shadow-primary/20">
            <Plus className="mr-2 h-4 w-4" /> Add New {admin?.type}
          </Button>
        </div>

        <Tabs defaultValue="management" className="w-full">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2">
            <TabsTrigger value="management">Management</TabsTrigger>
            <TabsTrigger value="security" onClick={fetchQr}>Security & QR</TabsTrigger>
          </TabsList>

          <TabsContent value="management" className="mt-6 space-y-6">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>System Users</CardTitle>
                    <CardDescription>A list of all registered {admin?.type}s.</CardDescription>
                  </div>
                  <div className="relative w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or email..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      {admin?.type === "doctor" && <TableHead>Specialty</TableHead>}
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.map((item) => (
                      <TableRow key={item.id} className="group transition-colors hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                              {item.name?.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">{item.name}</span>
                              <span className="text-xs text-muted-foreground">ID: {item.id}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Mail className="h-3.5 w-3.5" />
                            {item.email}
                          </div>
                        </TableCell>
                        {admin?.type === "doctor" && (
                          <TableCell>
                            <Badge variant="secondary" className="font-normal">
                              {item.specialty || "N/A"}
                            </Badge>
                          </TableCell>
                        )}
                        <TableCell className="text-muted-foreground">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : "N/A"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(item)}
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(item.id)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredItems.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                          No {admin?.type}s found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5 text-primary" />
                    Login QR Code
                  </CardTitle>
                  <CardDescription>
                    Use this QR code to login instantly from your mobile device.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-6">
                  {isQrLoading ? (
                    <div className="flex h-64 w-64 items-center justify-center rounded-lg border-2 border-dashed border-muted">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : qrImage ? (
                    <div className="group relative">
                      <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-primary to-primary/50 opacity-25 blur transition duration-1000 group-hover:opacity-50"></div>
                      <div className="relative rounded-lg border bg-white p-4 shadow-xl">
                        <img src={qrImage} alt="Login QR Code" className="h-64 w-64" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-64 w-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted text-center p-4">
                      <QrCode className="mb-2 h-10 w-10 text-muted-foreground opacity-20" />
                      <p className="text-sm text-muted-foreground">No QR code generated yet</p>
                    </div>
                  )}
                  
                  <div className="mt-8 flex w-full flex-col gap-3">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleRegenerateQr}
                      disabled={isQrLoading}
                    >
                      <RefreshCw className={`mr-2 h-4 w-4 ${isQrLoading ? 'animate-spin' : ''}`} />
                      Regenerate QR Code
                    </Button>
                    <p className="text-center text-xs text-muted-foreground">
                      Regenerating will invalidate your previous login QR code.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Security Tips
                  </CardTitle>
                  <CardDescription>
                    Keep your account secure.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <h4 className="font-medium">QR Code Safety</h4>
                    <p className="text-sm text-muted-foreground">
                      Never share your login QR code with anyone. It provides direct access to your administrative dashboard.
                    </p>
                  </div>
                  <div className="rounded-lg border bg-muted/30 p-4">
                    <h4 className="font-medium">Device Authorization</h4>
                    <p className="text-sm text-muted-foreground">
                      If you suspect your QR code has been compromised, use the "Regenerate" button to create a new one immediately.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? `Edit ${admin?.type}` : `Add New ${admin?.type}`}</DialogTitle>
            <DialogDescription>
              Enter the details for the {admin?.type} account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="John Doe"
                    className="pl-9"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    className="pl-9"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{editingItem ? "New Password (Leave blank to keep current)" : "Password"}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            {admin?.type === "doctor" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        placeholder="+20 123..."
                        className="pl-9"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="national_id">National ID</Label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="national_id"
                        placeholder="299..."
                        className="pl-9"
                        value={formData.national_id}
                        onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="birth_date">Birth Date</Label>
                    <Input
                      id="birth_date"
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <select
                      id="gender"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="specialty">Specialty</Label>
                    <div className="relative">
                      <Stethoscope className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="specialty"
                        placeholder="Cardiology"
                        className="pl-9"
                        value={formData.specialty}
                        onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      type="number"
                      placeholder="5"
                      value={formData.experience_years}
                      onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="facility">Facility</Label>
                    <div className="relative">
                      <Building2 className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="facility"
                        placeholder="Cairo Hospital"
                        className="pl-9"
                        value={formData.facility}
                        onChange={(e) => setFormData({ ...formData, facility: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="department"
                        placeholder="Cardiology"
                        className="pl-9"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="license">License Number</Label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="license"
                        placeholder="LIC-12345"
                        className="pl-9"
                        value={formData.license_number}
                        onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingItem ? "Save Changes" : "Create Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
}
