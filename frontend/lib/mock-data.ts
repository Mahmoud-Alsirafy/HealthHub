// Patient mock data
export const patientProfile = {
  id: "P-2840019",
  nationalId: "29901151234567",
  name: "Ahmed Mohamed Hassan",
  age: 27,
  gender: "Male",
  bloodType: "O+",
  dateOfBirth: "1999-01-15",
  phone: "+20 101 234 5678",
  email: "ahmed.hassan@email.com",
  address: "15 El-Tahrir St, Cairo, Egypt",
  emergencyContact: "Fatma Hassan - +20 102 345 6789",
  insuranceProvider: "National Health Insurance",
  insuranceId: "NHI-2840019",
}

export const patientAppointments = [
  {
    id: "APT-001",
    doctor: "Dr. Sarah El-Sayed",
    specialty: "Cardiology",
    facility: "Cairo University Hospital",
    date: "2026-03-15",
    time: "10:00 AM",
    status: "upcoming" as const,
  },
  {
    id: "APT-002",
    doctor: "Dr. Omar Farouk",
    specialty: "General Medicine",
    facility: "Ain Shams Hospital",
    date: "2026-03-20",
    time: "2:30 PM",
    status: "upcoming" as const,
  },
  {
    id: "APT-003",
    doctor: "Dr. Nadia Mansour",
    specialty: "Dermatology",
    facility: "Alexandria Medical Center",
    date: "2026-02-10",
    time: "11:00 AM",
    status: "completed" as const,
  },
]

export const patientMedications = [
  {
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    prescribedBy: "Dr. Sarah El-Sayed",
    startDate: "2026-01-15",
    endDate: "2026-07-15",
    status: "active" as const,
  },
  {
    name: "Metformin",
    dosage: "500mg",
    frequency: "Twice daily",
    prescribedBy: "Dr. Omar Farouk",
    startDate: "2025-11-01",
    endDate: "2026-05-01",
    status: "active" as const,
  },
  {
    name: "Vitamin D3",
    dosage: "5000 IU",
    frequency: "Once daily",
    prescribedBy: "Dr. Nadia Mansour",
    startDate: "2026-02-10",
    endDate: "2026-08-10",
    status: "active" as const,
  },
]

export const patientAllergies = [
  { allergen: "Penicillin", severity: "High", reaction: "Anaphylaxis" },
  { allergen: "Shellfish", severity: "Medium", reaction: "Skin rash" },
  { allergen: "Latex", severity: "Low", reaction: "Mild irritation" },
]

export const medicalHistory = [
  {
    date: "2026-02-10",
    type: "Consultation",
    doctor: "Dr. Nadia Mansour",
    facility: "Alexandria Medical Center",
    diagnosis: "Dermatitis - mild eczema",
    notes: "Prescribed topical treatment. Follow-up in 4 weeks.",
  },
  {
    date: "2026-01-15",
    type: "Lab Results",
    doctor: "Dr. Sarah El-Sayed",
    facility: "Cairo University Hospital",
    diagnosis: "Routine cardiac check",
    notes: "Blood pressure slightly elevated. Started on Lisinopril.",
  },
  {
    date: "2025-11-01",
    type: "Diagnosis",
    doctor: "Dr. Omar Farouk",
    facility: "Ain Shams Hospital",
    diagnosis: "Type 2 Diabetes - Early stage",
    notes: "Started Metformin. Dietary changes recommended.",
  },
  {
    date: "2025-08-20",
    type: "Emergency",
    doctor: "Dr. Layla Abdel-Rahim",
    facility: "Cairo Emergency Center",
    diagnosis: "Allergic reaction to medication",
    notes: "Penicillin allergy confirmed. Treated with epinephrine.",
  },
  {
    date: "2025-05-12",
    type: "Surgery",
    doctor: "Dr. Khaled Mostafa",
    facility: "Cairo University Hospital",
    diagnosis: "Appendectomy",
    notes: "Successful laparoscopic appendectomy. Full recovery.",
  },
]

// Doctor mock data
export const doctorProfile = {
  id: "D-1120045",
  name: "Dr. Sarah El-Sayed",
  specialty: "Cardiology",
  licenseNo: "MED-EG-2018-4521",
  facility: "Cairo University Hospital",
  phone: "+20 100 987 6543",
  email: "dr.sarah@cuhosp.eg",
  patientsToday: 12,
  totalPatients: 847,
}

export const doctorPatients = [
  {
    id: "P-2840019",
    nationalId: "29901151234567",
    name: "Ahmed Mohamed Hassan",
    age: 27,
    bloodType: "O+",
    lastVisit: "2026-01-15",
    condition: "Hypertension",
  },
  {
    id: "P-3150042",
    nationalId: "28512201234568",
    name: "Mariam Youssef Ali",
    age: 41,
    bloodType: "A-",
    lastVisit: "2026-02-28",
    condition: "Arrhythmia",
  },
  {
    id: "P-4280091",
    nationalId: "30003151234569",
    name: "Youssef Ibrahim Nour",
    age: 26,
    bloodType: "B+",
    lastVisit: "2026-02-20",
    condition: "Heart murmur",
  },
  {
    id: "P-1890076",
    nationalId: "27508101234570",
    name: "Fatma Abdel-Rahman",
    age: 51,
    bloodType: "AB+",
    lastVisit: "2026-03-01",
    condition: "Coronary artery disease",
  },
]

