
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Target, Zap, ShieldAlert, TrendingDown, Swords, Search, Globe, ChevronRight } from 'lucide-react';
import { aiConsultant } from '@/services/aiConsultant';
import { supabase } from '@/db/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function CompetitorPage() {
    const { user } = useAuth();
    const [url, setUrl] = useState('');
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);

    const handleAnalyze = async () => {
        if (!url) return;
        setAnalyzing(true);
        const toastId = toast.loading("TrendStudio Espion IA en infiltration...");

        try {
            toast.message("Scan du concurrent et extraction des données...", { id: toastId });
            const result = await aiConsultant.analyzeCompetitor(url);

            setAnalysis(result);

            if (user) {
                await supabase.from('competitor_analyses').insert({
                    user_id: user.id,
                    competitor_url: url,
                    competitor_name: result.competitor_name,
                    results: result
                });
            }

            toast.success("Infiltration réussie ! Analyse terminée.", { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error("Échec de l'espionnage", { id: toastId });
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-bold mb-2">
                        <Swords size={14} /> Espionnage & Stratégie Offensive
                    </div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Analyseur de Concurrence</h1>
                    <p className="text-muted-foreground">Découvrez les secrets de vos concurrents pour mieux les dépasser.</p>
                </div>
            </div>

            <Card className="border-2 border-primary/10 shadow-lg">
                <CardContent className="p-8">
                    <div className="max-w-2xl mx-auto space-y-4 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                            <Target size={32} />
                        </div>
                        <h2 className="text-2xl font-bold italic underline decoration-primary">Cible de l'infiltration</h2>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <Input
                                    placeholder="https://concurrent-direct.com"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="pl-10 h-12"
                                />
                            </div>
                            <Button
                                onClick={handleAnalyze}
                                disabled={analyzing || !url}
                                className="h-12 px-8 gradient-primary font-bold shadow-lg"
                            >
                                {analyzing ? <Zap className="animate-spin mr-2" /> : <Search className="mr-2" />}
                                Lancer l'Espion IA
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {analysis && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Main Analysis */}
                    <Card className="lg:col-span-2 border-2 border-primary/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Badge className="bg-red-500">RAPPORT D'ESPIONNAGE</Badge>
                                {analysis.competitor_name}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10 space-y-2">
                                    <h4 className="font-bold flex items-center gap-2 text-green-600">
                                        <Zap size={16} /> Points Forts
                                    </h4>
                                    <ul className="text-sm space-y-1 text-muted-foreground">
                                        {analysis.strengths.map((s: any, i: number) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <ChevronRight size={14} className="mt-1 shrink-0" /> {s}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 space-y-2">
                                    <h4 className="font-bold flex items-center gap-2 text-red-600">
                                        <ShieldAlert size={16} /> Points Faibles (À exploiter)
                                    </h4>
                                    <ul className="text-sm space-y-1 text-muted-foreground">
                                        {analysis.weaknesses.map((w: any, i: number) => (
                                            <li key={i} className="flex items-start gap-2 text-red-700/80">
                                                <TrendingDown size={14} className="mt-1 shrink-0" /> {w}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-bold flex items-center gap-2">
                                    <Search size={16} className="text-primary" /> Stratégie de Contenu Détectée
                                </h4>
                                <p className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-xl italic">
                                    "{analysis.content_strategy}"
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-bold text-lg flex items-center gap-2">
                                    <Swords size={20} className="text-primary" /> Strategie de Domination (Kill Points)
                                </h4>
                                <div className="grid gap-2">
                                    {analysis.kill_points.map((kp: any, i: number) => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                                            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                                                {i + 1}
                                            </div>
                                            <span className="text-sm font-medium">{kp}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sidebar: Action Plan */}
                    <div className="space-y-6">
                        <Card className="gradient-primary text-white border-none shadow-xl">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap /> Plan d'Attaque Direct
                                </CardTitle>
                                <CardDescription className="text-white/80">
                                    Actions immédiates pour gagner des parts de marché.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-4">
                                    {analysis.recommended_action_plan.map((ap: any, i: number) => (
                                        <li key={i} className="flex items-start gap-3 bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                                            <div className="mt-1"><Sparkles size={16} className="text-yellow-300" /></div>
                                            <span className="text-sm font-bold">{ap}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button className="w-full mt-6 bg-white text-primary hover:bg-slate-100 font-bold h-12">
                                    Générer le Devis Social IA
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border-2 border-amber-500/20 bg-amber-500/5">
                            <CardContent className="p-4 space-y-3">
                                <div className="flex items-center gap-2 text-amber-600 font-bold">
                                    <ShieldAlert size={18} /> Rappel Stratégique
                                </div>
                                <p className="text-xs text-amber-900/70 italic leading-relaxed">
                                    Les failles détectées dans le SEO et la stratégie sociale de votre concurrent sont vos plus grandes opportunités de croissance organique.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
