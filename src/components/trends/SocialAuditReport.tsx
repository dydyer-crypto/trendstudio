import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Users, MessageSquare, TrendingUp, Sparkles, Target, Zap } from "lucide-react";
import type { SocialMediaReport } from "@/services/aiConsultant";

interface SocialAuditReportProps {
    report: SocialMediaReport;
}

export function SocialAuditReport({ report }: SocialAuditReportProps) {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Audit Section */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="text-primary h-5 w-5" /> État des Lieux
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm leading-relaxed text-muted-foreground">{report.audit.current_state}</p>
                        <div className="space-y-2">
                            <p className="text-xs font-bold uppercase tracking-wider text-green-600">Points Forts</p>
                            <div className="flex flex-wrap gap-2">
                                {report.audit.strengths.map((s, i) => (
                                    <Badge key={i} variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                                        <CheckCircle size={10} className="mr-1" /> {s}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-destructive/20 bg-destructive/5">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <XCircle className="text-destructive h-5 w-5" /> Axes d'Amélioration
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {report.audit.weaknesses.map((w, i) => (
                                <Badge key={i} variant="secondary" className="bg-destructive/10 text-destructive hover:bg-destructive/10">
                                    {w}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Strategy Section */}
            <div className="grid gap-6 md:grid-cols-3">
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Sparkles className="text-primary h-5 w-5" /> Piliers de Contenu
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2">
                            {report.strategy.content_pillars.map((pillar, i) => (
                                <div key={i} className="p-4 rounded-xl border bg-muted/30 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-sm">{pillar.name}</h4>
                                        <Badge variant="outline" className="text-[10px]">{pillar.frequency}</Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{pillar.description}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <Users size={16} className="text-primary" /> Audience Cible
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">{report.strategy.target_audience}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <MessageSquare size={16} className="text-primary" /> Ton de Voix
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-xs text-muted-foreground">{report.strategy.tone_of_voice}</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Platforms & Viral Hooks */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="text-green-500 h-5 w-5" /> Plateformes Recommandées
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {report.best_platforms.map((p, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                                <div>
                                    <p className="font-bold text-sm">{p.name}</p>
                                    <p className="text-xs text-muted-foreground">{p.reason}</p>
                                </div>
                                <Badge className="bg-green-500">{p.estimated_growth}</Badge>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Zap className="text-yellow-500 h-5 w-5" /> Accroches Virales (Hooks)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {report.viral_hooks.map((hook, i) => (
                                <div key={i} className="p-3 bg-white/50 dark:bg-black/20 rounded-lg border border-primary/10 text-sm font-medium italic">
                                    "{hook}"
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
