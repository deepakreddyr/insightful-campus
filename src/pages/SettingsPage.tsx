import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
      <Card>
        <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input defaultValue={user?.name} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input defaultValue={user?.email} type="email" />
          </div>
          <div className="space-y-2">
            <Label>Organization</Label>
            <Input defaultValue={user?.organization} />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
}
