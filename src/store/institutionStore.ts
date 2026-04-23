import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface InstitutionReport {
  id: string;
  name: string;
  location: string;
  dateAnalyzed?: string;
  date_analyzed?: string;
  status: "completed" | "processing";
  campusScore?: number;
  complianceScore?: number;
  academicScore?: number;
  overallScore?: number;
  campusAnalysis?: {
    infrastructure_quality_score?: number;
    infrastructure_score?: number;
    maintenance_issues: string[];
    safety_hazards: string[];
    compliance_flags: string[];
  };
  documentAnalysis?: {
    authenticity_score: number;
    date_of_issue?: string;
    signature_available?: boolean;
    detected_issues: string[];
    missing_documents: string[];
    accreditation_validation: string;
  };
  performanceAnalysis?: {
    top_performing_courses: string[];
    low_performing_courses: string[];
    subject_performance: { subject: string; score: number }[];
    department_performance: { department: string; average: number }[];
    key_metrics?: { label: string; value: any; unit?: string }[];
    extra_insights?: string[];
    improvement_recommendations: string[];
    class_wise_analysis: { class: string; average: number }[];
  };
}

interface InstitutionStore {
  institutions: InstitutionReport[];
  fetchInstitutions: () => Promise<void>;
  fetchInstitution: (id: string) => Promise<InstitutionReport | null>;
  addInstitution: (inst: InstitutionReport) => void;
  updateInstitution: (id: string, data: Partial<InstitutionReport>) => void;
  getInstitution: (id: string) => InstitutionReport | undefined;
}

const API_URL = import.meta.env.VITE_API_URL;

function mapReport(raw: any): InstitutionReport {
  return {
    ...raw,
    // Normalize top-level scores and dates
    dateAnalyzed: raw.dateAnalyzed || raw.date_analyzed,
    overallScore: raw.overallScore ?? raw.overall_score,
    campusScore: raw.campusScore ?? raw.campus_score,
    complianceScore: raw.complianceScore ?? raw.compliance_score,
    academicScore: raw.academicScore ?? raw.academic_score,
    
    // Normalize nested campus analysis
    campusAnalysis: raw.campusAnalysis
      ? {
        ...raw.campusAnalysis,
        infrastructure_quality_score:
          raw.campusAnalysis.infrastructure_quality_score ??
          raw.campusAnalysis.infrastructure_score,
        maintenance_issues: raw.campusAnalysis.maintenance_issues || [],
        safety_hazards: raw.campusAnalysis.safety_hazards || [],
        compliance_flags: raw.campusAnalysis.compliance_flags || [],
      }
      : undefined,
    
    // Normalize nested document analysis
    documentAnalysis: raw.documentAnalysis
      ? {
        ...raw.documentAnalysis,
        authenticity_score: raw.documentAnalysis.authenticity_score,
        date_of_issue: raw.documentAnalysis.date_of_issue,
        signature_available: raw.documentAnalysis.signature_available,
        detected_issues: raw.documentAnalysis.detected_issues || [],
        missing_documents: raw.documentAnalysis.missing_documents || [],
        accreditation_validation: raw.documentAnalysis.accreditation_validation,
      }
      : undefined,
      
    // Normalize nested performance analysis
    performanceAnalysis: raw.performanceAnalysis
      ? {
        ...raw.performanceAnalysis,
        top_performing_courses: raw.performanceAnalysis.top_performing_courses || raw.performanceAnalysis.top_courses || [],
        low_performing_courses: raw.performanceAnalysis.low_performing_courses || raw.performanceAnalysis.low_courses || [],
        subject_performance: raw.performanceAnalysis.subject_performance || [],
        department_performance: raw.performanceAnalysis.department_performance || [],
        improvement_recommendations: raw.performanceAnalysis.improvement_recommendations || raw.performanceAnalysis.recommendations || [],
        class_wise_analysis: raw.performanceAnalysis.class_wise_analysis || [],
      }
      : undefined,
  };
}

export const useInstitutionStore = create<InstitutionStore>()(
  persist(
    (set, get) => ({
      institutions: [],
      fetchInstitutions: async () => {
        try {
          const token = localStorage.getItem("inspectai_token");
          const response = await fetch(`${API_URL}/institutions`, {
            headers: token ? { "Authorization": `Bearer ${token}` } : {},
          });
          if (!response.ok) throw new Error("Failed to fetch institutions");
          const data = await response.json();
          set({ institutions: data.map(mapReport) });
        } catch (err) {
          console.error("Fetch institutions error:", err);
        }
      },
      fetchInstitution: async (id: string) => {
        try {
          const token = localStorage.getItem("inspectai_token");
          const response = await fetch(`${API_URL}/institutions/${id}`, {
            headers: token ? { "Authorization": `Bearer ${token}` } : {},
          });
          if (!response.ok) throw new Error("Failed to fetch institution");
          const raw = await response.json();
          const mapped = mapReport(raw);
          // Upsert into store
          set((s) => {
            const exists = s.institutions.find((i) => i.id === id);
            return {
              institutions: exists
                ? s.institutions.map((i) => (i.id === id ? mapped : i))
                : [mapped, ...s.institutions],
            };
          });
          return mapped;
        } catch (err) {
          console.error("Fetch institution error:", err);
          return null;
        }
      },
      addInstitution: (inst) => set((s) => ({ institutions: [inst, ...s.institutions] })),
      updateInstitution: (id, data) =>
        set((s) => ({
          institutions: s.institutions.map((i) => (i.id === id ? { ...i, ...data } : i)),
        })),
      getInstitution: (id) => get().institutions.find((i) => i.id === id),
    }),
    { name: "inspectai-institutions" }
  )
);
