import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    Coins,
    Download
} from "lucide-react";
import type { ConsultantReport } from "@/services/aiConsultant";
import { pdfService } from "@/services/pdfService";
import { crmService } from "@/services/crm";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { toast } from "sonner";
import { Send, CheckCircle } from "lucide-react";

interface AuditReportProps {
    results: ConsultantReport & { url: string; performance: number; seo: number; mobile: number; security: number };
}

export function AuditReport({ results }: AuditReportProps) {
    const { user } = useAuth();
    const [sendingCRM, setSendingCRM] = useState(false);
    const [crmSent, setCrmSent] = useState(false);

    if (!results) return null;

    const handleSendToCRM = async () => {
        if (!user) {
            toast.error("Veuillez vous connecter pour envoyer au CRM");
            return;
        }

        setSendingCRM(true);
        try {
            const webhooks = await crmService.getWebhooks(user.id);
            const activeHooks = webhooks.filter(h => h.is_active);

            if (activeHooks.length === 0) {
                toast.error("Aucun webhook CRM actif configuré dans vos paramètres.");
                setSendingCRM(false);
                return;
            }

            let success = false;
            for (const hook of activeHooks) {
                const res = await crmService.sendQuoteToCRM(hook.url, results);
                if (res) success = true;
            }

            if (success) {
                toast.success("Devis envoyé au CRM avec succès ! 🚀");
                setCrmSent(true);
            } else {
                toast.error("Erreur lors de l'envoi au CRM");
            }
        } catch (error) {
            console.error(error);
            toast.error("Une erreur est survenue");
        } finally {
            setSendingCRM(false);
        }
    };

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
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 lg:w-[800px] mx-auto mb-8">
                    <TabsTrigger value="strategy">Stratégie IA</TabsTrigger>
                    <TabsTrigger value="variants">Variantes Refonte</TabsTrigger>
                    <TabsTrigger value="action">Plan d'Action</TabsTrigger>
                    <TabsTrigger value="budget">Estimation</TabsTrigger>
                </TabsList>

                {/* Strategy Tab */}
                <TabsContent value="strategy" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="border-2 border-primary/10 bg-primary/5">
                            <CardHeader>
                                <CardTitle className="text-2xl flex items-center gap-2">
                                    <Trophy className="text-yellow-500" /> Résumé Stratégique
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-base leading-relaxed text-muted-foreground italic font-medium">
                                    "{results.summary}"
                                </p>
                            </CardContent>
                        </Card>

                        {results.visual_specs && (
                            <Card className="border-2 border-primary/5">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Zap className="text-primary h-5 w-5" /> Analyse Visuelle (Crawl)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        {results.visual_specs.colors.map((color, i) => (
                                            <div key={i} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-[10px] uppercase font-mono">
                                                <div className="h-3 w-3 rounded-full border" style={{ backgroundColor: color.startsWith('#') ? color : '#ccc' }} />
                                                {color}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold uppercase text-muted-foreground">Polices détectées :</p>
                                        <p className="text-sm font-semibold">{results.visual_specs.fonts.join(', ')}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold uppercase text-muted-foreground">Ambiance actuelle :</p>
                                        <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">{results.visual_specs.vibe}</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-green-600 flex items-center gap-2">
                                    <CheckCircle size={20} /> Forces du Site
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {results.strengths.map((str, idx) => (
                                    <div key={idx} className="flex gap-2 items-start text-sm">
                                        <div className="h-5 w-5 shrink-0 flex items-center justify-center">
                                            <CheckCircle className="h-3 w-3 text-green-500" />
                                        </div>
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
                                    <div key={idx} className="flex gap-2 items-start text-sm">
                                        <div className="h-5 w-5 shrink-0 flex items-center justify-center">
                                            <AlertCircle className="h-3 w-3 text-destructive" />
                                        </div>
                                        {weak}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Redesign Variants Tab */}
                <TabsContent value="variants" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {results.redesign_variants?.map((variant, idx) => (
                            <Card key={idx} className="overflow-hidden border-2 hover:border-primary/50 transition-all group">
                                <div className="h-2 w-full bg-gradient-to-r from-primary to-purple-600" />
                                <CardHeader>
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="outline" className="bg-primary/5 text-primary">
                                            {variant.type}
                                        </Badge>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Focus: {variant.focus}</span>
                                    </div>
                                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                                        {variant.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {variant.description}
                                    </p>
                                    <div className="space-y-2">
                                        <p className="text-xs font-bold uppercase text-primary">Points Clés :</p>
                                        <div className="flex flex-wrap gap-2">
                                            {variant.pros.map((pro, pidx) => (
                                                <Badge key={pidx} variant="secondary" className="bg-primary/5 text-primary text-[10px]">
                                                    {pro}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
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
                                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                    <CardTitle className="flex items-center gap-2">
                                        <Coins className="text-yellow-600" /> Détail de l'investissement
                                    </CardTitle>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                        onClick={() => pdfService.generateQuotePDF(results)}
                                    >
                                        <Download size={14} /> PDF
                                    </Button>
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
                                    <Button
                                        className="w-full gap-2 gradient-primary py-6 text-lg font-bold shadow-xl"
                                        onClick={handleSendToCRM}
                                        disabled={sendingCRM || crmSent}
                                    >
                                        {sendingCRM ? (
                                            "Envoi en cours..."
                                        ) : crmSent ? (
                                            <><CheckCircle className="h-5 w-5" /> Envoyé au CRM</>
                                        ) : (
                                            <><Send className="h-5 w-5" /> Valider & Envoyer au CRM</>
                                        )}
                                    </Button>
                                    {crmSent && (
                                        <p className="text-[10px] text-center text-primary-foreground/70 italic">
                                            Le statut de ce devis est désormais "Accepté" dans votre CRM.
                                        </p>
                                    )}
                                    {!crmSent && (
                                        <div className="pt-2 border-t border-primary/10">
                                            <a
                                                href="https://auth.djaboo.app/register?aff=Ca4mJWLQeatr"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[10px] text-center block text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1"
                                            >
                                                Pas encore de CRM ? Créez votre compte Djaboo ici <ExternalLink size={10} />
                                            </a>
                                        </div>
                                    )}
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
                    <Icon className={`h - 5 w - 5 ${color} `} />
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
