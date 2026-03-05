"use client"

import {
  LayoutDashboard,
  FileText,
  QrCode,
  Calendar,
  Pill,
  AlertTriangle,
  User,
  Clock,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import {
  patientProfile,
  patientAppointments,
  patientMedications,
  patientAllergies,
  medicalHistory,
} from "@/lib/mock-data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const navItems = [
  { title: "Overview", href: "/dashboard/patient", icon: LayoutDashboard },
  { title: "Medical Records", href: "/dashboard/patient", icon: FileText },
  { title: "Appointments", href: "/dashboard/patient", icon: Calendar, badge: "2" },
  { title: "Medications", href: "/dashboard/patient", icon: Pill, badge: "3" },
  { title: "QR Code", href: "/dashboard/patient", icon: QrCode },
  { title: "Profile", href: "/dashboard/patient", icon: User },
]

export function PatientDashboardContent() {
  return (
    <DashboardShell
      navItems={navItems}
      userName={patientProfile.name}
      userRole="Patient"
      userInitials="AH"
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Welcome back, {patientProfile.name.split(" ")[0]}
          </h1>
          <p className="text-muted-foreground">
            {"Here's an overview of your medical profile and upcoming activities."}
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
                <p className="text-sm text-muted-foreground">Upcoming Appointments</p>
                <p className="text-2xl font-bold text-foreground">
                  {patientAppointments.filter((a) => a.status === "upcoming").length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                <Pill className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Medications</p>
                <p className="text-2xl font-bold text-foreground">{patientMedications.length}</p>
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
                <p className="text-2xl font-bold text-foreground">{patientAllergies.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <QrCode className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">QR Code</p>
                <p className="text-sm font-semibold text-accent-foreground">Active</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for details */}
        <Tabs defaultValue="appointments" className="w-full">
          <TabsList>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="allergies">Allergies</TabsTrigger>
            <TabsTrigger value="history">Medical History</TabsTrigger>
            <TabsTrigger value="qr">QR Code</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Specialty</TableHead>
                      <TableHead>Facility</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patientAppointments.map((apt) => (
                      <TableRow key={apt.id}>
                        <TableCell className="font-medium">{apt.doctor}</TableCell>
                        <TableCell>{apt.specialty}</TableCell>
                        <TableCell>{apt.facility}</TableCell>
                        <TableCell>{apt.date} at {apt.time}</TableCell>
                        <TableCell>
                          <Badge variant={apt.status === "upcoming" ? "default" : "secondary"}>
                            {apt.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="medications" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Active Medications</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medication</TableHead>
                      <TableHead>Dosage</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Prescribed By</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patientMedications.map((med) => (
                      <TableRow key={med.name}>
                        <TableCell className="font-medium">{med.name}</TableCell>
                        <TableCell>{med.dosage}</TableCell>
                        <TableCell>{med.frequency}</TableCell>
                        <TableCell>{med.prescribedBy}</TableCell>
                        <TableCell className="text-muted-foreground">{med.startDate} - {med.endDate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="allergies" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Known Allergies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {patientAllergies.map((allergy) => (
                    <div key={allergy.allergen} className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`h-5 w-5 ${allergy.severity === "High" ? "text-destructive" : allergy.severity === "Medium" ? "text-yellow-500" : "text-muted-foreground"}`} />
                        <div>
                          <p className="font-medium text-foreground">{allergy.allergen}</p>
                          <p className="text-sm text-muted-foreground">Reaction: {allergy.reaction}</p>
                        </div>
                      </div>
                      <Badge variant={allergy.severity === "High" ? "destructive" : "secondary"}>
                        {allergy.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Medical History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative space-y-6 pl-6">
                  <div className="absolute left-2.5 top-1 bottom-1 w-px bg-border" />
                  {medicalHistory.map((entry, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[18px] top-1 h-3 w-3 rounded-full border-2 border-primary bg-background" />
                      <div className="rounded-lg border border-border p-4">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge variant="outline">{entry.type}</Badge>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" /> {entry.date}
                          </span>
                        </div>
                        <p className="font-medium text-foreground">{entry.diagnosis}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{entry.doctor} - {entry.facility}</p>
                        <p className="mt-2 text-sm text-muted-foreground">{entry.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qr" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Your Emergency QR Code</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center gap-6 py-8">
                  <div className="rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-8">
                    <div className="grid grid-cols-8 gap-1">
                      {Array.from({ length: 64 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-4 w-4 rounded-sm ${Math.random() > 0.5 ? "bg-foreground" : "bg-transparent"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">{patientProfile.name}</p>
                    <p className="text-sm text-muted-foreground">ID: {patientProfile.id}</p>
                  </div>
                  <Button>
                    <QrCode className="mr-2 h-4 w-4" />
                    Download QR Code
                  </Button>
                  <p className="max-w-md text-center text-xs text-muted-foreground">
                    This QR code allows authorized emergency personnel to access your critical medical information without login.
                    Keep it accessible for emergencies.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  )
}
