
import { AuditPanel } from "./AuditPanel";
import { KeywordTracker } from "./KeywordTracker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { toast } from "sonner";

export function SEODashboard() {
    const [loading, setLoading] = useState(false);

    const handleRunAudit = () => {
        setLoading(true);
        toast.info("Lancement de l'audit SEO...");
        setTimeout(() => {
            setLoading(false);
            toast.success("Audit terminé avec succès !");
        }, 2000);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Vue d'ensemble</h2>
                    <p className="text-muted-foreground">Suivez vos performances et optimisez votre visibilité.</p>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Audit & Scores</TabsTrigger>
                    <TabsTrigger value="keywords">Mots-clés</TabsTrigger>
                    <TabsTrigger value="backlinks">Backlinks</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <AuditPanel onRunAudit={handleRunAudit} loading={loading} />
                </TabsContent>

                <TabsContent value="keywords" className="space-y-4">
                    <KeywordTracker />
                </TabsContent>

                <TabsContent value="backlinks">
                    <div className="flex items-center justify-center h-40 border-2 border-dashed rounded-lg bg-muted/10">
                        <p className="text-muted-foreground">Module d'analyse de backlinks en maintenance.</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
