
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, Settings, ExternalLink, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export interface Website {
    id: string;
    name: string;
    domain: string | null;
    template: string;
    status: 'draft' | 'published' | 'maintenance';
    created_at: string;
    updated_at: string;
    published_at: string | null;
}

interface SiteCardProps {
    website: Website;
    onEdit: (website: Website) => void;
    onManage: (website: Website) => void;
}

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    draft: "secondary",
    published: "default",
    maintenance: "destructive",
};

const statusLabels: Record<string, string> = {
    draft: "Brouillon",
    published: "En ligne",
    maintenance: "Maintenance",
};


export function SiteCard({ website, onEdit, onManage }: SiteCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-lg text-primary">
                            <Globe size={24} />
                        </div>
                        <div>
                            <CardTitle className="text-lg">{website.name}</CardTitle>
                            <div className="text-xs text-muted-foreground mt-1">
                                {website.domain || "Aucun domaine connecté"}
                            </div>
                        </div>
                    </div>
                    <Badge variant={statusColors[website.status]}>{statusLabels[website.status]}</Badge>
                </div>
            </CardHeader>
            <CardContent className="pb-3">
                <div className="text-sm text-muted-foreground">
                    Modifié {formatDistanceToNow(new Date(website.updated_at), { addSuffix: true, locale: fr })}
                </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-0 border-t bg-muted/20 p-4">
                <Button variant="outline" size="sm" onClick={() => onManage(website)}>
                    <Settings className="mr-2 h-4 w-4" /> Gérer
                </Button>
                <div className="flex gap-2">
                    <Button variant="default" size="sm" onClick={() => onEdit(website)}>
                        <Edit className="mr-2 h-4 w-4" /> Éditer
                    </Button>
                    {website.status === 'published' && (
                        <Button variant="ghost" size="icon" className="h-9 w-9">
                            <ExternalLink size={16} />
                        </Button>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
}
