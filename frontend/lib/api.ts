export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export async function loginApi(data: any) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function registerApi(data: any) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function verifyOtpApi(data: any) {
  const response = await fetch(`${API_BASE_URL}/otp/verify`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function resendOtpApi(type: string, id: string | number) {
  const response = await fetch(`${API_BASE_URL}/otp/resend/${type}/${id}`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });
  return response.json();
}

export async function getMeApi(token: string) {
  const response = await fetch(`${API_BASE_URL}/user/me`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });
  return response.json();
}

export async function logoutApi(type: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/user/logout`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ type })
  });
  return response.json();
}

export async function getProfileApi(token: string) {
  const response = await fetch(`${API_BASE_URL}/user/profile`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });
  return response.json();
}

export async function updateBasicProfileApi(token: string, data: any) {
  const response = await fetch(`${API_BASE_URL}/user/profile`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function updatePatientProfileApi(token: string, data: any) {
  const response = await fetch(`${API_BASE_URL}/user/patient-profile`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function getFilesApi(token: string, type?: string) {
  const url = type ? `${API_BASE_URL}/user/files?type=${type}` : `${API_BASE_URL}/user/files`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });
  return response.json();
}

export async function uploadFileApi(token: string, formData: FormData) {
  const response = await fetch(`${API_BASE_URL}/user/files`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: formData,
  });
  return response.json();
}

export async function deleteFileApi(token: string, id: number | string) {
  const response = await fetch(`${API_BASE_URL}/user/files/${id}`, {
    method: "DELETE",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });
  return response.json();
}

export async function deleteAccountApi(token: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/user/profile?password=${encodeURIComponent(password)}`, {
    method: "DELETE",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });
  return response.json();
}

export async function getQrApi(token: string) {
  const response = await fetch(`${API_BASE_URL}/user/qr`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });
  return response.json();
}

export async function regenerateQrApi(token: string) {
  const response = await fetch(`${API_BASE_URL}/user/qr/regenerate`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });
  return response.json();
}

export async function getAppointmentsApi(token: string) {
  const response = await fetch(`${API_BASE_URL}/user/appointments`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  return response.json();
}

// -------------------------------------------------------
// Doctor Dashboard APIs
// -------------------------------------------------------

export async function getDoctorMeApi(token: string) {
  const response = await fetch(`${API_BASE_URL}/doctor/me`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });
  return response.json();
}

export async function getDoctorPatientsApi(token: string) {
  const response = await fetch(`${API_BASE_URL}/doctor/patients`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });
  return response.json();
}

export async function getPatientDetailsApi(token: string, id: string | number) {
  const response = await fetch(`${API_BASE_URL}/doctor/patients/${id}`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });
  return response.json();
}

export async function searchPatientApi(token: string, nationalId: string) {
  const response = await fetch(`${API_BASE_URL}/doctor/patients/search`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ national_id: nationalId }),
  });
  return response.json();
}

export async function searchByQrApi(token: string, qrValue: string) {

  const code = qrValue.split('/').pop(); // استخراج الكود من الرابط

  const response = await fetch(`${API_BASE_URL}/doctor/patients/qr/${code}`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });

  return response.json();
}

export async function storeReportApi(token: string, data: any) {
  const response = await fetch(`${API_BASE_URL}/doctor/reports`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function getDoctorQrApi(token: string) {
  const response = await fetch(`${API_BASE_URL}/doctor/qr`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  return response.json();
}

export async function regenerateDoctorQrApi(token: string) {
  const response = await fetch(`${API_BASE_URL}/doctor/qr/regenerate`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  return response.json();
}

export const verifyPatientAccessApi = async (token: string, data: { patient_id: number, otp: string }) => {
  const res = await fetch(`${API_BASE_URL}/doctor/patients/verify-access`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return res.json();
};

// ✅ أضف دي في api.ts
export async function analyzeMedicalImageApi(token: string, data: { folder: string; model_id: number; filename: string }) {
  const response = await fetch(`${API_BASE_URL}/user/medical-image/analyze`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  return response.json()
}

// -------------------------------------------------------
// Pharma Dashboard APIs
// -------------------------------------------------------

export async function getPharmaMeApi(token: string) {
  const response = await fetch(`${API_BASE_URL}/pharma/me`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });
  return response.json();
}

export async function getPharmaStatsApi(token: string) {
  const response = await fetch(`${API_BASE_URL}/pharma/stats`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });
  return response.json();
}

export async function searchPharmaPatientApi(token: string, search: string) {
  const response = await fetch(`${API_BASE_URL}/pharma/patients/search`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ search }),
  });
  return response.json();
}

export async function verifyPharmaAccessApi(token: string, data: { patient_id: number, otp: string }) {
  const response = await fetch(`${API_BASE_URL}/pharma/patients/verify`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function dispensePrescriptionApi(token: string, prescriptionId: number) {
  const response = await fetch(`${API_BASE_URL}/pharma/prescriptions/${prescriptionId}/dispense`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });
  return response.json();
}

export async function cancelPrescriptionApi(token: string, prescriptionId: number) {
  const response = await fetch(`${API_BASE_URL}/pharma/prescriptions/${prescriptionId}/cancel`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });
  return response.json();
}

export async function getPharmaQrApi(token: string) {
  const response = await fetch(`${API_BASE_URL}/pharma/qr`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  return response.json();
}

export async function regeneratePharmaQrApi(token: string) {
  const response = await fetch(`${API_BASE_URL}/pharma/qr/regenerate`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  });
  return response.json();
}

// -------------------------------------------------------
// Lab Dashboard APIs
// -------------------------------------------------------

export async function getLabMeApi(token: string) {
  const response = await fetch(`${API_BASE_URL}/lab/me`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });
  return response.json();
}

export async function searchLabPatientApi(token: string, search: string) {
  const response = await fetch(`${API_BASE_URL}/lab/patients/search`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ search }),
  });
  return response.json();
}

export async function verifyLabAccessApi(token: string, data: { patient_id: number, otp: string }) {
  const response = await fetch(`${API_BASE_URL}/lab/patients/verify-access`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function completeLabReportApi(token: string, reportId: number, formData: FormData) {
  const response = await fetch(`${API_BASE_URL}/lab/reports/${reportId}/complete`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: formData,
  });
  return response.json();
}

export async function getLabQrApi(token: string) {
  const response = await fetch(`${API_BASE_URL}/lab/qr`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });
  return response.json();
}

export async function regenerateLabQrApi(token: string) {
  const response = await fetch(`${API_BASE_URL}/lab/qr/regenerate`, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`
    },
  });
  return response.json();
}