import { useNavigate } from "react-router-dom";
import { useInstitutionStore } from "@/store/institutionStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye } from "lucide-react";

export default function Reports() {
  const { institutions } = useInstitutionStore();
  const navigate = useNavigate();
  const completed = institutions.filter((i) => i.status === "completed");

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
      {completed.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">No completed reports yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {completed.map((inst) => (
            <Card key={inst.id} className="card-hover">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{inst.name}</p>
                    <p className="text-sm text-muted-foreground">{inst.location} · {inst.dateAnalyzed}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {inst.overallScore && <Badge variant="outline" className="status-badge-completed">Score: {inst.overallScore}</Badge>}
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/reports/${inst.id}`)} className="gap-1.5">
                    <Eye className="h-3.5 w-3.5" /> View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
