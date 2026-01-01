
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Folder, MoreVertical, Trash2, Edit, ExternalLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  type: 'content' | 'website' | 'seo' | 'redesign';
  status: 'draft' | 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

const typeLabels: Record<string, string> = {
  content: "Contenu",
  website: "Site Web",
  seo: "SEO",
  redesign: "Refonte",
};

const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  active: "Actif",
  completed: "Terminé",
  archived: "Archivé",
};

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft: "secondary",
  active: "default",
  completed: "outline",
  archived: "secondary",
};

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-md text-primary">
              <Folder size={18} />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold line-clamp-1">{project.name}</CardTitle>
              <div className="text-xs text-muted-foreground mt-1">
                Mis à jour {formatDistanceToNow(new Date(project.updated_at), { addSuffix: true, locale: fr })}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(project)}>
                <Edit className="mr-2 h-4 w-4" /> Modifier
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(project)}>
                <Trash2 className="mr-2 h-4 w-4" /> Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2 h-10">
          {project.description || "Aucune description"}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between pt-0 border-t bg-muted/20 p-4">
        <div className="flex gap-2">
          <Badge variant="outline">{typeLabels[project.type]}</Badge>
          <Badge variant={statusColors[project.status]}>{statusLabels[project.status]}</Badge>
        </div>
        <Button variant="ghost" size="sm" className="h-8">
            Ouvrir <ExternalLink className="ml-2 h-3 w-3" />
        </Button>
      </CardFooter>
    </Card>
  );
}
