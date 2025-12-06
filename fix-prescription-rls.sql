-- Fix RLS policies for prescriptions table
-- This allows doctors to delete their own prescriptions

-- Drop existing policies
DROP POLICY IF EXISTS "Doctors can delete own prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Doctors can insert prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Doctors can update own prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Doctors can view own prescriptions" ON prescriptions;

-- Enable RLS
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

-- Doctors can view their own prescriptions
CREATE POLICY "Doctors can view own prescriptions"
  ON prescriptions FOR SELECT
  TO authenticated
  USING (
    doctor_id = auth.uid()
  );

-- Doctors can insert prescriptions
CREATE POLICY "Doctors can insert prescriptions"
  ON prescriptions FOR INSERT
  TO authenticated
  WITH CHECK (
    doctor_id = auth.uid()
  );

-- Doctors can update their own prescriptions
CREATE POLICY "Doctors can update own prescriptions"
  ON prescriptions FOR UPDATE
  TO authenticated
  USING (
    doctor_id = auth.uid()
  );

-- Doctors can delete their own prescriptions
CREATE POLICY "Doctors can delete own prescriptions"
  ON prescriptions FOR DELETE
  TO authenticated
  USING (
    doctor_id = auth.uid()
  );
