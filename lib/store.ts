import { create } from 'zustand'

export type ClinicalRole = 'physician' | 'pharmacist' | 'nurse' | 'billing' | 'care_coordinator' | 'bed_manager';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: ClinicalRole;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  ward: string;
  bed: string;
  admission_diagnosis: string;
  status: 'admitted' | 'discharge_in_progress' | 'discharged';
}

export interface DischargeCase {
  id: string;
  patient_id: string;
  physician_id: string;
  edt: string | null;
  transport_mode: string | null;
  disposition: string | null;
  status: 'initiated' | 'signed' | 'cleared' | 'completed';
  clinical_readiness: {
    hemodynamicStable?: boolean;
    primaryDiagnosisControlled?: boolean;
    toleratingOral?: boolean;
    safeEnvironment?: boolean;
    noteCompleted?: boolean;
  };
  summary_draft: {
    chiefComplaint?: string;
    hospitalCourse?: string;
    investigations?: string;
    procedures?: string;
    medications?: Array<{ name: string; dosage: string; frequency: string; duration: string; type: 'admission' | 'discharge' | 'modified' }>;
    followUp?: string;
    condition?: string;
  };
  signed_at: string | null;
  signed_by: string | null;
}

export interface DepartmentTask {
  id: string;
  discharge_id: string;
  department: 'pharmacy' | 'nursing' | 'billing' | 'care_coordination' | 'bed_management';
  status: 'pending' | 'in_progress' | 'completed';
  task_data: any;
  completed_at: string | null;
}

interface AppState {
  // Auth state
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  
  // Dashboard & Workflow state
  activePatientId: string | null;
  setActivePatientId: (id: string | null) => void;
  
  // Active cases cached locally (representing mock state when database is disconnected or for client-side fluidity)
  patients: Patient[];
  discharges: Record<string, DischargeCase>;
  tasks: Record<string, DepartmentTask[]>; // discharge_id -> tasks
  
  setPatients: (patients: Patient[]) => void;
  updatePatientStatus: (patientId: string, status: Patient['status']) => void;
  upsertDischarge: (discharge: DischargeCase) => void;
  updateTaskStatus: (dischargeId: string, department: DepartmentTask['department'], status: DepartmentTask['status'], taskData?: any) => void;
}

/**
 * Zustand global client-side state store for Qdischarge.
 * Coordinates patients, active discharges, multi-department tasks, and logged-in user profile.
 */
export const useAppStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  
  activePatientId: null,
  setActivePatientId: (activePatientId) => set({ activePatientId }),
  
  patients: [],
  discharges: {},
  tasks: {},
  
  setPatients: (patients) => set({ patients }),
  
  updatePatientStatus: (patientId, status) => set((state) => ({
    patients: state.patients.map((p) => p.id === patientId ? { ...p, status } : p)
  })),
  
  upsertDischarge: (discharge) => set((state) => ({
    discharges: { ...state.discharges, [discharge.patient_id]: discharge }
  })),
  
  updateTaskStatus: (dischargeId, department, status, taskData = {}) => set((state) => {
    const list = state.tasks[dischargeId] || [];
    const updated = list.map((t) => 
      t.department === department 
        ? { 
            ...t, 
            status, 
            task_data: { ...t.task_data, ...taskData },
            completed_at: status === 'completed' ? new Date().toISOString() : null 
          } 
        : t
    );
    return {
      tasks: { ...state.tasks, [dischargeId]: updated }
    };
  })
}));
