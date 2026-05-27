-- Create handle_updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- 1. PROFILES Table (Extends auth.users)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('physician', 'pharmacist', 'nurse', 'billing', 'care_coordinator', 'bed_manager')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Allow public read-access on profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow users to update their own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Trigger to update updated_at on profiles
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- 2. PATIENTS Table
CREATE TABLE public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  age integer NOT NULL,
  gender text NOT NULL,
  ward text NOT NULL,
  bed text NOT NULL,
  admission_diagnosis text NOT NULL,
  status text NOT NULL DEFAULT 'admitted' CHECK (status IN ('admitted', 'discharge_in_progress', 'discharged')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on patients
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Patients Policies
CREATE POLICY "Allow authenticated read-access on patients" ON public.patients
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated write-access on patients" ON public.patients
  FOR ALL TO authenticated USING (true);

-- Trigger to update updated_at on patients
CREATE TRIGGER trigger_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- 3. DISCHARGES Table
CREATE TABLE public.discharges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  physician_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  edt timestamptz,
  transport_mode text,
  disposition text,
  status text NOT NULL DEFAULT 'initiated' CHECK (status IN ('initiated', 'signed', 'cleared', 'completed')),
  clinical_readiness jsonb DEFAULT '{}'::jsonb NOT NULL,
  summary_draft jsonb DEFAULT '{}'::jsonb NOT NULL,
  signed_at timestamptz,
  signed_by uuid REFERENCES public.profiles(id) ON DELETE RESTRICT,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on discharges
ALTER TABLE public.discharges ENABLE ROW LEVEL SECURITY;

-- Discharges Policies
CREATE POLICY "Allow authenticated read-access on discharges" ON public.discharges
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated write-access on discharges" ON public.discharges
  FOR ALL TO authenticated USING (true);

-- Trigger to update updated_at on discharges
CREATE TRIGGER trigger_discharges_updated_at
  BEFORE UPDATE ON public.discharges
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- 4. DEPARTMENT_TASKS Table
CREATE TABLE public.department_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discharge_id uuid NOT NULL REFERENCES public.discharges(id) ON DELETE CASCADE,
  department text NOT NULL CHECK (department IN ('pharmacy', 'nursing', 'billing', 'care_coordination', 'bed_management')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  task_data jsonb DEFAULT '{}'::jsonb NOT NULL,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on department_tasks
ALTER TABLE public.department_tasks ENABLE ROW LEVEL SECURITY;

-- Department Tasks Policies
CREATE POLICY "Allow authenticated read-access on department_tasks" ON public.department_tasks
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated write-access on department_tasks" ON public.department_tasks
  FOR ALL TO authenticated USING (true);

-- Trigger to update updated_at on department_tasks
CREATE TRIGGER trigger_department_tasks_updated_at
  BEFORE UPDATE ON public.department_tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- 5. AUDIT_LOGS Table
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text NOT NULL,
  old_value jsonb DEFAULT '{}'::jsonb NOT NULL,
  new_value jsonb DEFAULT '{}'::jsonb NOT NULL,
  ip_address text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Audit Logs Policies (Read only for authenticated, insert only for system/users)
CREATE POLICY "Allow authenticated read-access on audit_logs" ON public.audit_logs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow insertion of audit logs" ON public.audit_logs
  FOR INSERT TO authenticated WITH CHECK (true);


-- 6. Trigger to sync auth.users with public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'System User'),
    COALESCE(new.raw_user_meta_data->>'role', 'physician')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 7. Seed initial Patients list
INSERT INTO public.patients (name, age, gender, ward, bed, admission_diagnosis, status)
VALUES 
  ('Rajesh Kumar', 58, 'M', 'Ward 4B', 'Bed 12', 'Type 2 Diabetes Mellitus + STEMI (Treated)', 'admitted'),
  ('Sunita Sharma', 45, 'F', 'Ward 2A', 'Bed 05', 'Acute Cholecystitis (Post-Cholecystectomy)', 'admitted'),
  ('Anil Deshmukh', 67, 'M', 'ICU 1', 'Bed 03', 'Chronic Heart Failure Exacerbation', 'admitted'),
  ('Meera Nair', 32, 'F', 'Ward 4B', 'Bed 15', 'Severe Pre-eclampsia (Post-Delivery)', 'admitted');
