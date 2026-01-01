import { useState, useEffect } from "react";
import { SiteAnalyzer } from "@/components/redesign/SiteAnalyzer";
import { AuditReport } from "@/components/redesign/AuditReport";
import { MigrationWizard } from "@/components/redesign/MigrationWizard";
import { supabase } from "@/db/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { aiConsultant, type ConsultantReport } from "@/services/aiConsultant";
import { crmService, type CRMWebhook } from "@/services/crm";
import { Button } from "@/components/ui/button";
import { Rocket, Send, ShieldCheck, Sparkles } from "lucide-react";

export default function SiteRedesignPage() {
    const [analyzing, setAnalyzing] = useState(false);
    const [auditResults, setAuditResults] = useState<any | null>(null);
    const [showWizard, setShowWizard] = useState(false);
    const [sendingToCRM, setSendingToCRM] = useState(false);
    const [webhooks, setWebhooks] = useState<CRMWebhook[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            loadWebhooks();
        }
    }, [user]);

    const loadWebhooks = async () => {
        try {
            const hooks = await crmService.getWebhooks(user!.id);
            setWebhooks(hooks);
        } catch (error) {
            console.error("Failed to load webhooks:", error);
        }
    };

    const handleAnalyze = async (url: string) => {
        setAnalyzing(true);
        setAuditResults(null);
        setShowWizard(false);

        const toastId = toast.loading("Initialisation du crawler TrendStudio...");

        try {
            toast.message("Scan des métadonnées et de la structure...", { id: toastId });
            const report = await aiConsultant.analyzeSite(url);

            toast.message("Élaboration des 4 variantes stratégiques avec l'IA...", { id: toastId });

            // Add scores (mocked based on analysis or logic)
            const fullResults = {
                ...report,
                url,
                performance: report.score,
                seo: Math.min(100, report.score + 5),
                mobile: Math.min(100, report.score - 10),
                security: 95
            };

            setAuditResults(fullResults);

            // Save to DB
            if (user) {
                await supabase.from('site_audits').insert({
                    user_id: user.id,
                    url,
                    audit_type: 'full',
                    results: fullResults,
                    score: fullResults.score,
                    issues: report.weaknesses,
                    recommendations: report.action_plan.map(a => a.title)
                });
            }

            toast.success("Analyse stratégique et scan terminés ✨", { id: toastId });
        } catch (error) {
            console.error("Analysis error:", error);
            toast.error("Échec de l'analyse ou du scan du site", { id: toastId });
        } finally {
            setAnalyzing(false);
        }
    };

    const handleValidateAndSend = async () => {
        if (!auditResults) return;

        if (webhooks.length === 0) {
            toast.error("Aucun webhook CRM configuré (ex: Djaboo)");
            return;
        }

        setSendingToCRM(true);
        try {
            const webhook = webhooks[0]; // Take the first one for demo
            const success = await crmService.sendQuoteToCRM(webhook.url, auditResults);

            if (success) {
                toast.success("Devis envoyé au CRM Djaboo avec succès !");
            } else {
                toast.error("Erreur lors de l'envoi au CRM");
            }
        } catch (error) {
            toast.error("Échec de la connexion au CRM");
        } finally {
            setSendingToCRM(false);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-bold mb-4">
                    <Sparkles size={16} /> IA Consultant v2.5
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Stratégie de Refonte Assistée
                </h1>
                <p className="text-xl text-muted-foreground">
                    Une analyse profonde par IA pour transformer votre site obsolète en machine de conversion.
                </p>
            </div>

            <SiteAnalyzer onAnalyze={handleAnalyze} isAnalyzing={analyzing} />

            {auditResults && (
                <div className="space-y-8">
                    <AuditReport results={auditResults} />

                    <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
                        <Button
                            size="lg"
                            variant="outline"
                            className="h-14 px-8 rounded-full text-lg font-bold border-2 hover:bg-primary/5 gap-2"
                            onClick={handleValidateAndSend}
                            disabled={sendingToCRM}
                        >
                            {sendingToCRM ? (
                                <span className="animate-pulse">Envoi au CRM...</span>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Valider & Envoyer au CRM (Djaboo)
                                </>
                            )}
                        </Button>
                        <Button
                            size="lg"
                            className="h-14 px-8 rounded-full text-lg font-bold shadow-xl gap-2 gradient-primary"
                            onClick={() => setShowWizard(true)}
                        >
                            <Rocket className="w-5 h-5" />
                            Lancer la Migration IA
                        </Button>
                    </div>
                </div>
            )}

            {showWizard && <MigrationWizard />}
        </div>
    );
}
