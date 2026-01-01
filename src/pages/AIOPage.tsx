import { useState } from "react";
import { ContentTypeSelector, ContentType } from "@/components/aio/ContentTypeSelector";
import { SEOOptimizer } from "@/components/aio/SEOOptimizer";
import { AIOEditor } from "@/components/aio/AIOEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, Wand2, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/db/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { aiConsultant } from "@/services/aiConsultant";
import { Badge } from "@/components/ui/badge";

export default function AIOPage() {
    const [contentType, setContentType] = useState<ContentType | null>(null);
    const [topic, setTopic] = useState("");
    const [keywords, setKeywords] = useState("");
    const [tone, setTone] = useState(50);
    const [generatedContent, setGeneratedContent] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const { user } = useAuth();

    const handleGenerate = async () => {
        if (!topic.trim() || !contentType) {
            toast.error("Veuillez sélectionner un type et entrer un sujet");
            return;
        }

        setIsGenerating(true);
        setGeneratedContent("");
        toast.info("L'IA Consultant rédige votre contenu optimisé...");

        try {
            const toneLabel = tone < 30 ? "Professionnel" : tone > 70 ? "Créatif" : "Équilibré";
            const content = await aiConsultant.generateAIOContent({
                type: contentType,
                topic,
                keywords,
                tone: toneLabel
            });

            setGeneratedContent(content);
            toast.success("Contenu généré avec succès ! ✨");
        } catch (error) {
            console.error("Generation error:", error);
            toast.error("Échec de la génération par l'IA");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!user) {
            toast.error("Vous devez être connecté pour enregistrer");
            return;
        }
        try {
            const { error } = await supabase.from('generated_content').insert({
                user_id: user.id,
                content_type: contentType,
                title: topic,
                content: generatedContent,
                word_count: generatedContent.split(/\s+/).filter(Boolean).length,
                seo_optimized: true
            });

            if (error) throw error;
            toast.success("Enregistré dans votre bibliothèque ! 📚");
        } catch (error) {
            console.error("Save error:", error);
            toast.error("Erreur lors de l'enregistrement");
        }
    };

    return (
        <div className="container mx-auto p-4 xl:p-8 space-y-8 max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl xl:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
                        Rédacteur AIO <Wand2 className="text-primary h-8 w-8" />
                    </h1>
                    <p className="text-muted-foreground text-base xl:text-lg">
                        Générez du contenu SEO premium basé sur vos stratégies d'IA Consultant.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="h-8 gap-1 border-primary/20 bg-primary/5">
                        <CheckCircle2 size={12} className="text-primary" /> IA Gemini 1.5 Pro
                    </Badge>
                    <Badge variant="outline" className="h-8 gap-1">
                        <FileText size={12} /> Mode SEO Actif
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Configuration */}
                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
                    <Card className="border-2 border-primary/5 shadow-xl">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" /> Configuration
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <Label className="text-sm font-bold uppercase tracking-wider opacity-70">1. Type de contenu</Label>
                                <ContentTypeSelector selectedType={contentType} onSelect={setContentType} />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-sm font-bold uppercase tracking-wider opacity-70">2. Votre Sujet</Label>
                                <Input
                                    placeholder="Ex: Les bienfaits du SEO pour les PME..."
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    className="h-12 bg-muted/30 border-none"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-sm font-bold uppercase tracking-wider opacity-70">3. Paramètres SEO & Ton</Label>
                                <SEOOptimizer
                                    keywords={keywords}
                                    onKeywordsChange={setKeywords}
                                    tone={tone}
                                    onToneChange={setTone}
                                />
                            </div>

                            <Button
                                size="lg"
                                className="w-full h-14 text-lg gap-2 gradient-primary shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                onClick={handleGenerate}
                                disabled={isGenerating || !contentType || !topic}
                            >
                                {isGenerating ? (
                                    <><Loader2 className="h-5 w-5 animate-spin" /> Rédaction...</>
                                ) : (
                                    <><Sparkles className="h-5 w-5" /> Générer avec l'IA</>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex gap-3 italic text-xs text-blue-700 dark:text-blue-300">
                        <Sparkles size={16} className="shrink-0" />
                        L'IA utilise maintenant l'algorithme "Semantic Flow" pour une meilleure intégration des mots-clés.
                    </div>
                </div>

                {/* Right Column: Editor */}
                <div className="lg:col-span-8 min-h-[600px] flex flex-col">
                    <div className="bg-background rounded-2xl border-2 border-muted shadow-2xl p-2 flex-1 flex flex-col overflow-hidden">
                        <AIOEditor
                            content={generatedContent}
                            onChange={setGeneratedContent}
                            onSave={handleSave}
                            isGenerating={isGenerating}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
