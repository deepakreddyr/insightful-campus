import { useNavigate } from "react-router-dom";
import { useInstitutionStore } from "@/store/institutionStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Calendar, Eye } from "lucide-react";
import { motion } from "framer-motion";

export default function Institutions() {
  const { institutions } = useInstitutionStore();
  const navigate = useNavigate();

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Institutions</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {institutions.map((inst, i) => (
          <motion.div key={inst.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="card-hover h-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{inst.name}</CardTitle>
                  <Badge variant="outline" className={inst.status === "completed" ? "status-badge-completed" : "status-badge-processing"}>
                    {inst.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between gap-4">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />{inst.location}</div>
                  <div className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" />{inst.dateAnalyzed}</div>
                  {inst.overallScore && (
                    <div className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5" />Score: {inst.overallScore}/100</div>
                  )}
                </div>
                <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={() => navigate(`/reports/${inst.id}`)} disabled={inst.status !== "completed"}>
                  <Eye className="h-3.5 w-3.5" /> View Report
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
