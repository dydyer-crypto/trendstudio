
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Lightbulb, Trash2, Heart, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Idea {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    trend_score: number;
    is_favorite: boolean;
    keywords: string[] | null;
    created_at: string;
}

interface IdeaCardProps {
    idea: Idea;
    onDelete: (idea: Idea) => void;
    onToggleFavorite: (idea: Idea) => void;
    onConvert: (idea: Idea) => void;
}

export function IdeaCard({ idea, onDelete, onToggleFavorite, onConvert }: IdeaCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow relative overflow-hidden group">
            {idea.trend_score > 80 && (
                <div className="absolute top-0 right-0 bg-yellow-400 text-xs font-bold px-2 py-1 rounded-bl-lg z-10">
                    🔥 Virale
                </div>
            )}
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        <div className={cn("p-2 rounded-md", idea.is_favorite ? "bg-red-100 text-red-500" : "bg-primary/10 text-primary")}>
                            <Lightbulb size={18} />
                        </div>
                        <div className="flex-1">
                            <CardTitle className="text-base font-semibold line-clamp-1">{idea.title}</CardTitle>
                            <div className="flex gap-2 mt-1">
                                {idea.category && <Badge variant="outline" className="text-[10px] h-5">{idea.category}</Badge>}
                                {idea.trend_score > 0 && <span className="text-[10px] text-green-600 font-medium self-center">Score: {idea.trend_score}%</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pb-3">
                <p className="text-sm text-muted-foreground line-clamp-3 h-14">
                    {idea.description || "Aucune description"}
                </p>
                {idea.keywords && idea.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                        {idea.keywords.slice(0, 3).map(k => (
                            <span key={k} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">#{k}</span>
                        ))}
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-between pt-0 border-t bg-muted/20 p-3">
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500" onClick={() => onToggleFavorite(idea)}>
                        <Heart size={16} className={cn(idea.is_favorite && "fill-current text-red-500")} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDelete(idea)}>
                        <Trash2 size={16} />
                    </Button>
                </div>
                <Button size="sm" className="h-8 text-xs gap-1" onClick={() => onConvert(idea)}>
                    Planifier <ArrowRight size={12} />
                </Button>
            </CardFooter>
        </Card>
    );
}
