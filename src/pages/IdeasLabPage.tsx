
import { useEffect, useState } from "react";
import { IdeaGenerator } from "@/components/ideas/IdeaGenerator";
import { IdeasGrid } from "@/components/ideas/IdeasGrid";
import { Idea } from "@/components/ideas/IdeaCard";
import { supabase } from "@/db/supabase";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function IdeasLabPage() {
    const [ideas, setIdeas] = useState<Idea[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchIdeas = async () => {
        try {
            setLoading(true);
            if (!user) return;

            const { data, error } = await supabase
                .from("ideas")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                throw error;
            }

            setIdeas(data as Idea[]);
        } catch (error) {
            console.error("Error fetching ideas:", error);
            toast.error("Erreur lors du chargement des idées");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchIdeas();
        }
    }, [user]);

    const handleDelete = async (idea: Idea) => {
        if (!confirm("Voulez-vous vraiment supprimer cette idée ?")) return;

        try {
            const { error } = await supabase
                .from("ideas")
                .delete()
                .eq("id", idea.id);

            if (error) throw error;

            toast.success("Idée supprimée");
            setIdeas(ideas.filter(i => i.id !== idea.id));
        } catch (error) {
            console.error("Error deleting idea:", error);
            toast.error("Erreur lors de la suppression");
        }
    };

    const handleToggleFavorite = async (idea: Idea) => {
        try {
            const newStatus = !idea.is_favorite;
            const { error } = await supabase
                .from("ideas")
                .update({ is_favorite: newStatus })
                .eq("id", idea.id);

            if (error) throw error;

            setIdeas(ideas.map(i => i.id === idea.id ? { ...i, is_favorite: newStatus } : i));
            if (newStatus) toast.success("Ajouté aux favoris !");

        } catch (error) {
            console.error("Error updating favorite:", error);
            toast.error("Erreur lors de la mise à jour");
        }
    };

    const handleConvert = (idea: Idea) => {
        // Logic to convert idea to post (e.g. navigate to calendar with pre-filled state)
        navigate("/calendar", { state: { initialTitle: idea.title, initialDescription: idea.description } });
        toast.info("Redirection vers le calendrier...");
    };

    if (!user) {
        return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /></div>
    }

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Laboratoire d'Idées</h1>
                <p className="text-muted-foreground mt-2">
                    Trouvez l'inspiration pour votre prochain contenu viral grâce à l'IA.
                </p>
            </div>

            <IdeaGenerator onIdeasGenerated={fetchIdeas} />

            <div className="space-y-4">
                <h2 className="text-xl font-semibold tracking-tight">Vos idées ({ideas.length})</h2>
                <IdeasGrid
                    ideas={ideas}
                    loading={loading}
                    onDelete={handleDelete}
                    onToggleFavorite={handleToggleFavorite}
                    onConvert={handleConvert}
                />
            </div>
        </div>
    );
}
