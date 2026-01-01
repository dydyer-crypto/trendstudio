
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SiteAnalyzerProps {
    onAnalyze: (url: string) => void;
    isAnalyzing: boolean;
}

export function SiteAnalyzer({ onAnalyze, isAnalyzing }: SiteAnalyzerProps) {
    const [url, setUrl] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) {
            toast.error("Veuillez entrer une URL");
            return;
        }
        // Basic URL validation
        try {
            new URL(url.startsWith('http') ? url : `https://${url}`);
            onAnalyze(url);
        } catch {
            toast.error("URL invalide");
        }
    };

    return (
        <Card className="p-8 bg-muted/20 border-2 border-dashed">
            <div className="max-w-xl mx-auto text-center space-y-6">
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Analysez votre site existant</h2>
                    <p className="text-muted-foreground">Entrez l'URL de votre site pour obtenir un audit complet et des recommandations de refonte.</p>
                </div>

                <form onSubmit={handleSubmit} className="flex gap-2">
                    <Input
                        placeholder="https://votre-site.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="h-12 text-lg bg-background"
                        disabled={isAnalyzing}
                    />
                    <Button type="submit" size="lg" className="h-12" disabled={isAnalyzing}>
                        {isAnalyzing ? <Loader2 className="animate-spin" /> : <Search />}
                    </Button>
                </form>
            </div>
        </Card>
    );
}
