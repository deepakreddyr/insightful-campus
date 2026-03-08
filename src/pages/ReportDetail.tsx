import { useParams, useNavigate } from "react-router-dom";
import { useInstitutionStore } from "@/store/institutionStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Building2, FileCheck, GraduationCap, Lightbulb, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from "recharts";
import { motion } from "framer-motion";

import { useEffect, useState } from "react";

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getInstitution, fetchInstitution } = useInstitutionStore();
  const [loading, setLoading] = useState(false);

  const inst = getInstitution(id || "");

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchInstitution(id).finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading report...
      </div>
    );
  }

  if (!inst) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Report not found or loading...</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
      </div>
    );
  }

  const cam = inst.campusAnalysis;
  const doc = inst.documentAnalysis;
  const perf = inst.performanceAnalysis;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{inst.name}</h1>
            <p className="text-muted-foreground">{inst.location} · Analyzed {inst.dateAnalyzed}</p>
          </div>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Download Report
        </Button>
      </div>

      {/* Overall Score */}
      {(inst.overallScore || inst.campusScore || inst.complianceScore) && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="gradient-hero text-primary-foreground">
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                <div className="text-center">
                  <p className="text-6xl font-bold">{inst.overallScore}</p>
                  <p className="opacity-70 mt-1">Overall Score</p>
                </div>
                <div className="flex-1 grid grid-cols-3 gap-6">
                  {[
                    { label: "Infrastructure", score: inst.campusScore },
                    { label: "Compliance", score: inst.complianceScore },
                    { label: "Academic", score: inst.academicScore },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <p className="text-3xl font-bold">{s.score ?? "—"}</p>
                      <p className="text-sm opacity-70">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Campus Inspection */}
      {cam && (
        <Card>
          <CardHeader className="flex-row items-center gap-3">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle>Campus Infrastructure Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-warning" /> Maintenance Issues
                </h4>
                <ul className="space-y-1.5">
                  {(cam.maintenance_issues ?? []).map((m, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-warning shrink-0" />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-destructive" /> Safety Hazards
                </h4>
                <ul className="space-y-1.5">
                  {(cam.safety_hazards ?? []).map((h, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-success" /> Compliance
              </h4>
              <div className="flex flex-wrap gap-2">
                {(cam.compliance_flags ?? []).map((f, i) => (
                  <Badge key={i} variant="outline" className="status-badge-completed">{f}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document Analysis */}
      {doc && (
        <Card>
          <CardHeader className="flex-row items-center gap-3">
            <FileCheck className="h-5 w-5 text-primary" />
            <CardTitle>Document Authenticity Verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4 mb-2">
              <div className="text-2xl font-bold">{doc.authenticity_score}/100</div>
              <Badge variant="outline" className="status-badge-completed">{doc.accreditation_validation}</Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium mb-2">Detected Issues</h4>
                <ul className="space-y-1.5">
                  {(doc.detected_issues ?? []).map((d, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-warning shrink-0" />{d}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Missing Documents</h4>
                <ul className="space-y-1.5">
                  {(doc.missing_documents ?? []).map((d, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />{d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student Performance */}
      {perf && (
        <>
          <Card>
            <CardHeader className="flex-row items-center gap-3">
              <GraduationCap className="h-5 w-5 text-primary" />
              <CardTitle>Student Performance Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={perf.subject_performance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="h-48">
                <h4 className="text-sm font-medium mb-3">Class-wise Average Performance</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={perf.class_wise_analysis}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="class" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="average" stroke="hsl(var(--success))" strokeWidth={2} dot={{ fill: "hsl(var(--success))" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Top Performing Courses</h4>
                  <div className="flex flex-wrap gap-2">
                    {(perf.top_performing_courses ?? []).map((c) => (
                      <Badge key={c} variant="outline" className="status-badge-completed">{c}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">Courses Needing Improvement</h4>
                  <div className="flex flex-wrap gap-2">
                    {(perf.low_performing_courses ?? []).map((c) => (
                      <Badge key={c} variant="outline" className="status-badge-processing">{c}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <Card>
            <CardHeader className="flex-row items-center gap-3">
              <Lightbulb className="h-5 w-5 text-warning" />
              <CardTitle>AI Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {(perf.improvement_recommendations ?? []).map((r, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium shrink-0">{i + 1}</span>
                    {r}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
