
import { Idea, IdeaCard } from "./IdeaCard";
import { Lightbulb } from "lucide-react";

interface IdeasGridProps {
    ideas: Idea[];
    loading: boolean;
    onDelete: (idea: Idea) => void;
    onToggleFavorite: (idea: Idea) => void;
    onConvert: (idea: Idea) => void;
}

export function IdeasGrid({ ideas, loading, onDelete, onToggleFavorite, onConvert }: IdeasGridProps) {
    if (loading) {
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-40 rounded-lg bg-muted animate-pulse" />
                ))}
            </div>
        );
    }

    if (ideas.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed rounded-lg bg-muted/10 p-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <Lightbulb className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-2">Aucune idée pour le moment</h3>
                <p className="text-muted-foreground max-w-sm">
                    Utilisez le générateur ci-dessus pour trouver l'inspiration et créer votre prochaine idée virale.
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ideas.map((idea) => (
                <IdeaCard
                    key={idea.id}
                    idea={idea}
                    onDelete={onDelete}
                    onToggleFavorite={onToggleFavorite}
                    onConvert={onConvert}
                />
            ))}
        </div>
    );
}
