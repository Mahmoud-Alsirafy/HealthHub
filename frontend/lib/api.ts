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
