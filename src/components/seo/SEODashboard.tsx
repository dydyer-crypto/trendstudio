import { AuditPanel } from "./AuditPanel";
import { KeywordTracker } from "./KeywordTracker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { toast } from "sonner";
import { aiConsultant, type SEOReport } from "@/services/aiConsultant";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Sparkles } from "lucide-react";

export function SEODashboard() {
    const [loading, setLoading] = useState(false);
    const [url, setUrl] = useState("");
    const [report, setReport] = useState<SEOReport | null>(null);

    const handleRunAudit = async (customUrl?: string) => {
        const targetUrl = customUrl || url;
        if (!targetUrl) {
            toast.error("Veuillez entrer une URL à analyser");
            return;
        }

        setLoading(true);
        setReport(null);
        toast.info("L'IA Consultant analyse votre SEO...");

        try {
            const result = await aiConsultant.analyzeSEO(targetUrl);
            setReport(result);
            toast.success("Analyse SEO terminée ! ✨");
        } catch (error) {
            console.error(error);
            toast.error("Échec de l'analyse SEO");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-xl border shadow-sm">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="https://votre-site.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="pl-10 h-12 bg-muted/30"
                        disabled={loading}
                    />
                </div>
                <Button
                    onClick={() => handleRunAudit()}
                    disabled={loading || !url}
                    size="lg"
                    className="h-12 px-8 gap-2 gradient-primary"
                >
                    {loading ? "Analyse..." : <><Sparkles size={18} /> Analyser</>}
                </Button>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger value="overview">Audit & Scores IA</TabsTrigger>
                    <TabsTrigger value="keywords">Suggestions Mots-clés</TabsTrigger>
                    <TabsTrigger value="backlinks">Backlinks</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <AuditPanel onRunAudit={handleRunAudit} loading={loading} report={report} />
                </TabsContent>

                <TabsContent value="keywords" className="space-y-4">
                    <KeywordTracker suggestions={report?.keywords} />
                </TabsContent>

                <TabsContent value="backlinks">
                    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl bg-muted/10 text-center">
                        <div className="bg-primary/10 p-4 rounded-full mb-4">
                            <Search className="h-8 w-8 text-primary opacity-50" />
                        </div>
                        <h3 className="text-lg font-bold mb-1">Module Backlinks</h3>
                        <p className="text-muted-foreground max-w-xs">Analyse sémantique des liens entrants en cours d'optimisation.</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
