"use client"

import {
  LayoutDashboard,
  Users,
  BarChart3,
  Activity,
  Building2,
  UserCheck,
  BedDouble,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import {
  facilityProfile,
  facilityDoctors,
  facilityActivityLog,
  monthlyVisits,
  departmentStats,
} from "@/lib/mock-data"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Tooltip,
} from "recharts"

const navItems = [
  { title: "Overview", href: "/dashboard/facility", icon: LayoutDashboard },
  { title: "Doctors", href: "/dashboard/facility", icon: Users, badge: String(facilityDoctors.length) },
  { title: "Analytics", href: "/dashboard/facility", icon: BarChart3 },
  { title: "Activity Log", href: "/dashboard/facility", icon: Activity },
  { title: "Departments", href: "/dashboard/facility", icon: Building2 },
]

const COLORS = [
  "oklch(0.52 0.14 240)",
  "oklch(0.72 0.17 155)",
  "oklch(0.6 0.12 200)",
  "oklch(0.75 0.1 240)",
  "oklch(0.65 0.15 180)",
]

export function FacilityDashboardContent() {
  return (
    <DashboardShell
      navItems={navItems}
      userName="Admin"
      userRole="Cairo University Hospital"
      userInitials="CU"
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">{facilityProfile.name}</h1>
          <p className="text-muted-foreground">{facilityProfile.type} - {facilityProfile.address}</p>
        </div>

        {/* Overview */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Doctors</p>
                <p className="text-2xl font-bold text-foreground">{facilityProfile.totalDoctors}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                <UserCheck className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Patients</p>
                <p className="text-2xl font-bold text-foreground">{facilityProfile.totalPatients.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <BedDouble className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Beds</p>
                <p className="text-2xl font-bold text-foreground">{facilityProfile.activeBeds}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Departments</p>
                <p className="text-2xl font-bold text-foreground">{facilityProfile.departments}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="doctors" className="w-full">
          <TabsList>
            <TabsTrigger value="doctors">Manage Doctors</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
          </TabsList>

          <TabsContent value="doctors" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="font-heading">Doctors</CardTitle>
                  <CardDescription>Manage facility medical staff</CardDescription>
                </div>
                <Button size="sm">
                  <UserCheck className="mr-2 h-4 w-4" /> Approve Pending
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Specialty</TableHead>
                      <TableHead>Patients</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {facilityDoctors.map((doctor) => (
                      <TableRow key={doctor.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {doctor.name.replace("Dr. ", "").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">{doctor.name}</p>
                              <p className="text-xs text-muted-foreground">{doctor.id}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{doctor.specialty}</TableCell>
                        <TableCell>{doctor.patients.toLocaleString()}</TableCell>
                        <TableCell className="text-muted-foreground">{doctor.joinDate}</TableCell>
                        <TableCell>
                          <Badge variant={doctor.status === "active" ? "default" : "secondary"}>
                            {doctor.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {doctor.status === "pending" ? (
                            <div className="flex gap-2">
                              <Button size="sm" variant="default">Approve</Button>
                              <Button size="sm" variant="outline">Reject</Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="outline">Manage</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-4">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Monthly Patient Visits</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyVisits}>
                        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.915 0.008 240)" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="oklch(0.5 0.03 240)" />
                        <YAxis tick={{ fontSize: 12 }} stroke="oklch(0.5 0.03 240)" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "oklch(1 0 0)",
                            border: "1px solid oklch(0.915 0.008 240)",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                        />
                        <Bar dataKey="visits" radius={[6, 6, 0, 0]} fill="oklch(0.52 0.14 240)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-heading">Patients by Department</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={departmentStats}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          dataKey="patients"
                          nameKey="name"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                          fontSize={11}
                        >
                          {departmentStats.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "oklch(1 0 0)",
                            border: "1px solid oklch(0.915 0.008 240)",
                            borderRadius: "8px",
                            fontSize: "12px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-heading">Activity Log</CardTitle>
                <CardDescription>Recent system activity and access events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {facilityActivityLog.map((log) => (
                    <div key={log.id} className="flex items-start gap-4 rounded-lg border border-border p-4">
                      <div className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                        log.type === "emergency" ? "bg-destructive" :
                        log.type === "access" ? "bg-primary" :
                        log.type === "registration" ? "bg-accent" :
                        log.type === "upload" ? "bg-chart-3" :
                        "bg-muted-foreground"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-foreground">{log.action}</p>
                          <Badge variant="outline" className="text-xs">{log.type}</Badge>
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">{log.user}</p>
                        <p className="text-sm text-muted-foreground">Target: {log.target}</p>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">{log.timestamp}</span>
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
