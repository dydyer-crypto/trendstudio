
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/db/supabase";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

interface IdeaGeneratorProps {
    onIdeasGenerated: () => void;
}

export function IdeaGenerator({ onIdeasGenerated }: IdeaGeneratorProps) {
    const [topic, setTopic] = useState("");
    const [category, setCategory] = useState("social");
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    const handleGenerate = async () => {
        if (!topic.trim()) {
            toast.error("Veuillez entrer un sujet ou une niche");
            return;
        }

        setLoading(true);
        try {
            if (!user) throw new Error("User not authenticated");

            // Mock generation logic for now - replace with real API call later
            // We simulate generating 3 ideas based on the topic
            const mockIdeas = [
                {
                    title: `Top 5 astuces pour ${topic}`,
                    description: `Une vidéo courte et dynamique présentant 5 astuces méconnues sur ${topic} pour engager votre audience.`,
                    trend_score: Math.floor(Math.random() * 40) + 60,
                    keywords: [topic, "astuces", "guide"]
                },
                {
                    title: `L'erreur n°1 à éviter en ${topic}`,
                    description: `Démystifiez une idée reçue courante sur ${topic} et expliquez comment faire correctement.`,
                    trend_score: Math.floor(Math.random() * 40) + 60,
                    keywords: [topic, "erreur", "conseil"]
                },
                {
                    title: `Tutoriel complet : ${topic} pour débutants`,
                    description: `Guide étape par étape pour maitriser les bases de ${topic} en moins de 10 minutes.`,
                    trend_score: Math.floor(Math.random() * 40) + 60,
                    keywords: [topic, "tutoriel", "débutant"]
                }
            ];

            const ideasToInsert = mockIdeas.map(idea => ({
                user_id: user.id,
                title: idea.title,
                description: idea.description,
                category: category,
                trend_score: idea.trend_score,
                keywords: idea.keywords,
                status: 'idea'
            }));

            const { error } = await supabase.from('ideas').insert(ideasToInsert);

            if (error) throw error;

            toast.success("3 nouvelles idées générées !");
            setTopic("");
            onIdeasGenerated();

        } catch (error) {
            console.error("Error generating ideas:", error);
            toast.error("Erreur lors de la génération");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6 border border-primary/10 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 w-full space-y-2">
                    <label className="text-sm font-medium">Sujet ou Niche</label>
                    <Input
                        placeholder="Ex: Fitness, Marketing, Cuisine végane..."
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="bg-background"
                        onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                    />
                </div>
                <div className="w-full md:w-48 space-y-2">
                    <label className="text-sm font-medium">Format</label>
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="social">Réseaux Sociaux</SelectItem>
                            <SelectItem value="video">Vidéo YouTube</SelectItem>
                            <SelectItem value="article">Article de Blog</SelectItem>
                            <SelectItem value="website">Site Web</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleGenerate} disabled={loading} className="w-full md:w-auto min-w-[140px]">
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Génération...
                        </>
                    ) : (
                        <>
                            <Sparkles className="mr-2 h-4 w-4" /> Générer
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
