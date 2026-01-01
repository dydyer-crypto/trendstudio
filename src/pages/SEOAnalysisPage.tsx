
import { SEODashboard } from "@/components/seo/SEODashboard";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export default function SEOAnalysisPage() {
    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Analyse SEO</h1>
                    <p className="text-muted-foreground mt-2">
                        Optimisez votre référencement et suivez vos positions sur Google.
                    </p>
                </div>
                <Button variant="outline">
                    <Settings className="mr-2 h-4 w-4" /> Configurer
                </Button>
            </div>

            <SEODashboard />
        </div>
    );
}
