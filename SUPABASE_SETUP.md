# Supabase Database Setup Guide

This guide will help you set up the Supabase database for the I-DOC application.

## Step 1: Create Supabase Tables

Go to your Supabase Dashboard → SQL Editor and run the following SQL commands:

### 1. Create Profiles Table

```sql
-- Create profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('admin', 'doctor', 'secretary')),
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Create policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

### 2. Create Patients Table

```sql
-- Create patients table
CREATE TABLE patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  phone_number TEXT NOT NULL,
  condition TEXT,
  assigned_doctor_id UUID REFERENCES profiles(id),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Create policy: Authenticated users can read patients
CREATE POLICY "Authenticated users can read patients"
  ON patients FOR SELECT
  TO authenticated
  USING (true);

-- Create policy: Secretaries and admins can insert patients
CREATE POLICY "Secretaries and admins can insert patients"
  ON patients FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'secretary')
    )
  );

-- Create policy: Secretaries and admins can update patients
CREATE POLICY "Secretaries and admins can update patients"
  ON patients FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'secretary')
    )
  );

-- Create policy: Admins can delete patients
CREATE POLICY "Admins can delete patients"
  ON patients FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

### 3. Create Schedules Table

```sql
-- Create schedules table
CREATE TABLE schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES profiles(id) NOT NULL,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Create policy: Authenticated users can read schedules
CREATE POLICY "Authenticated users can read schedules"
  ON schedules FOR SELECT
  TO authenticated
  USING (true);

-- Create policy: Secretaries and admins can insert schedules
CREATE POLICY "Secretaries and admins can insert schedules"
  ON schedules FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'secretary', 'doctor')
    )
  );

-- Create policy: Secretaries, doctors, and admins can update schedules
CREATE POLICY "Secretaries, doctors, and admins can update schedules"
  ON schedules FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'secretary', 'doctor')
    )
  );

-- Create policy: Admins and secretaries can delete schedules
CREATE POLICY "Admins and secretaries can delete schedules"
  ON schedules FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'secretary')
    )
  );
```

### 4. Create Visit Notes Table

```sql
-- Create visit_notes table
CREATE TABLE visit_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID REFERENCES schedules(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES profiles(id) NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  notes TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE visit_notes ENABLE ROW LEVEL SECURITY;

-- Create policy: Doctors and admins can read visit notes
CREATE POLICY "Doctors and admins can read visit notes"
  ON visit_notes FOR SELECT
  TO authenticated
  USING (
    auth.uid() = doctor_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create policy: Doctors can insert their own visit notes
CREATE POLICY "Doctors can insert visit notes"
  ON visit_notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = doctor_id);
```

### 5. Create Prescriptions Table

```sql
-- Create prescriptions table
CREATE TABLE prescriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visit_note_id UUID REFERENCES visit_notes(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES profiles(id) NOT NULL,
  medication TEXT NOT NULL,
  dosage TEXT NOT NULL,
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

-- Create policy: Doctors and admins can read prescriptions
CREATE POLICY "Doctors and admins can read prescriptions"
  ON prescriptions FOR SELECT
  TO authenticated
  USING (
    auth.uid() = doctor_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create policy: Doctors can insert their own prescriptions
CREATE POLICY "Doctors can insert prescriptions"
  ON prescriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = doctor_id);
```

## Step 2: Create Your First Admin User

### Option A: Using Supabase Dashboard

1. Go to **Authentication** → **Users** in your Supabase Dashboard
2. Click **Add User**
3. Enter email and password for your admin account
4. Click **Create User**
5. Copy the User ID (UUID) from the users list

### Option B: Using SQL

```sql
-- This will be done automatically when a user signs up
-- But you need to manually insert the profile
```

### Insert Admin Profile

After creating the auth user, run this SQL (replace `YOUR_USER_ID` with the actual UUID):

```sql
INSERT INTO profiles (id, role, full_name)
VALUES ('YOUR_USER_ID', 'admin', 'Admin Name');
```

## Step 3: Create Additional Users

### For Doctors and Secretaries:

1. Go to **Authentication** → **Users**
2. Click **Add User**
3. Enter email and password
4. Copy the User ID
5. Run this SQL (adjust role and name):

```sql
-- For a doctor
INSERT INTO profiles (id, role, full_name)
VALUES ('USER_ID_HERE', 'doctor', 'Dr. John Smith');

-- For a secretary
INSERT INTO profiles (id, role, full_name)
VALUES ('USER_ID_HERE', 'secretary', 'Jane Doe');
```

## Step 4: Verify Setup

1. Try logging in with your admin account
2. Navigate to the admin dashboard
3. Try creating a patient
4. Try creating a schedule

## Troubleshooting

### "Row Level Security policy violation"
- Make sure you've enabled RLS on all tables
- Verify that policies are created correctly
- Check that your user has a profile with the correct role

### "Foreign key violation"
- Ensure the profile exists before creating related records
- Check that referenced IDs are valid UUIDs

### "Authentication error"
- Verify your Supabase URL and anon key in `.env`
- Make sure the user exists in the auth.users table
- Check that the profile exists in the profiles table

## Database Schema Diagram

```
auth.users (Supabase Auth)
    ↓
profiles (id, role, full_name)
    ↓
    ├── patients (assigned_doctor_id → profiles.id)
    │       ↓
    │       ├── schedules (patient_id, doctor_id)
    │       │       ↓
    │       │       └── visit_notes (schedule_id, doctor_id, patient_id)
    │       │               ↓
    │       │               └── prescriptions (visit_note_id, doctor_id, patient_id)
    │       │
    │       └── prescriptions (patient_id, doctor_id)
    │
    └── schedules (doctor_id → profiles.id)
```

## Next Steps

After setting up the database:
1. Create your admin user
2. Log in to the application
3. Use the admin panel to create doctors and secretaries
4. Start managing patients and schedules!

## Security Notes

- All tables have Row Level Security (RLS) enabled
- Users can only access data according to their role
- Passwords are securely hashed by Supabase Auth
- API keys should never be committed to version control
