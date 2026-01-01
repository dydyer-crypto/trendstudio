
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, Smartphone, Zap, Search, Lightbulb } from "lucide-react";
import type { SEOReport } from "@/services/aiConsultant";

interface AuditPanelProps {
    onRunAudit: (url: string) => void;
    loading: boolean;
    report: SEOReport | null;
}

export function AuditPanel({ onRunAudit, loading, report }: AuditPanelProps) {
    if (!report) {
        return (
            <Card className="border-2 border-dashed bg-muted/20">
                <CardHeader className="text-center">
                    <CardTitle>Lancer un Audit SEO IA</CardTitle>
                    <CardDescription>Obtenez une analyse complète de votre site et des recommandations stratégiques.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4 py-8">
                    <Search className="h-12 w-12 text-muted-foreground opacity-50" />
                    <Button onClick={() => onRunAudit("https://google.com")} disabled={loading} size="lg">
                        {loading ? "Analyse en cours..." : "Démarrer l'audit"}
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-primary/20">
                    <CardHeader>
                        <CardTitle>Score SEO Global</CardTitle>
                        <CardDescription>Analyse basée sur les meilleures pratiques Google.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center py-6">
                        <div className="relative h-40 w-40 flex items-center justify-center rounded-full border-8 border-primary/20 bg-primary/5">
                            <div className="text-4xl font-extrabold text-primary">{report.scores.global}</div>
                            <div className="absolute -top-2 -right-2">
                                <span className={`flex h-5 w-5 rounded-full ${report.scores.global > 80 ? 'bg-green-500' : 'bg-yellow-500'} border-4 border-background`} />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="justify-center border-t pt-4">
                        <Button variant="outline" size="sm" onClick={() => onRunAudit("")} disabled={loading}>
                            Relancer l'audit
                        </Button>
                    </CardFooter>
                </Card>

                <div className="space-y-4">
                    <ScoreRow title="Contenu & Sémantique" score={report.scores.content} icon={Lightbulb} color="text-purple-500" />
                    <ScoreRow title="SEO On-Page" score={report.scores.on_page} icon={CheckCircle} color="text-green-500" />
                    <ScoreRow title="SEO Technique" score={report.scores.technical} icon={Zap} color="text-yellow-500" />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-destructive flex items-center gap-2">
                            <AlertCircle size={20} /> Problèmes Techniques
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {report.technical_issues.map((issue, idx) => (
                            <div key={idx} className="text-sm p-3 bg-destructive/5 rounded-lg border border-destructive/10 flex gap-2">
                                <span className="font-bold text-destructive">•</span>
                                {issue}
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-primary flex items-center gap-2">
                            <Lightbulb size={20} /> Opportunités
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {report.opportunities.map((opt, idx) => (
                            <div key={idx} className="text-sm p-3 bg-primary/5 rounded-lg border border-primary/10 flex gap-2">
                                <span className="font-bold text-primary">•</span>
                                {opt}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-gradient-to-br from-primary/5 to-purple-500/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="text-primary" /> Stratégie Sémantique Proposée
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm leading-relaxed italic text-muted-foreground">
                        "{report.semantic_strategy}"
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

function ScoreRow({ title, score, icon: Icon, color }: any) {
    return (
        <Card className="hover:bg-muted/50 transition-colors">
            <CardContent className="p-4 py-3">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${color}`} /> {title}
                    </span>
                    <span className="text-sm font-bold">{score}%</span>
                </div>
                <Progress value={score} className="h-1.5" />
            </CardContent>
        </Card>
    );
}
