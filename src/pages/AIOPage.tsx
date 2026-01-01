
import { useState } from "react";
import { ContentTypeSelector, ContentType } from "@/components/aio/ContentTypeSelector";
import { SEOOptimizer } from "@/components/aio/SEOOptimizer";
import { AIOEditor } from "@/components/aio/AIOEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/db/supabase";
import { useAuth } from "@/contexts/AuthContext";

export default function AIOPage() {
    const [contentType, setContentType] = useState<ContentType | null>(null);
    const [topic, setTopic] = useState("");
    const [generatedContent, setGeneratedContent] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const { user } = useAuth();

    const handleGenerate = async () => {
        if (!topic.trim() || !contentType) {
            toast.error("Veuillez sélectionner un type et entrer un sujet");
            return;
        }

        setIsGenerating(true);
        try {
            // Mock AI Generation delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Mock response
            const mockResponse = `Voici un brouillon de contenu généré pour : ${topic}.\n\n` +
                `Type de contenu : ${contentType}\n\n` +
                `Introduction:\n` +
                `Dans le monde compétitif d'aujourd'hui, maitriser ${topic} est essentiel. ` +
                `Découvrons ensemble les points clés.\n\n` +
                `Point 1: L'importance de la stratégie\n` +
                `Une approche bien définie vous permet de gagner du temps et d'optimiser vos résultats. ` +
                `N'oubliez pas d'analyser vos concurrents.\n\n` +
                `Conclusion:\n` +
                `En résumé, ${topic} offre de nombreuses opportunités si vous l'abordez avec sérieux.`;

            setGeneratedContent(mockResponse);
            toast.success("Contenu généré avec succès !");

        } catch (error) {
            console.error("Generation error:", error);
            toast.error("Erreur lors de la génération");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!user) return;
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
            toast.success("Contenu sauvegardé dans votre bibliothèque");
        } catch (error) {
            console.error("Save error:", error);
            toast.error("Impossible de sauvegarder");
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Générateur AIO</h1>
                <p className="text-muted-foreground mt-2">
                    Créez du contenu optimisé SEO en quelques secondes grâce à l'IA unifiée.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Configuration */}
                <div className="lg:col-span-4 space-y-8">
                    <section className="space-y-4">
                        <Label className="text-lg font-semibold">1. Type de contenu</Label>
                        <ContentTypeSelector selectedType={contentType} onSelect={setContentType} />
                    </section>

                    <section className="space-y-4">
                        <Label className="text-lg font-semibold">2. Sujet principal</Label>
                        <Input
                            placeholder="De quoi voulez-vous parler ?"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                        />
                    </section>

                    <section className="space-y-4">
                        <Label className="text-lg font-semibold">3. Paramètres SEO</Label>
                        <SEOOptimizer />
                    </section>

                    <Button
                        size="lg"
                        className="w-full"
                        onClick={handleGenerate}
                        disabled={isGenerating || !contentType || !topic}
                    >
                        {isGenerating ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Génération en cours...</>
                        ) : (
                            <><Sparkles className="mr-2 h-4 w-4" /> Générer le contenu</>
                        )}
                    </Button>
                </div>

                {/* Right Column: Editor */}
                <div className="lg:col-span-8">
                    <div className="bg-background rounded-xl border shadow-sm p-6 h-full">
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
