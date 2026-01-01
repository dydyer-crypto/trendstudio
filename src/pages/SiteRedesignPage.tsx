import { useState, useEffect } from "react";
import { SiteAnalyzer } from "@/components/redesign/SiteAnalyzer";
import { AuditReport } from "@/components/redesign/AuditReport";
import { MigrationWizard } from "@/components/redesign/MigrationWizard";
import { TurboMissionDialog } from "@/components/redesign/TurboMissionDialog";
import { supabase } from "@/db/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { aiConsultant, type ConsultantReport } from "@/services/aiConsultant";
import { crmService, type CRMWebhook } from "@/services/crm";
import { Button } from "@/components/ui/button";
import { Rocket, Send, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { addDays } from "date-fns";

export default function SiteRedesignPage() {
    const [analyzing, setAnalyzing] = useState(false);
    const [isTurbo, setIsTurbo] = useState(false);
    const [auditResults, setAuditResults] = useState<any | null>(null);
    const [showWizard, setShowWizard] = useState(false);
    const [showTurboDialog, setShowTurboDialog] = useState(false);
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

    const handleTurboMission = async (url: string) => {
        setIsTurbo(true);
        setAnalyzing(true);
        const toastId = toast.loading("Lancement de la Mission Turbo 🚀...");

        try {
            // 1. Audit Site & Redesign
            toast.message("Étape 1/3 : Analyse profonde du site...", { id: toastId });
            const report = await aiConsultant.analyzeSite(url);

            const fullResults = {
                ...report,
                url,
                performance: report.score,
                seo: Math.min(100, report.score + 5),
                mobile: Math.min(100, report.score - 10),
                security: 95
            };
            setAuditResults(fullResults);

            if (user) {
                await supabase.from('site_audits').insert({
                    user_id: user.id, url, audit_type: 'turbo', results: fullResults, score: fullResults.score
                });
            }

            // 2. Stratégie Social Media
            toast.message("Étape 2/3 : Création de la stratégie sociale...", { id: toastId });
            const socialStrategy = await aiConsultant.analyzeSocial(`Site web : ${url}. Résumé : ${report.summary}`);

            if (user) {
                await supabase.from('social_media_analyses').insert({
                    user_id: user.id, results: socialStrategy
                });
            }

            // 3. Auto-Pilot Planning
            toast.message("Étape 3/3 : Génération du planning 30 jours...", { id: toastId });
            const suggestedPosts = await aiConsultant.generateCalendarChunk(socialStrategy);

            const postsToInsert = suggestedPosts.map((p: any, idx: number) => ({
                user_id: user?.id,
                title: p.title,
                platform: p.platform,
                content_type: p.content_type,
                status: 'scheduled',
                scheduled_date: addDays(new Date(), p.day_offset || idx).toISOString(),
                description: `IA Sugérée: ${p.title}.`
            }));
            await supabase.from('scheduled_posts').insert(postsToInsert);

            toast.success("Mission Accomplie ! Audit, Stratégie et Planning 30j créés ✨", { id: toastId });
            setShowTurboDialog(false);

            // Redirect or show summary
            toast.info("Consultez votre nouveau calendrier de publication !");
        } catch (error) {
            console.error(error);
            toast.error("Échec de la Mission Turbo", { id: toastId });
        } finally {
            setAnalyzing(false);
            setIsTurbo(false);
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

            <div className="space-y-4">
                <SiteAnalyzer onAnalyze={handleAnalyze} isAnalyzing={analyzing && !isTurbo} />
                <div className="flex justify-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-primary font-bold gap-2 hover:bg-primary/5"
                        onClick={() => setShowTurboDialog(true)}
                        disabled={analyzing}
                    >
                        <Zap className="w-4 h-4 fill-primary" /> Mode Turbo : Tout faire en 1 clic
                    </Button>
                </div>
            </div>

            <TurboMissionDialog
                isOpen={showTurboDialog}
                onClose={() => setShowTurboDialog(false)}
                onStart={handleTurboMission}
                isProcessing={isTurbo}
            />

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
