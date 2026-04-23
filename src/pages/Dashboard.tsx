import { useNavigate } from "react-router-dom";
import { useInstitutionStore } from "@/store/institutionStore";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, FileText, BarChart3, Eye, GitCompare } from "lucide-react";
import { motion } from "framer-motion";
import { formatDate } from "@/lib/utils";

import { useEffect } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const { institutions, fetchInstitutions } = useInstitutionStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchInstitutions();
  }, [fetchInstitutions]);

  const completed = institutions.filter((i) => i.status === "completed").length;
  const processing = institutions.filter((i) => i.status === "processing").length;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/compare")} className="gap-2">
            <GitCompare className="h-4 w-4" />
            Compare Reports
          </Button>
          <Button onClick={() => navigate("/analysis/new")} className="gap-2">
            <Plus className="h-4 w-4" />
            Analyze New Institution
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Institutions", value: institutions.length, icon: Building2 },
          { label: "Completed", value: completed, icon: FileText },
          { label: "Processing", value: processing, icon: BarChart3 },
        ].map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="card-hover">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Analyses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Institution</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Location</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {institutions.map((inst, i) => (
                  <motion.tr
                    key={inst.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-medium">{inst.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{inst.location}</td>
                    <td className="py-3 px-4 text-muted-foreground">{formatDate(inst.dateAnalyzed)}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className={inst.status === "completed" ? "status-badge-completed" : "status-badge-processing"}>
                        {inst.status === "completed" ? "Completed" : "Processing"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/reports/${inst.id}`)}
                        disabled={inst.status !== "completed"}
                        className="gap-1.5"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View Report
                      </Button>
                    </td>
                  </motion.tr>
                ))}
                {institutions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-muted-foreground">
                      No institutions analyzed yet. Click "Analyze New Institution" to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
