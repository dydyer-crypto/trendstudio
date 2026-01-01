
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    AlertCircle,
    CheckCircle,
    Smartphone,
    Zap,
    Shield,
    ArrowRight,
    Target,
    Trophy,
    TrendingDown,
    Wrench,
    Coins
} from "lucide-react";
import type { ConsultantReport } from "@/services/aiConsultant";

interface AuditReportProps {
    results: ConsultantReport & { url: string; performance: number; seo: number; mobile: number; security: number };
}

export function AuditReport({ results }: AuditReportProps) {
    if (!results) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Stats */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <ScoreCard title="Performance" score={results.performance} icon={Zap} color="text-yellow-500" />
                <ScoreCard title="SEO" score={results.seo} icon={Target} color="text-green-500" />
                <ScoreCard title="Mobile" score={results.mobile} icon={Smartphone} color="text-blue-500" />
                <ScoreCard title="Sécurité" score={results.security} icon={Shield} color="text-purple-500" />
            </div>

            <Tabs defaultValue="strategy" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-[600px] mx-auto mb-8">
                    <TabsTrigger value="strategy">Stratégie IA</TabsTrigger>
                    <TabsTrigger value="action">Plan d'Action</TabsTrigger>
                    <TabsTrigger value="budget">Estimation</TabsTrigger>
                </TabsList>

                {/* Strategy Tab */}
                <TabsContent value="strategy" className="space-y-6">
                    <Card className="border-2 border-primary/10">
                        <CardHeader>
                            <CardTitle className="text-2xl flex items-center gap-2">
                                <Trophy className="text-yellow-500" /> Résumé Stratégique
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-lg leading-relaxed text-muted-foreground italic">
                                "{results.summary}"
                            </p>
                        </CardContent>
                    </Card>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-green-600 flex items-center gap-2">
                                    <CheckCircle size={20} /> Forces du Site
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {results.strengths.map((str, idx) => (
                                    <div key={idx} className="flex gap-2 items-center text-sm">
                                        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                        {str}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-destructive flex items-center gap-2">
                                    <TrendingDown size={20} /> Faiblesses à corriger
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {results.weaknesses.map((weak, idx) => (
                                    <div key={idx} className="flex gap-2 items-center text-sm">
                                        <div className="h-1.5 w-1.5 rounded-full bg-destructive" />
                                        {weak}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Action Plan Tab */}
                <TabsContent value="action" className="space-y-6">
                    <div className="grid gap-4">
                        {results.action_plan.map((action, idx) => (
                            <Card key={idx} className="hover:border-primary/30 transition-all cursor-default group">
                                <CardContent className="flex items-center gap-6 py-6">
                                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                                        <Wrench size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h4 className="font-bold text-lg">{action.title}</h4>
                                            <Badge variant={action.priority === 'high' ? 'destructive' : action.priority === 'medium' ? 'default' : 'secondary'}>
                                                Priorité {action.priority === 'high' ? 'Haute' : action.priority === 'medium' ? 'Moyenne' : 'Basse'}
                                            </Badge>
                                        </div>
                                        <p className="text-muted-foreground text-sm">{action.description}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs text-muted-foreground uppercase font-semibold">Effort estimé</p>
                                        <p className="font-bold text-primary">{action.estimated_effort}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Budget Tab */}
                <TabsContent value="budget" className="space-y-6 text-center lg:text-left">
                    <div className="grid gap-8 lg:grid-cols-12 items-start">
                        <div className="lg:col-span-8 space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Coins className="text-yellow-600" /> Détail de l'investissement
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {results.budget_estimate.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
                                            <span className="font-medium">{item.description}</span>
                                            <span className="font-bold">{item.price.toLocaleString()}€</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between items-center pt-4 text-xl font-extrabold text-primary">
                                        <span>Total Estimé</span>
                                        <span>{results.budget_estimate.total.toLocaleString()}€</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="lg:col-span-4 space-y-4">
                            <Card className="bg-primary text-primary-foreground border-0 shadow-2xl">
                                <CardHeader>
                                    <CardTitle>Rapport AI Consultant</CardTitle>
                                    <CardDescription className="text-primary-foreground/70">Prêt pour signature ou export</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm">Ce rapport peut être directement converti en devis officiel et envoyé à votre CRM Djaboo.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function ScoreCard({ title, score, icon: Icon, color }: any) {
    return (
        <Card className="hover:scale-105 transition-transform duration-300">
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
