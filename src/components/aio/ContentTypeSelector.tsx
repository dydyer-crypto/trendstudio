
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Layout, ShoppingBag, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type ContentType = 'article' | 'page' | 'product' | 'meta';

interface ContentTypeSelectorProps {
    selectedType: ContentType | null;
    onSelect: (type: ContentType) => void;
}

const types: { id: ContentType; name: string; description: string; icon: any }[] = [
    {
        id: 'article',
        name: 'Article de Blog',
        description: 'Article complet optimisé pour le SEO.',
        icon: FileText
    },
    {
        id: 'page',
        name: 'Page Web',
        description: 'Structure et contenu pour landing pages.',
        icon: Layout
    },
    {
        id: 'product',
        name: 'Fiche Produit',
        description: 'Description persuasive pour e-commerce.',
        icon: ShoppingBag
    },
    {
        id: 'meta',
        name: 'Metadonnées',
        description: 'Titres et descriptions pour Google.',
        icon: Search
    },
];

export function ContentTypeSelector({ selectedType, onSelect }: ContentTypeSelectorProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {types.map((type) => {
                const Icon = type.icon;
                return (
                    <Card
                        key={type.id}
                        className={cn(
                            "cursor-pointer transition-all hover:bg-muted/50 border-2",
                            selectedType === type.id ? "border-primary" : "border-transparent"
                        )}
                        onClick={() => onSelect(type.id)}
                    >
                        <CardHeader>
                            <div className="mb-2 p-2 w-fit rounded-md bg-primary/10 text-primary">
                                <Icon size={24} />
                            </div>
                            <CardTitle className="text-base">{type.name}</CardTitle>
                            <CardDescription className="text-xs">{type.description}</CardDescription>
                        </CardHeader>
                    </Card>
                );
            })}
        </div>
    );
}
