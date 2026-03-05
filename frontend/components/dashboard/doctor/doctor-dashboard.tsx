"use client"

import { useState } from "react"
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
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import {
  doctorProfile,
  doctorPatients,
  patientTimeline,
} from "@/lib/mock-data"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const navItems = [
  { title: "Overview", href: "/dashboard/doctor", icon: LayoutDashboard },
  { title: "Search Patient", href: "/dashboard/doctor", icon: Search },
  { title: "My Patients", href: "/dashboard/doctor", icon: Users, badge: "4" },
  { title: "Add Diagnosis", href: "/dashboard/doctor", icon: Stethoscope },
  { title: "Prescriptions", href: "/dashboard/doctor", icon: Pill },
  { title: "Lab Results", href: "/dashboard/doctor", icon: FlaskConical },
]

export function DoctorDashboardContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const filteredPatients = doctorPatients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nationalId.includes(searchQuery) ||
      p.id.includes(searchQuery)
  )

  return (
    <DashboardShell
      navItems={navItems}
      userName={doctorProfile.name}
      userRole="Cardiologist"
      userInitials="SE"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Doctor Dashboard</h1>
            <p className="text-muted-foreground">
              {doctorProfile.facility} - {doctorProfile.specialty}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {doctorProfile.patientsToday} patients today
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
                <p className="text-2xl font-bold text-foreground">{doctorProfile.totalPatients}</p>
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
                <p className="text-2xl font-bold text-foreground">{doctorProfile.patientsToday}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Records Updated</p>
                <p className="text-2xl font-bold text-foreground">24</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FlaskConical className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Labs</p>
                <p className="text-2xl font-bold text-foreground">5</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="patients" className="w-full">
          <TabsList>
            <TabsTrigger value="patients">My Patients</TabsTrigger>
            <TabsTrigger value="search">Search Patient</TabsTrigger>
            <TabsTrigger value="diagnosis">Add Diagnosis</TabsTrigger>
            <TabsTrigger value="timeline">Patient Timeline</TabsTrigger>
          </TabsList>

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
                    {doctorPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                                {patient.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">{patient.name}</p>
                              <p className="text-xs text-muted-foreground">{patient.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{patient.nationalId}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{patient.bloodType}</Badge>
                        </TableCell>
                        <TableCell>{patient.condition}</TableCell>
                        <TableCell className="text-muted-foreground">{patient.lastVisit}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">View</Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{patient.name}</DialogTitle>
                                <DialogDescription>Patient ID: {patient.id}</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="rounded-lg bg-secondary/50 p-3">
                                    <p className="text-xs text-muted-foreground">Age</p>
                                    <p className="font-semibold text-foreground">{patient.age} years</p>
                                  </div>
                                  <div className="rounded-lg bg-secondary/50 p-3">
                                    <p className="text-xs text-muted-foreground">Blood Type</p>
                                    <p className="font-semibold text-foreground">{patient.bloodType}</p>
                                  </div>
                                  <div className="rounded-lg bg-secondary/50 p-3">
                                    <p className="text-xs text-muted-foreground">Condition</p>
                                    <p className="font-semibold text-foreground">{patient.condition}</p>
                                  </div>
                                  <div className="rounded-lg bg-secondary/50 p-3">
                                    <p className="text-xs text-muted-foreground">Last Visit</p>
                                    <p className="font-semibold text-foreground">{patient.lastVisit}</p>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="search" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Search Patient by National ID</CardTitle>
                <CardDescription>Look up any patient in the national database</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      className="pl-10"
                      placeholder="Enter National ID, Patient ID, or Name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button>Search</Button>
                </div>
                {searchQuery && (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">{filteredPatients.length} result(s) found</p>
                    {filteredPatients.map((patient) => (
                      <div key={patient.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {patient.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{patient.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {patient.nationalId} | {patient.bloodType} | Age: {patient.age}
                            </p>
                          </div>
                        </div>
                        <Button size="sm">View Full History</Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="diagnosis" className="mt-4">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-primary" />
                    Add Diagnosis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Patient ID</Label>
                    <Input placeholder="Enter patient ID or search..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Diagnosis</Label>
                    <Input placeholder="Primary diagnosis" />
                  </div>
                  <div className="space-y-2">
                    <Label>Severity</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea placeholder="Additional notes and observations..." rows={4} />
                  </div>
                  <Button className="w-full">
                    <UserPlus className="mr-2 h-4 w-4" /> Submit Diagnosis
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-heading flex items-center gap-2">
                    <Pill className="h-5 w-5 text-primary" />
                    Add Prescription
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Patient ID</Label>
                    <Input placeholder="Enter patient ID" />
                  </div>
                  <div className="space-y-2">
                    <Label>Medication</Label>
                    <Input placeholder="Medication name" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Dosage</Label>
                      <Input placeholder="e.g. 500mg" />
                    </div>
                    <div className="space-y-2">
                      <Label>Frequency</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="once">Once daily</SelectItem>
                          <SelectItem value="twice">Twice daily</SelectItem>
                          <SelectItem value="three">Three times daily</SelectItem>
                          <SelectItem value="asneeded">As needed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input type="date" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Instructions</Label>
                    <Textarea placeholder="Special instructions..." rows={2} />
                  </div>
                  <Button className="w-full">
                    <Pill className="mr-2 h-4 w-4" /> Issue Prescription
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="timeline" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Patient Visit Timeline</CardTitle>
                <CardDescription>Recent activity for Ahmed Mohamed Hassan (P-2840019)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative space-y-6 pl-6">
                  <div className="absolute left-2.5 top-1 bottom-1 w-px bg-border" />
                  {patientTimeline.map((entry, i) => (
                    <div key={i} className="relative">
                      <div className={`absolute -left-[18px] top-1 h-3 w-3 rounded-full border-2 bg-background ${
                        entry.type === "visit" ? "border-primary" :
                        entry.type === "lab" ? "border-accent" :
                        "border-chart-3"
                      }`} />
                      <div className="rounded-lg border border-border p-4">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge variant={
                            entry.type === "visit" ? "default" :
                            entry.type === "lab" ? "secondary" :
                            "outline"
                          }>
                            {entry.event}
                          </Badge>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" /> {entry.date}
                          </span>
                        </div>
                        <p className="text-sm text-foreground">{entry.details}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{entry.doctor}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}
