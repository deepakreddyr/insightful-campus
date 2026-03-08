import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInstitutionStore, InstitutionReport } from "@/store/institutionStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Camera, FileText, BarChart3, CheckCircle2, Upload, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const steps = [
  { label: "Campus Inspection", icon: Camera },
  { label: "Document Verification", icon: FileText },
  { label: "Student Performance", icon: BarChart3 },
  { label: "Final Report", icon: CheckCircle2 },
];

export default function AnalysisWizard() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [institutionName, setInstitutionName] = useState("");
  const [location, setLocation] = useState("");
  const [campusImages, setCampusImages] = useState<File[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [report, setReport] = useState<InstitutionReport | null>(null);

  const { addInstitution } = useInstitutionStore();
  const navigate = useNavigate();

  const runAnalysis = async (stepIdx: number) => {
    setLoading(true);
    const token = localStorage.getItem("inspectai_token");
    const authHeader = token ? { "Authorization": `Bearer ${token}` } : {};

    try {
      if (stepIdx === 0) {
        // 1. Create new analysis record
        const createRes = await fetch(`/api/analysis/new`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader
          },
          body: JSON.stringify({ name: institutionName, location, type: 'full' }),
        });

        if (!createRes.ok) throw new Error("Failed to create analysis");
        const newReport = await createRes.json();

        // 2. Upload images for AI analysis
        const formData = new FormData();
        campusImages.forEach(file => formData.append('files', file));

        const analysisRes = await fetch(`/api/analysis/${newReport.id}/campus`, {
          method: 'POST',
          headers: authHeader,
          body: formData,
        });

        if (!analysisRes.ok) throw new Error("Failed to analyze campus");
        const campusAIResult = await analysisRes.json();

        setReport({
          ...newReport,
          campusScore: campusAIResult.infrastructure_score,
          campusAnalysis: campusAIResult
        });
      } else if (stepIdx === 1 && report) {
        // Upload documents for AI verification
        const formData = new FormData();
        documents.forEach(file => formData.append('files', file));

        const response = await fetch(`/api/analysis/${report.id}/documents`, {
          method: 'POST',
          headers: authHeader,
          body: formData,
        });

        if (!response.ok) throw new Error("Failed to verify documents");
        const docAIResult = await response.json();

        setReport({
          ...report,
          complianceScore: docAIResult.authenticity_score,
          documentAnalysis: docAIResult
        });
      } else if (stepIdx === 2 && report) {
        // Finalize student performance analysis
        // For now, we'll mock the JSON parsing of the excel file or just send a dummy data 
        // until we add a real excel-to-json library on the frontend.
        const performanceData = {
          student_count: 500,
          average_marks: 75,
          top_courses: ["Computer Science", "Physics"],
          marks_distribution: "Class A: 80, Class B: 70"
        };

        const response = await fetch(`/api/analysis/${report.id}/performance`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeader
          },
          body: JSON.stringify(performanceData),
        });

        if (!response.ok) throw new Error("Failed to analyze performance");
        const perfAIResult = await response.json();

        const updatedReport = {
          ...report,
          academicScore: perfAIResult.academicScore,
          performanceAnalysis: {
            top_performing_courses: perfAIResult.top_courses,
            low_performing_courses: perfAIResult.low_courses,
            subject_performance: perfAIResult.subject_performance,
            improvement_recommendations: perfAIResult.recommendations,
            class_wise_analysis: perfAIResult.class_wise_analysis
          },
          status: "completed" as "completed" | "processing",
          overallScore: Math.round(((report.campusScore || 0) + (report.complianceScore || 0) + (perfAIResult.academicScore || 0)) / 3)
        };

        setReport(updatedReport);
        addInstitution(updatedReport);
      }
      setStep(stepIdx + 1);
    } catch (err) {
      console.error("Analysis error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (f: File[]) => void) => {
    if (e.target.files) setter(Array.from(e.target.files));
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Institution Analysis</h1>
        <p className="text-muted-foreground mt-1">Complete each step to generate a comprehensive AI inspection report</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full
                ${i === step ? "bg-primary/10 text-primary" : i < step ? "bg-success/10 text-success" : "text-muted-foreground"}`}
            >
              <s.icon className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline truncate">{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className={`h-px w-4 shrink-0 ${i < step ? "bg-success" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      <Progress value={((step + 1) / steps.length) * 100} className="h-1.5" />

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
          {step === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Upload Campus Photos</CardTitle>
                <CardDescription>
                  Upload images of the institution's infrastructure including classrooms, labs, libraries, and facilities. Our AI will analyze them for infrastructure quality, maintenance issues, and safety compliance.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Institution Name</Label>
                    <Input placeholder="e.g. Delhi Technical University" value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input placeholder="e.g. New Delhi, India" value={location} onChange={(e) => setLocation(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Campus Images</Label>
                  <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Drag & drop or click to upload</span>
                    <span className="text-xs text-muted-foreground mt-1">Supports JPG, PNG (multiple files)</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFileChange(e, setCampusImages)} />
                  </label>
                  {campusImages.length > 0 && (
                    <p className="text-sm text-muted-foreground">{campusImages.length} file(s) selected</p>
                  )}
                </div>

                <Button
                  onClick={() => runAnalysis(0)}
                  disabled={!institutionName || !location || loading}
                  className="gap-2"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  {loading ? "Analyzing Campus..." : "Analyze Campus"}
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Upload Institutional Documents</CardTitle>
                <CardDescription>
                  Upload certificates, accreditation documents, faculty qualifications, and compliance reports for AI verification.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {report?.campusAnalysis && (
                  <Card className="bg-muted/50 border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span className="text-sm font-medium">Campus Analysis Complete</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Infrastructure Score: <span className="font-semibold text-foreground">{report.campusAnalysis.infrastructure_quality_score}/100</span></p>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  <Label>Documents</Label>
                  <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Upload PDF, images, or documents</span>
                    <input type="file" accept=".pdf,image/*,.doc,.docx" multiple className="hidden" onChange={(e) => handleFileChange(e, setDocuments)} />
                  </label>
                  {documents.length > 0 && (
                    <p className="text-sm text-muted-foreground">{documents.length} file(s) selected</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(0)}>
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back
                  </Button>
                  <Button onClick={() => runAnalysis(1)} disabled={loading} className="gap-2">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                    {loading ? "Verifying..." : "Verify Documents"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Upload Student Academic Data</CardTitle>
                <CardDescription>
                  Upload an Excel sheet containing student marks and performance records for AI-powered analysis.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {report?.documentAnalysis && (
                  <Card className="bg-muted/50 border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span className="text-sm font-medium">Document Verification Complete</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Authenticity Score: <span className="font-semibold text-foreground">{report.documentAnalysis.authenticity_score}/100</span></p>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  <Label>Student Data File</Label>
                  <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">Upload .xlsx or .csv file</span>
                    <input type="file" accept=".xlsx,.csv,.xls" className="hidden" onChange={(e) => { if (e.target.files?.[0]) setExcelFile(e.target.files[0]); }} />
                  </label>
                  {excelFile && <p className="text-sm text-muted-foreground">{excelFile.name}</p>}
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back
                  </Button>
                  <Button onClick={() => runAnalysis(2)} disabled={loading} className="gap-2">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart3 className="h-4 w-4" />}
                    {loading ? "Analyzing..." : "Analyze Student Performance"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && report && (
            <div className="space-y-6">
              <Card className="gradient-hero text-primary-foreground">
                <CardContent className="p-8 text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-90" />
                  <h2 className="text-2xl font-bold mb-2">Analysis Complete</h2>
                  <p className="opacity-80 mb-6">{report.name} — {report.location}</p>
                  <div className="text-5xl font-bold">{report.overallScore}<span className="text-2xl opacity-70">/100</span></div>
                  <p className="opacity-70 mt-1">Overall Institution Score</p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Infrastructure", score: report.campusScore },
                  { label: "Compliance", score: report.complianceScore },
                  { label: "Academic", score: report.academicScore },
                ].map((s) => (
                  <Card key={s.label} className="card-hover">
                    <CardContent className="p-6 text-center">
                      <p className="text-3xl font-bold">{s.score}</p>
                      <p className="text-sm text-muted-foreground mt-1">{s.label} Score</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {report.performanceAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Subject Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={report.performanceAnalysis.subject_performance}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {report.performanceAnalysis && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader><CardTitle className="text-lg">Top Courses</CardTitle></CardHeader>
                    <CardContent>
                      {report.performanceAnalysis.top_performing_courses.map((c) => (
                        <Badge key={c} variant="outline" className="status-badge-completed mr-2 mb-2">{c}</Badge>
                      ))}
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader><CardTitle className="text-lg">Needs Improvement</CardTitle></CardHeader>
                    <CardContent>
                      {report.performanceAnalysis.low_performing_courses.map((c) => (
                        <Badge key={c} variant="outline" className="status-badge-processing mr-2 mb-2">{c}</Badge>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="flex gap-3">
                <Button onClick={() => navigate(`/reports/${report.id}`)} className="gap-2">
                  View Full Report <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => navigate("/dashboard")}>
                  Back to Dashboard
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
