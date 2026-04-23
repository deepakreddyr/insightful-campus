import { useSearchParams, useNavigate } from "react-router-dom";
import { useInstitutionStore, InstitutionReport } from "@/store/institutionStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, GitCompare, Minus, Plus, TrendingDown, TrendingUp, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ComparisonView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { institutions, fetchInstitutions } = useInstitutionStore();

  const id1 = searchParams.get("id1");
  const id2 = searchParams.get("id2");

  const [report1, setReport1] = useState<InstitutionReport | undefined>();
  const [report2, setReport2] = useState<InstitutionReport | undefined>();

  useEffect(() => {
    if (institutions.length === 0) {
      fetchInstitutions();
    }
  }, []);

  useEffect(() => {
    if (id1) setReport1(institutions.find(i => i.id === id1));
    if (id2) setReport2(institutions.find(i => i.id === id2));
  }, [id1, id2, institutions]);

  const handleSelect = (val: string, index: 1 | 2) => {
    const params = new URLSearchParams(searchParams);
    params.set(`id${index}`, val);
    setSearchParams(params);
  };

  const getDiff = (v1?: number, v2?: number) => {
    if (v1 === undefined || v2 === undefined) return null;
    const diff = v2 - v1;
    if (diff === 0) return <span className="text-muted-foreground flex items-center gap-1"><Minus className="h-3 w-3" /> No change</span>;
    return diff > 0
      ? <span className="text-success flex items-center gap-1"><TrendingUp className="h-3 w-3" /> +{diff} improvement</span>
      : <span className="text-destructive flex items-center gap-1"><TrendingDown className="h-3 w-3" /> {diff} decline</span>;
  };

  const completed = institutions.filter(i => i.status === "completed");

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <GitCompare className="h-6 w-6 text-primary" /> Report Comparison
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Selection Column 1 */}
        <div className="space-y-4">
          <Select value={id1 || ""} onValueChange={(v) => handleSelect(v, 1)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select first report" />
            </SelectTrigger>
            <SelectContent>
              {completed.map(inst => (
                <SelectItem key={inst.id} value={inst.id}>{inst.name} ({formatDate(inst.dateAnalyzed)})</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {report1 && (
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <ReportSummaryCard report={report1} />
            </motion.div>
          )}
        </div>

        {/* Selection Column 2 */}
        <div className="space-y-4">
          <Select value={id2 || ""} onValueChange={(v) => handleSelect(v, 2)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select second report" />
            </SelectTrigger>
            <SelectContent>
              {completed.map(inst => (
                <SelectItem key={inst.id} value={inst.id}>{inst.name} ({formatDate(inst.dateAnalyzed)})</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {report2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <ReportSummaryCard report={report2} />
            </motion.div>
          )}
        </div>
      </div>

      {report1 && report2 && (
        <div className="space-y-6">
          {/* Visual Score Comparison */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" /> Key Performance Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: "Infrastructure", [report1.name]: report1.campusScore, [report2.name]: report2.campusScore },
                    { name: "Compliance", [report1.name]: report1.complianceScore, [report2.name]: report2.complianceScore },
                    { name: "Academic", [report1.name]: report1.academicScore, [report2.name]: report2.academicScore },
                    { name: "Overall", [report1.name]: report1.overallScore, [report2.name]: report2.overallScore },
                  ]}>
                    <XAxis dataKey="name" />
                    <Tooltip />
                    <Bar dataKey={report1.name} fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey={report2.name} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics Comparison (Dynamic) */}
          {((report1.performanceAnalysis?.key_metrics?.length || 0) > 0 || (report2.performanceAnalysis?.key_metrics?.length || 0) > 0) && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Extracted Metrics Comparison</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <p className="text-xs font-bold uppercase text-muted-foreground">{report1.name}</p>
                    <div className="grid gap-4">
                      {report1.performanceAnalysis?.key_metrics?.slice(0, 3).map((m, i) => (
                        <div key={i}>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">{m.label}</p>
                          <p className="text-xl font-bold">{m.value} {m.unit}</p>
                        </div>
                      ))}
                      {(!report1.performanceAnalysis?.key_metrics || report1.performanceAnalysis.key_metrics.length === 0) && (
                        <p className="text-sm text-muted-foreground italic">No metrics extracted</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4 border-l pl-8">
                    <p className="text-xs font-bold uppercase text-primary">{report2.name}</p>
                    <div className="grid gap-4">
                      {report2.performanceAnalysis?.key_metrics?.slice(0, 3).map((m, i) => (
                        <div key={i}>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">{m.label}</p>
                          <p className="text-xl font-bold">{m.value} {m.unit}</p>
                        </div>
                      ))}
                      {(!report2.performanceAnalysis?.key_metrics || report2.performanceAnalysis.key_metrics.length === 0) && (
                        <p className="text-sm text-muted-foreground italic">No metrics extracted</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Departmental Benchmark Section */}
          {((report1.performanceAnalysis?.department_performance.length || 0) > 0 || (report2.performanceAnalysis?.department_performance.length || 0) > 0) && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Departmental Benchmark</CardTitle></CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={
                      Array.from(new Set([
                        ...(report1.performanceAnalysis?.department_performance.map(d => d.department) || []),
                        ...(report2.performanceAnalysis?.department_performance.map(d => d.department) || [])
                      ])).slice(0, 5).map(dept => ({
                        name: dept,
                        [report1.name]: report1.performanceAnalysis?.department_performance.find(d => d.department === dept)?.average || 0,
                        [report2.name]: report2.performanceAnalysis?.department_performance.find(d => d.department === dept)?.average || 0,
                      }))
                    }>
                      <XAxis type="number" hide />
                      <Tooltip />
                      <Bar dataKey={report1.name} fill="hsl(var(--muted-foreground)/0.5)" radius={[0, 4, 4, 0]} />
                      <Bar dataKey={report2.name} fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Deep Scan Contrast (Always Shown) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-primary/5 border-primary/10 shadow-none">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingDown className="h-4 w-4 text-muted-foreground" /> {report1.name} Insights</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {report1.performanceAnalysis?.extra_insights && report1.performanceAnalysis.extra_insights.length > 0 ? (
                  report1.performanceAnalysis.extra_insights.slice(0, 2).map((insight, i) => (
                    <p key={i} className="text-sm italic text-foreground/70 leading-relaxed border-l-2 border-primary/20 pl-4">"{insight}"</p>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">No deep scan insights available for this report.</p>
                )}
              </CardContent>
            </Card>
            <Card className="bg-primary/5 border-primary/10 shadow-none">
              <CardHeader><CardTitle className="text-base flex items-center gap-2 text-primary"><TrendingUp className="h-4 w-4" /> {report2.name} Insights</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {report2.performanceAnalysis?.extra_insights && report2.performanceAnalysis.extra_insights.length > 0 ? (
                  report2.performanceAnalysis.extra_insights.slice(0, 2).map((insight, i) => (
                    <p key={i} className="text-sm italic text-foreground/70 leading-relaxed border-l-2 border-primary pl-4">"{insight}"</p>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground italic">No deep scan insights available for this report.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function ReportSummaryCard({ report }: { report: InstitutionReport }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{report.name}</CardTitle>
        <p className="text-xs text-muted-foreground">{report.location} · {formatDate(report.dateAnalyzed)}</p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full border-4 border-primary/20 flex items-center justify-center text-xl font-bold">
            {report.overallScore}
          </div>
          <div className="grid grid-cols-3 gap-4 flex-1">
            <div>
              <p className="text-lg font-bold">{report.campusScore || "—"}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Infra</p>
            </div>
            <div>
              <p className="text-lg font-bold">{report.complianceScore || "—"}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Comp</p>
            </div>
            <div>
              <p className="text-lg font-bold">{report.academicScore || "—"}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Acad</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
