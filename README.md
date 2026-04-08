# 🏥 HealthHub

A full-stack healthcare management platform built with **Laravel 12** (Backend API) and **Next.js 16** (Frontend). The system supports multiple user roles including Patients, Doctors, Labs, Pharmacies, Paramedics, and Admins.

---

## 📁 Project Structure

```
HealthHub/
├── backend/     # Laravel 12 REST API
└── frontend/    # Next.js 16 React App
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| PHP | ^8.2 |
| Composer | latest |
| Node.js | ^18 |
| npm | latest |
| SQLite | (default) or MySQL/PostgreSQL |

---

## ⚙️ Backend Setup (Laravel)

```bash
cd backend
```

### 1. Install Dependencies

```bash
composer install
```

### 2. Environment Configuration

```bash
cp .env.example .env
php artisan key:generate
```

Then open `.env` and configure:

```env
APP_NAME=HealthHub
APP_URL=http://localhost:8000

# Database (SQLite by default)
DB_CONNECTION=sqlite
# For MySQL, uncomment and fill:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=healthhub
# DB_USERNAME=root
# DB_PASSWORD=

# Queue
QUEUE_CONNECTION=database

# JWT Auth
JWT_SECRET=   # Will be generated below

# Twilio OTP (optional)
TWILIO_SID=
TWILIO_AUTH_TOKEN=
TWILIO_FROM=

# Google OAuth (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=
```

### 3. Generate JWT Secret

```bash
php artisan jwt:secret
```

### 4. Run Migrations

```bash
php artisan migrate
```

### 5. (Optional) Seed the Database

```bash
php artisan db:seed
```

### 6. Start the Backend Server

```bash
php artisan serve
```

The API will be available at: **`http://localhost:8000`**

### 7. Start the Queue Worker (for OTP & background jobs)

```bash
php artisan queue:work
```

---

## 💻 Frontend Setup (Next.js)

```bash
cd frontend
```

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Start the Development Server

```bash
npm run dev
```

The frontend will be available at: **`http://localhost:3000`**

---

## 🔌 Backend API Reference

> **Base URL:** `http://localhost:8000/api`
>
> Protected routes require a `Bearer` token in the `Authorization` header.
> Role-based guards: `auth:api` (patient), `auth:doctor`, `auth:lab`, `auth:pharma`, `auth:paramedic`, `auth:admin`

---

### 🔓 Auth Routes — Public (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | Login for all user types |
| `POST` | `/api/auth/register` | Register a new patient account |

---

### 📱 OTP Routes — Public

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/otp/{type}/{id}` | Get OTP for a user by type and ID |
| `POST` | `/api/otp/verify` | Verify an OTP code |
| `GET` | `/api/otp/resend/{type}/{id}` | Resend OTP to user |

---

### 👤 Patient Routes — Protected (`auth:api`) — Prefix: `/api/user`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/user/logout` | Logout current user |
| `GET` | `/api/user/me` | Get current user info |
| `GET` | `/api/user/profile` | Get user profile |
| `POST` | `/api/user/profile` | Update user profile |
| `DELETE` | `/api/user/profile` | Delete user account |
| `POST` | `/api/user/patient-profile` | Update patient-specific profile data |
| `GET` | `/api/user/appointments` | Get user appointments |
| `GET` | `/api/user/prescriptions` | Get user prescriptions |
| `GET` | `/api/user/files` | Get user medical files |
| `POST` | `/api/user/files` | Upload a medical file |
| `DELETE` | `/api/user/files/{id}` | Delete a medical file by ID |
| `POST` | `/api/user/medical-image/analyze` | Analyze a medical image using AI |
| `GET` | `/api/user/qr` | Get patient QR code |
| `POST` | `/api/user/qr/regenerate` | Regenerate patient QR code |

---

### 👨‍⚕️ Doctor Routes — Protected (`auth:doctor`) — Prefix: `/api/doctor`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/doctor/logout` | Logout doctor |
| `GET` | `/api/doctor/me` | Get current doctor info |
| `GET` | `/api/doctor/patients` | List doctor's patients |
| `GET` | `/api/doctor/patients/{id}` | Get a specific patient by ID |
| `POST` | `/api/doctor/patients/search` | Search patient by national ID |
| `POST` | `/api/doctor/patients/verify-access` | Verify access to a patient via QR |
| `GET` | `/api/doctor/patients/qr/{code}` | Search patient by QR code |
| `POST` | `/api/doctor/reports` | Create a medical report / prescription |
| `GET` | `/api/doctor/qr` | Get doctor's QR code |
| `POST` | `/api/doctor/qr/regenerate` | Regenerate doctor QR code |

---

### 🧪 Lab Routes — Protected (`auth:lab`) — Prefix: `/api/lab`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/lab/logout` | Logout lab user |
| `GET` | `/api/lab/me` | Get current lab info |
| `POST` | `/api/lab/patients/search` | Search a patient |
| `POST` | `/api/lab/patients/verify-access` | Verify access to a patient via QR |
| `POST` | `/api/lab/reports/{reportId}/complete` | Mark a lab report as complete |
| `GET` | `/api/lab/qr` | Get lab QR code |
| `POST` | `/api/lab/qr/regenerate` | Regenerate lab QR code |

---

