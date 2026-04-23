import { useParams, useNavigate } from "react-router-dom";
import { useInstitutionStore } from "@/store/institutionStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Download, Building2, FileCheck, GraduationCap, Lightbulb, AlertTriangle, CheckCircle2, Loader2, GitCompare } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils";

import { useEffect, useState } from "react";

export default function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getInstitution, fetchInstitution } = useInstitutionStore();
  const [loading, setLoading] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  const inst = getInstitution(id || "");

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchInstitution(id).finally(() => setLoading(false));

      // Load checklist state
      const saved = localStorage.getItem(`inspectai-tasks-${id}`);
      if (saved) {
        try {
          setCompletedTasks(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse saved tasks", e);
        }
      }
    }
  }, [id]);

  const toggleTask = (task: string) => {
    const newTasks = { ...completedTasks, [task]: !completedTasks[task] };
    setCompletedTasks(newTasks);
    localStorage.setItem(`inspectai-tasks-${id}`, JSON.stringify(newTasks));
  };

  const handlePrint = () => {
    window.print();
  };

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
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8 print:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{inst.name}</h1>
            <p className="text-muted-foreground">{inst.location} · Analyzed {formatDate(inst.dateAnalyzed)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(`/compare?id1=${id}`)} className="gap-2">
            <GitCompare className="h-4 w-4" /> Compare
          </Button>
          <Button variant="default" className="gap-2" onClick={handlePrint}>
            <Download className="h-4 w-4" /> Download Report
          </Button>
        </div>
      </div>

      {/* Print Header (Only visible when printing) */}
      <div className="hidden print:block mb-8">
        <h1 className="text-3xl font-bold">{inst.name}</h1>
        <p className="text-muted-foreground">{inst.location} · Inspection Report · {formatDate(inst.dateAnalyzed)}</p>
      </div>

      {/* Overall Score */}
      {(inst.overallScore || inst.campusScore || inst.complianceScore) && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="gradient-hero text-primary-foreground overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row items-center gap-8 text-center sm:text-left">
                <div>
                  <p className="text-7xl font-bold tracking-tighter">{inst.overallScore}</p>
                  <p className="opacity-70 mt-1 uppercase tracking-widest text-xs font-semibold">Overall Index</p>
                </div>
                <div className="flex-1 grid grid-cols-3 gap-8 w-full">
                  {[
                    { label: "Infrastructure", score: inst.campusScore },
                    { label: "Compliance", score: inst.complianceScore },
                    { label: "Academic", score: inst.academicScore },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className="text-3xl font-bold">{s.score ?? "—"}</p>
                      <p className="text-xs opacity-70 mt-0.5">{s.label}</p>
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
            <CardTitle>Infrastructure Analysis & "Fix-it" List</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-sm font-semibold flex items-center gap-2 text-warning uppercase tracking-wider">
                  <AlertTriangle className="h-4 w-4" /> Maintenance Issues
                </h4>
                <div className="grid gap-3">
                  {(cam.maintenance_issues ?? []).map((m, i) => (
                    <div key={i} className="flex items-start gap-3 group">
                      <Checkbox 
                        id={`m-${i}`} 
                        checked={completedTasks[`m-${i}`]} 
                        onCheckedChange={() => toggleTask(`m-${i}`)}
                        className="mt-1"
                      />
                      <Label 
                        htmlFor={`m-${i}`} 
                        className={`text-sm leading-relaxed cursor-pointer transition-all ${completedTasks[`m-${i}`] ? 'text-muted-foreground line-through opacity-50' : 'text-foreground'}`}
                      >
                        {m}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-semibold flex items-center gap-2 text-destructive uppercase tracking-wider">
                  <AlertTriangle className="h-4 w-4" /> Safety Hazards
                </h4>
                <div className="grid gap-3">
                  {(cam.safety_hazards ?? []).map((h, i) => (
                    <div key={i} className="flex items-start gap-3 group">
                      <Checkbox 
                        id={`h-${i}`} 
                        checked={completedTasks[`h-${i}`]} 
                        onCheckedChange={() => toggleTask(`h-${i}`)}
                        className="mt-1"
                      />
                      <Label 
                        htmlFor={`h-${i}`} 
                        className={`text-sm leading-relaxed cursor-pointer transition-all ${completedTasks[`h-${i}`] ? 'text-muted-foreground line-through opacity-50' : 'text-foreground'}`}
                      >
                        {h}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="pt-4 border-t">
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-success uppercase tracking-wider">
                <CheckCircle2 className="h-4 w-4" /> Existing Compliance
              </h4>
              <div className="flex flex-wrap gap-2">
                {(cam.compliance_flags ?? []).map((f, i) => (
                  <Badge key={i} variant="outline" className="status-badge-completed font-medium px-3">{f}</Badge>
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
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 p-1">
              {/* Score Hero */}
              <div className="lg:col-span-1 bg-primary/5 rounded-2xl p-6 border border-primary/10 flex flex-col justify-center text-center lg:text-left">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-2">Authenticity Score</p>
                <div className="flex items-baseline justify-center lg:justify-start gap-1">
                  <span className="text-5xl font-black text-primary tracking-tighter">{doc.authenticity_score}</span>
                  <span className="text-sm font-semibold text-muted-foreground">/100</span>
                </div>
                <div className="mt-3 h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${doc.authenticity_score}%` }} 
                    className="h-full bg-primary"
                  />
                </div>
              </div>

              {/* Info Blocks */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted/30 rounded-2xl p-6 border border-border/50 space-y-2 flex flex-col justify-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Verification Date</p>
                  <p className="text-sm font-bold text-foreground/80 leading-snug">{doc.date_of_issue || "Manual check req."}</p>
                </div>
                
                <div className="bg-muted/30 rounded-2xl p-6 border border-border/50 space-y-3 flex flex-col justify-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Signature Integrity</p>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider w-fit ${doc.signature_available ? "bg-success/10 text-success border border-success/20" : "bg-warning/10 text-warning border border-warning/20"}`}>
                    {doc.signature_available ? "Verified" : "Unclear"}
                  </div>
                </div>

                <div className="bg-muted/30 rounded-2xl p-6 border border-border/50 space-y-2 flex flex-col justify-center overflow-hidden">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Audit Status</p>
                  <p className="text-[11px] font-medium text-foreground/70 leading-relaxed italic line-clamp-3">
                    {doc.accreditation_validation}
                  </p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Detected Issues</h4>
                <ul className="space-y-2">
                  {(doc.detected_issues ?? []).map((d, i) => (
                    <li key={i} className="text-sm text-foreground flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-warning shrink-0" />{d}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Missing Documentation</h4>
                <ul className="space-y-2">
                  {(doc.missing_documents ?? []).map((d, i) => (
                    <li key={i} className="text-sm text-foreground flex items-start gap-3">
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
          <Card className="overflow-hidden">
            <CardHeader className="flex-row items-center gap-3">
              <GraduationCap className="h-5 w-5 text-primary" />
              <CardTitle>Academic Performance Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {perf.key_metrics && perf.key_metrics.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
                  {perf.key_metrics.map((m, i) => (
                    <div key={i} className="text-center">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">{m.label}</p>
                      <p className="text-xl font-bold">{m.value}<span className="text-sm font-normal text-muted-foreground ml-0.5">{m.unit}</span></p>
                    </div>
                  ))}
                </div>
              )}
              {perf.subject_performance && perf.subject_performance.length > 0 && (
                <div className="h-72">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Subject-wise Score Analysis</p>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={perf.subject_performance}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="subject" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} />
                      <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                {perf.class_wise_analysis && perf.class_wise_analysis.length > 0 && (
                  <div className="h-60">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Class-wise Trend Line</p>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={perf.class_wise_analysis}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                        <XAxis dataKey="class" tick={{ fontSize: 10 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="average" stroke="hsl(var(--success))" strokeWidth={3} dot={{ r: 4, fill: "hsl(var(--success))" }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {perf.department_performance && perf.department_performance.length > 0 && (
                  <div className="h-60">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Departmental Averages</p>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={perf.department_performance}
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="average"
                          nameKey="department"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {perf.department_performance?.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={`hsl(var(--primary), ${1 - (index * 0.15)})`} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-t pt-6">
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-success">Top Percentile Courses</h4>
                  <div className="flex flex-wrap gap-2">
                    {(perf.top_performing_courses ?? []).map((c) => (
                      <Badge key={c} variant="outline" className="status-badge-completed px-3">{c}</Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-warning">Focus Areas Required</h4>
                  <div className="flex flex-wrap gap-2">
                    {(perf.low_performing_courses ?? []).map((c) => (
                      <Badge key={c} variant="outline" className="status-badge-processing px-3">{c}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Deep Scan Insights */}
          {perf.extra_insights && perf.extra_insights.length > 0 && (
            <Card className="border-success/20 bg-success/5 shadow-none">
              <CardHeader className="flex-row items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-success" />
                <CardTitle className="text-lg">AI Deep Scan Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {perf.extra_insights.map((insight, i) => (
                  <div key={i} className="flex gap-4 p-3 bg-white/50 rounded-lg border border-success/10 shadow-sm">
                    <p className="text-sm leading-relaxed text-foreground/90 italic">"{insight}"</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* AI Recommendations */}
          <Card className="bg-primary/5 border-primary/20 shadow-none">
            <CardHeader className="flex-row items-center gap-3">
              <Lightbulb className="h-5 w-5 text-warning" />
              <CardTitle>Audit Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-4">
                {(perf.improvement_recommendations ?? []).map((r, i) => (
                  <li key={i} className="flex items-start gap-4 text-sm leading-relaxed">
                    <span className="mt-0.5 h-6 w-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                    <span className="text-foreground/80">{r}</span>
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
