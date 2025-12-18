-- I-DOC Database Migration
-- Run this in your Supabase SQL Editor to add new columns for payment tracking and enhanced prescriptions

-- ================================================================
-- 1. ADD PAYMENT TRACKING TO PATIENTS TABLE
-- ================================================================

-- Add payment columns to patients table
ALTER TABLE patients
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS paid_amount DECIMAL(10,2) DEFAULT 0;

-- ================================================================
-- 2. ENHANCE PRESCRIPTIONS TABLE FOR MEDICATIONS AND LAB TESTS
-- ================================================================

-- Add structured data columns to prescriptions table
ALTER TABLE prescriptions
ADD COLUMN IF NOT EXISTS medications JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS blood_tests JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS urine_tests JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS prescription_type TEXT DEFAULT 'medication';

-- Add check constraint for prescription_type (only if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'prescriptions_prescription_type_check'
    ) THEN
        ALTER TABLE prescriptions
        ADD CONSTRAINT prescriptions_prescription_type_check
        CHECK (prescription_type IN ('medication', 'lab_test'));
    END IF;
END $$;

-- ================================================================
-- 3. VERIFY CHANGES
-- ================================================================

-- You can run this to verify the columns were added:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'patients';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'prescriptions';

-- ================================================================
-- DONE! Your database is now ready for the new features.
-- ================================================================

-- ================================================================
-- 4. FIX VISIT_NOTES RLS POLICIES
-- ================================================================

-- Enable RLS
ALTER TABLE visit_notes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to be safe
DROP POLICY IF EXISTS "visit_notes_select_policy" ON visit_notes;
DROP POLICY IF EXISTS "visit_notes_insert_policy" ON visit_notes;
DROP POLICY IF EXISTS "visit_notes_update_policy" ON visit_notes;
DROP POLICY IF EXISTS "visit_notes_delete_policy" ON visit_notes;

-- 1. SELECT Policy (View)
-- Doctors see own notes, Admins and Secretaries see all
CREATE POLICY "visit_notes_select_policy"
ON visit_notes FOR SELECT
USING (
    auth.uid() = doctor_id OR
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'secretary')
    )
);

-- 2. INSERT Policy (Create)
-- Doctors and Admins can create
CREATE POLICY "visit_notes_insert_policy"
ON visit_notes FOR INSERT
WITH CHECK (
    (auth.uid() = doctor_id AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'doctor')) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 3. UPDATE/DELETE Policy (Modify)
-- Doctors manage own, Admins manage all
CREATE POLICY "visit_notes_update_policy"
ON visit_notes FOR UPDATE
USING (
    (auth.uid() = doctor_id) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "visit_notes_delete_policy"
ON visit_notes FOR DELETE
USING (
    (auth.uid() = doctor_id) OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