### 💊 Pharmacy Routes — Protected (`auth:pharma`) — Prefix: `/api/pharma`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/pharma/logout` | Logout pharmacy user |
| `GET` | `/api/pharma/me` | Get current pharmacy info |
| `GET` | `/api/pharma/stats` | Get pharmacy statistics |
| `POST` | `/api/pharma/patients/search` | Search a patient |
| `POST` | `/api/pharma/patients/verify` | Verify access to a patient |
| `POST` | `/api/pharma/prescriptions/{id}/dispense` | Dispense a prescription |
| `POST` | `/api/pharma/prescriptions/{id}/cancel` | Cancel a prescription |
| `GET` | `/api/pharma/qr` | Get pharmacy QR code |
| `POST` | `/api/pharma/qr/regenerate` | Regenerate pharmacy QR code |

---

### 🚑 Paramedic Routes — Protected (`auth:paramedic`) — Prefix: `/api/paramedic`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/paramedic/logout` | Logout paramedic |
| `GET` | `/api/paramedic/me` | Get current paramedic info |
| `POST` | `/api/paramedic/patients/search` | Search a patient |
| `GET` | `/api/paramedic/qr` | Get paramedic QR code |
| `POST` | `/api/paramedic/qr/regenerate` | Regenerate paramedic QR code |

---

### 🔐 QR Login Routes — Public

These endpoints allow login via scanned QR codes:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/qr/login/{code}` | Login as Patient via QR |
| `GET` | `/api/qr/doctor/login/{code}` | Login as Doctor via QR |
| `GET` | `/api/qr/admin/login/{code}` | Login as Admin via QR |
| `GET` | `/api/qr/lab/login/{code}` | Login as Lab via QR |
| `GET` | `/api/qr/paramedic/login/{code}` | Login as Paramedic via QR |
| `GET` | `/api/qr/pharma/login/{code}` | Login as Pharmacy via QR |

---

### 🛡️ Admin Routes — Protected (`auth:admin`) — Prefix: `/api/admin`

> Admin routes are further restricted by `admin.type` middleware.

#### QR

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/qr` | Get admin QR code |
| `POST` | `/api/admin/qr/regenerate` | Regenerate admin QR code |

#### Doctors Management (`admin.type:doctor`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/doctors` | List all doctors |
| `GET` | `/api/admin/doctors/{id}` | Get doctor by ID |
| `POST` | `/api/admin/doctors` | Create a new doctor |
| `POST` | `/api/admin/doctors/{id}` | Update a doctor |
| `DELETE` | `/api/admin/doctors/{id}` | Delete a doctor |

#### Labs Management (`admin.type:lab`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/labs` | List all labs |
| `GET` | `/api/admin/labs/{id}` | Get lab by ID |
| `POST` | `/api/admin/labs` | Create a new lab |
| `POST` | `/api/admin/labs/{id}` | Update a lab |
| `DELETE` | `/api/admin/labs/{id}` | Delete a lab |

#### Pharmacies Management (`admin.type:pharma`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/pharmas` | List all pharmacies |
| `GET` | `/api/admin/pharmas/{id}` | Get pharmacy by ID |
| `POST` | `/api/admin/pharmas` | Create a new pharmacy |
| `POST` | `/api/admin/pharmas/{id}` | Update a pharmacy |
| `DELETE` | `/api/admin/pharmas/{id}` | Delete a pharmacy |

#### Paramedics Management (`admin.type:paramedic`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/paramedics` | List all paramedics |
| `GET` | `/api/admin/paramedics/{id}` | Get paramedic by ID |
| `POST` | `/api/admin/paramedics` | Create a new paramedic |
| `POST` | `/api/admin/paramedics/{id}` | Update a paramedic |
| `DELETE` | `/api/admin/paramedics/{id}` | Delete a paramedic |

---

### 🌐 Web Routes (Google OAuth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/{lang}/auth/google` | Redirect to Google OAuth |
| `GET` | `/{lang}/auth/google/callback` | Handle Google OAuth callback |
| `GET` | `/{lang}/auth/google/check` | Check Google OAuth status |

---

## 🔑 Authentication

The API uses **JWT (JSON Web Tokens)** via `php-open-source-saver/jwt-auth`.

Include the token in every protected request:

```http
Authorization: Bearer <your_jwt_token>
```

Tokens are returned in the response body on successful login.

---

## 🛠️ Tech Stack

### Backend
- **Framework:** Laravel 12
- **Auth:** JWT (`php-open-source-saver/jwt-auth`) + Laravel Sanctum
- **QR Code:** `endroid/qr-code`, `simplesoftwareio/simple-qrcode`
- **OTP:** Twilio SDK
- **Social Auth:** Laravel Socialite (Google)
- **Localization:** `mcamara/laravel-localization`
- **PDF:** `spatie/pdf-to-text`
- **Database:** SQLite (default) / MySQL

### Frontend
- **Framework:** Next.js 16 + React 19
- **Language:** TypeScript
- **UI Components:** Radix UI + shadcn/ui
- **Styling:** Tailwind CSS v4
- **Forms:** React Hook Form + Zod
- **Charts:** Recharts
- **QR Scanner:** html5-qrcode

---

## 📝 Notes

- Run `php artisan queue:work` in a separate terminal — it handles OTP delivery and background jobs.
- The frontend expects the backend to be running on `http://localhost:8000`.
- Localized routes use a language prefix (e.g., `/en/`, `/ar/`).
- All API responses are in JSON format.