export const patientTimeline = [
  {
    date: "2026-03-01",
    event: "Follow-up Visit",
    doctor: "Dr. Sarah El-Sayed",
    details: "Blood pressure improved. Continue current medication.",
    type: "visit" as const,
  },
  {
    date: "2026-02-15",
    event: "Lab Results Received",
    doctor: "Dr. Sarah El-Sayed",
    details: "Cholesterol levels within normal range. HbA1c at 6.2%.",
    type: "lab" as const,
  },
  {
    date: "2026-01-15",
    event: "New Prescription",
    doctor: "Dr. Sarah El-Sayed",
    details: "Lisinopril 10mg prescribed for hypertension management.",
    type: "prescription" as const,
  },
  {
    date: "2025-12-01",
    event: "Initial Consultation",
    doctor: "Dr. Sarah El-Sayed",
    details: "Patient referred for elevated blood pressure. Full cardiac workup ordered.",
    type: "visit" as const,
  },
]

// Facility mock data
export const facilityProfile = {
  id: "F-001",
  name: "Cairo University Hospital",
  type: "Teaching Hospital",
  address: "Kasr El-Aini St, Cairo",
  totalDoctors: 245,
  totalPatients: 18450,
  activeBeds: 520,
  departments: 32,
}

export const facilityDoctors = [
  {
    id: "D-1120045",
    name: "Dr. Sarah El-Sayed",
    specialty: "Cardiology",
    status: "active" as const,
    patients: 847,
    joinDate: "2018-06-15",
  },
  {
    id: "D-2230067",
    name: "Dr. Khaled Mostafa",
    specialty: "General Surgery",
    status: "active" as const,
    patients: 1203,
    joinDate: "2015-09-01",
  },
  {
    id: "D-3340089",
    name: "Dr. Amira Hussein",
    specialty: "Pediatrics",
    status: "active" as const,
    patients: 654,
    joinDate: "2020-03-10",
  },
  {
    id: "D-4450012",
    name: "Dr. Hassan Bakr",
    specialty: "Orthopedics",
    status: "pending" as const,
    patients: 0,
    joinDate: "2026-02-28",
  },
  {
    id: "D-5560034",
    name: "Dr. Layla Abdel-Rahim",
    specialty: "Emergency Medicine",
    status: "active" as const,
    patients: 2100,
    joinDate: "2016-01-20",
  },
]

export const facilityActivityLog = [
  {
    id: "LOG-001",
    action: "Patient Record Accessed",
    user: "Dr. Sarah El-Sayed",
    target: "Ahmed Mohamed Hassan (P-2840019)",
    timestamp: "2026-03-01 09:32:14",
    type: "access" as const,
  },
  {
    id: "LOG-002",
    action: "New Doctor Registration",
    user: "Admin",
    target: "Dr. Hassan Bakr (D-4450012)",
    timestamp: "2026-02-28 14:15:20",
    type: "registration" as const,
  },
  {
    id: "LOG-003",
    action: "Prescription Added",
    user: "Dr. Omar Farouk",
    target: "Mariam Youssef Ali (P-3150042)",
    timestamp: "2026-02-28 11:45:33",
    type: "update" as const,
  },
  {
    id: "LOG-004",
    action: "Lab Results Uploaded",
    user: "Lab Technician: Nour Adel",
    target: "Youssef Ibrahim Nour (P-4280091)",
    timestamp: "2026-02-27 16:20:45",
    type: "upload" as const,
  },
  {
    id: "LOG-005",
    action: "Emergency QR Scan",
    user: "Paramedic Unit 7",
    target: "Fatma Abdel-Rahman (P-1890076)",
    timestamp: "2026-02-27 03:14:02",
    type: "emergency" as const,
  },
]

// Analytics data
export const monthlyVisits = [
  { month: "Sep", visits: 1240 },
  { month: "Oct", visits: 1380 },
  { month: "Nov", visits: 1520 },
  { month: "Dec", visits: 1190 },
  { month: "Jan", visits: 1680 },
  { month: "Feb", visits: 1450 },
]

export const departmentStats = [
  { name: "Cardiology", patients: 2840 },
  { name: "Surgery", patients: 1920 },
  { name: "Pediatrics", patients: 3100 },
  { name: "Emergency", patients: 4200 },
  { name: "Orthopedics", patients: 1560 },
]

// Emergency mock data
export const emergencyPatient = {
  name: "Ahmed Mohamed Hassan",
  age: 27,
  gender: "Male",
  bloodType: "O+",
  nationalId: "299011512345**",
  chronicDiseases: ["Type 2 Diabetes", "Hypertension"],
  currentMedications: [
    { name: "Lisinopril", dosage: "10mg", frequency: "Once daily" },
    { name: "Metformin", dosage: "500mg", frequency: "Twice daily" },
  ],
  allergies: [
    { allergen: "Penicillin", severity: "High", reaction: "Anaphylaxis" },
    { allergen: "Shellfish", severity: "Medium", reaction: "Skin rash" },
  ],
  emergencyContact: "Fatma Hassan - +20 102 345 6789",
  lastUpdated: "2026-03-01",
}
