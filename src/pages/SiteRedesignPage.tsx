
import { useState } from "react";
import { SiteAnalyzer } from "@/components/redesign/SiteAnalyzer";
import { AuditReport } from "@/components/redesign/AuditReport";
import { MigrationWizard } from "@/components/redesign/MigrationWizard";
import { supabase } from "@/db/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function SiteRedesignPage() {
    const [analyzing, setAnalyzing] = useState(false);
    const [auditResults, setAuditResults] = useState<any | null>(null);
    const [showWizard, setShowWizard] = useState(false);
    const { user } = useAuth();

    const handleAnalyze = async (url: string) => {
        setAnalyzing(true);
        setAuditResults(null);
        setShowWizard(false);

        try {
            // Mock analysis delay
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Mock results
            const mockResults = {
                url,
                performance: 65,
                seo: 42,
                mobile: 88,
                security: 90,
                issues: [
                    "Temps de chargement lent (>3s)",
                    "Balises H1 manquantes sur 3 pages",
                    "Images non optimisées"
                ],
                recommendations: [
                    "Migrer vers notre infrastructure optimisée",
                    "Restructurer le contenu pour le SEO",
                    "Utiliser le format WebP pour les images"
                ]
            };

            setAuditResults(mockResults);

            // Save to DB
            if (user) {
                await supabase.from('site_audits').insert({
                    user_id: user.id,
                    url,
                    audit_type: 'full',
                    results: mockResults,
                    score: Math.round((65 + 42 + 88 + 90) / 4),
                    issues: mockResults.issues,
                    recommendations: mockResults.recommendations
                });
            }

        } catch (error) {
            console.error("Analysis error:", error);
            toast.error("Erreur lors de l'analyse");
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">Refonte de Site Intelligente</h1>
                <p className="text-xl text-muted-foreground">
                    Analysez votre site actuel et laissez notre IA vous guider vers une version plus performante et moderne.
                </p>
            </div>

            <SiteAnalyzer onAnalyze={handleAnalyze} isAnalyzing={analyzing} />

            {auditResults && (
                <div className="space-y-8">
                    <AuditReport results={auditResults} />

                    <div className="flex justify-center pt-8">
                        <button
                            onClick={() => setShowWizard(true)}
                            className="bg-primary text-primary-foreground h-14 px-8 rounded-full text-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg animate-in zoom-in duration-300"
                        >
                            Démarrer la migration assistée
                        </button>
                    </div>
                </div>
            )}

            {showWizard && <MigrationWizard />}
        </div>
    );
}
