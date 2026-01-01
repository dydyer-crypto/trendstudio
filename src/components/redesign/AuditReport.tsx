
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, Smartphone, Zap, Shield } from "lucide-react";

interface AuditReportProps {
    results: any | null; // Replace with proper type later
}

export function AuditReport({ results }: AuditReportProps) {
    if (!results) return null;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <ScoreCard title="Performance" score={results.performance} icon={Zap} color="text-yellow-500" />
                <ScoreCard title="SEO" score={results.seo} icon={SearchIcon} color="text-green-500" />
                <ScoreCard title="Mobile" score={results.mobile} icon={Smartphone} color="text-blue-500" />
                <ScoreCard title="Sécurité" score={results.security} icon={Shield} color="text-purple-500" />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Problèmes détectés ({results.issues.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {results.issues.map((issue: string, idx: number) => (
                            <div key={idx} className="flex gap-3 items-start p-3 rounded-lg bg-destructive/10 text-destructive">
                                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                                <span className="text-sm font-medium">{issue}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Recommandations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {results.recommendations.map((rec: string, idx: number) => (
                            <div key={idx} className="flex gap-3 items-start p-3 rounded-lg bg-green-500/10 text-green-700 dark:text-green-400">
                                <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" />
                                <span className="text-sm font-medium">{rec}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function ScoreCard({ title, score, icon: Icon, color }: any) {
    return (
        <Card>
            <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold text-muted-foreground">{title}</span>
                    <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div className="flex items-end gap-2 mb-2">
                    <span className="text-3xl font-bold">{score}</span>
                    <span className="text-sm text-muted-foreground mb-1">/100</span>
                </div>
                <Progress value={score} className="h-2" />
            </CardContent>
        </Card>
    );
}

function SearchIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
        </svg>
    )
}
