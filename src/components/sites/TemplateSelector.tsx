
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Template {
    id: string;
    name: string;
    description: string;
    category: string;
    image: string;
}

const templates: Template[] = [
    {
        id: "blog-modern",
        name: "Blog Moderne",
        description: "Parfait pour les créateurs de contenu et les influenceurs.",
        category: "Blog",
        image: "https://images.unsplash.com/photo-1499750310159-525446b09564?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmxvZ3xlbnwwfHwwfHx8MA%3D%3D"
    },
    {
        id: "portfolio-minimal",
        name: "Portfolio Minimal",
        description: "Mettez en avant vos projets avec élégance.",
        category: "Portfolio",
        image: "https://images.unsplash.com/photo-1545239351-ef35f43d514b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cG9ydGZvbGlvJTIwd2Vic2l0ZXxlbnwwfHwwfHx8MA%3D%3D"
    },
    {
        id: "landing-product",
        name: "Landing Page Produit",
        description: "Convertissez vos visiteurs en clients.",
        category: "Business",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8d2Vic2l0ZSUyMGxhbmRpbmd8ZW58MHx8MHx8fDA%3D"
    }
];

interface TemplateSelectorProps {
    selectedTemplateId: string | null;
    onSelect: (templateId: string) => void;
}

export function TemplateSelector({ selectedTemplateId, onSelect }: TemplateSelectorProps) {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
                <Card
                    key={template.id}
                    className={cn(
                        "cursor-pointer transition-all hover:scale-[1.02] border-2",
                        selectedTemplateId === template.id ? "border-primary shadow-lg" : "border-transparent border-border"
                    )}
                    onClick={() => onSelect(template.id)}
                >
                    <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted relative">
                        <img src={template.image} alt={template.name} className="w-full h-full object-cover" />
                        {selectedTemplateId === template.id && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                <div className="bg-primary text-white p-2 rounded-full shadow-lg">
                                    <Check size={24} />
                                </div>
                            </div>
                        )}
                    </div>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <Badge variant="outline">{template.category}</Badge>
                        </div>
                        <CardDescription>{template.description}</CardDescription>
                    </CardHeader>
                </Card>
            ))}
        </div>
    );
}
