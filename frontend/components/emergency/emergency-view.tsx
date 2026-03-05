"use client"

import { AlertTriangle, Heart, Pill, Phone, Clock, Shield, Droplets, User } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { emergencyPatient } from "@/lib/mock-data"

export function EmergencyView() {
  return (
    <div className="min-h-screen bg-background">
      {/* Emergency Header */}
      <header className="border-b-2 border-destructive/30 bg-destructive/5">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive">
                <AlertTriangle className="h-5 w-5 text-destructive-foreground" />
              </div>
              <div>
                <h1 className="font-heading text-lg font-bold text-foreground">Emergency Medical Access</h1>
                <p className="text-sm text-muted-foreground">MedLink QR - No Login Required</p>
              </div>
            </div>
            <Badge variant="destructive" className="animate-pulse bg-destructive text-destructive-foreground">
              EMERGENCY
            </Badge>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        <div className="space-y-4">
          {/* Patient Identity */}
          <Card className="border-2 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-7 w-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="font-heading text-2xl font-bold text-foreground">{emergencyPatient.name}</h2>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span>{emergencyPatient.age} years old</span>
                    <span className="text-border">|</span>
                    <span>{emergencyPatient.gender}</span>
                    <span className="text-border">|</span>
                    <span>ID: {emergencyPatient.nationalId}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Critical Info Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Blood Type */}
            <Card className="border-2 border-destructive/20 bg-destructive/[0.02]">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10">
                  <Droplets className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Blood Type</p>
                  <p className="text-3xl font-bold text-foreground">{emergencyPatient.bloodType}</p>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card className="border-2 border-primary/20">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Emergency Contact</p>
                  <p className="font-semibold text-foreground">{emergencyPatient.emergencyContact}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chronic Diseases */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 font-heading text-lg">
                <Heart className="h-5 w-5 text-destructive" />
                Chronic Diseases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {emergencyPatient.chronicDiseases.map((disease) => (
                  <Badge key={disease} variant="destructive" className="bg-destructive/10 text-destructive border border-destructive/20 text-sm px-3 py-1">
                    {disease}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Current Medications */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 font-heading text-lg">
                <Pill className="h-5 w-5 text-primary" />
                Current Medications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {emergencyPatient.currentMedications.map((med) => (
                  <div key={med.name} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="font-semibold text-foreground">{med.name}</p>
                      <p className="text-sm text-muted-foreground">{med.dosage} - {med.frequency}</p>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Allergies - Critical */}
          <Card className="border-2 border-destructive/30 bg-destructive/[0.02]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 font-heading text-lg text-destructive">
                <AlertTriangle className="h-5 w-5" />
                ALLERGIES - CRITICAL
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {emergencyPatient.allergies.map((allergy) => (
                  <div key={allergy.allergen} className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                    <div>
                      <p className="font-semibold text-foreground">{allergy.allergen}</p>
                      <p className="text-sm text-muted-foreground">Reaction: {allergy.reaction}</p>
                    </div>
                    <Badge variant="destructive">{allergy.severity}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Footer Info */}
          <div className="flex flex-col items-center gap-3 pt-4 pb-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Last Updated: {emergencyPatient.lastUpdated}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Data encrypted & verified by MedLink National System</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
