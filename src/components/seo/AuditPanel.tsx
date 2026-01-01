
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, Smartphone, Zap } from "lucide-react";

interface AuditPanelProps {
    onRunAudit: () => void;
    loading: boolean;
}

export function AuditPanel({ onRunAudit, loading }: AuditPanelProps) {
    // Mock data for initial state
    const score = {
        performance: 78,
        seo: 92,
        accessibility: 85,
        bestPractices: 100
    };

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Score SEO Global</CardTitle>
                    <CardDescription>Analyse basée sur les meilleures pratiques Google.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center py-6">
                    <div className="relative h-40 w-40 flex items-center justify-center rounded-full border-8 border-primary/20">
                        <div className="text-4xl font-bold text-primary">89</div>
                        <div className="absolute top-0 right-0">
                            <span className="flex h-3 w-3 rounded-full bg-green-500" />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="justify-center">
                    <Button onClick={onRunAudit} disabled={loading}>
                        {loading ? "Audit en cours..." : "Lancer un nouvel audit"}
                    </Button>
                </CardFooter>
            </Card>

            <div className="space-y-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-500" /> Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <Progress value={score.performance} className="h-2" />
                            <span className="font-bold w-8">{score.performance}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" /> SEO On-Page
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <Progress value={score.seo} className="h-2" />
                            <span className="font-bold w-8">{score.seo}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-blue-500" /> Mobile Friendly
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <Progress value={score.accessibility} className="h-2" />
                            <span className="font-bold w-8">{score.accessibility}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
