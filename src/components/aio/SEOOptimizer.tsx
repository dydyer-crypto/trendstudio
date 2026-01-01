import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

interface SEOOptimizerProps {
    keywords: string;
    onKeywordsChange: (val: string) => void;
    tone: number;
    onToneChange: (val: number) => void;
}

export function SEOOptimizer({ keywords, onKeywordsChange, tone, onToneChange }: SEOOptimizerProps) {
    const toneLabel = tone < 30 ? "Professionnel" : tone > 70 ? "Créatif" : "Équilibré";

    return (
        <div className="space-y-6 rounded-lg border p-4 bg-muted/20">
            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <Label className="text-base">Optimisation Mots-clés</Label>
                    <p className="text-sm text-muted-foreground">Intégrer naturellement les mots-clés cibles.</p>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Mots-clés cibles (séparés par des virgules)</Label>
                <Input
                    placeholder="ex: agence seo, audit gratuit"
                    value={keywords}
                    onChange={(e) => onKeywordsChange(e.target.value)}
                />
            </div>

            <div className="space-y-4 pt-2">
                <div className="flex justify-between">
                    <Label>Ton de la rédaction</Label>
                    <span className="text-xs text-muted-foreground font-bold text-primary">
                        {toneLabel}
                    </span>
                </div>
                <Slider
                    value={[tone]}
                    max={100}
                    step={1}
                    onValueChange={(val) => onToneChange(val[0])}
                    className="w-full"
                />
            </div>
        </div>
    );
}
