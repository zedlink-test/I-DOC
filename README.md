# I-DOC - Doctor Office Management System

A modern, full-stack web application for managing doctor office operations with role-based access control.

## Features

### 🔐 Role-Based Access Control
- **Admin**: Manage users, patients, and schedules
- **Secretary**: Manage patients and appointments
- **Doctor**: View attributed patients and manage their care

### 👥 Patient Management
- Add, edit, and delete patients
- Automatic age calculation from date of birth
- Assign patients to specific doctors
- Track patient conditions and contact information

### 📅 Schedule Management
- Create and manage appointments
- Assign appointments to doctors and patients
- Track appointment status (scheduled, completed, cancelled)
- View upcoming appointments

### 🌍 Internationalization
- Full support for English and French
- Easy language switching
- All UI elements translated

### 🎨 Modern UI/UX
- Medical-themed color palette
- Responsive design for all devices
- Smooth animations and transitions
- Premium, professional aesthetic

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **Routing**: React Router v6
- **Internationalization**: i18next
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)

### Installation

1. Clone the repository:
```bash
cd I-DOC
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials (already configured)

4. Set up Supabase database:
   - See `SUPABASE_SETUP.md` for detailed instructions
   - Create the required tables and policies

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:5173](http://localhost:5173) in your browser

## Database Setup

Please refer to `SUPABASE_SETUP.md` for complete instructions on:
- Creating database tables
- Setting up Row Level Security policies
- Creating your first admin user

## Project Structure

```
I-DOC/
├── src/
│   ├── components/
│   │   ├── common/          # Reusable UI components
│   │   ├── features/        # Feature-specific components
│   │   └── layout/          # Layout components
│   ├── contexts/            # React contexts (Auth, Language)
│   ├── lib/                 # Utilities (Supabase, i18n)
│   ├── pages/               # Page components
│   │   ├── admin/           # Admin pages
│   │   ├── auth/            # Authentication pages
│   │   ├── doctor/          # Doctor pages
│   │   └── secretary/       # Secretary pages
│   ├── App.jsx              # Main app component
│   └── main.jsx             # Entry point
├── .env                     # Environment variables
└── tailwind.config.js       # Tailwind configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## User Roles

### Admin
- Full system access
- Manage doctors and secretaries
- Manage all patients and schedules
- View system statistics

### Secretary
- Manage patients (add, edit, delete)
- Manage schedules for all doctors
- Assign patients to doctors
- View dashboard statistics

### Doctor
- View attributed patients only
- Manage schedules for their patients
- Add visit notes (coming soon)
- Create prescriptions (coming soon)

## License

MIT

## Support

For issues or questions, please create an issue in the repository.
