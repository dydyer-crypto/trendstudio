
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

export function SEOOptimizer() {
    const [useKeywords, setUseKeywords] = useState(true);
    const [autoLinks, setAutoLinks] = useState(false);
    const [tone, setTone] = useState([50]); // 0 = Professional, 100 = Creative

    return (
        <div className="space-y-6 rounded-lg border p-4 bg-muted/20">
            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <Label className="text-base">Optimisation Mots-clés</Label>
                    <p className="text-sm text-muted-foreground">Intégrer naturellement les mots-clés cibles.</p>
                </div>
                <Switch checked={useKeywords} onCheckedChange={setUseKeywords} />
            </div>

            {useKeywords && (
                <div className="space-y-2">
                    <Label>Mots-clés cibles (séparés par des virgules)</Label>
                    <Input placeholder="ex: agence seo, audit gratuit, expert référencement" />
                </div>
            )}

            <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                    <Label className="text-base">Maillage Interne Auto</Label>
                    <p className="text-sm text-muted-foreground">Suggérer des liens vers vos autres pages.</p>
                </div>
                <Switch checked={autoLinks} onCheckedChange={setAutoLinks} />
            </div>

            <div className="space-y-4 pt-2">
                <div className="flex justify-between">
                    <Label>Ton de la rédaction</Label>
                    <span className="text-xs text-muted-foreground">
                        {tone[0] < 30 ? "Professionnel" : tone[0] > 70 ? "Créatif" : "Équilibré"}
                    </span>
                </div>
                <Slider defaultValue={[50]} max={100} step={1} onValueChange={setTone} className="w-full" />
            </div>
        </div>
    );
}
