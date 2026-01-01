
import { Project, ProjectCard } from "./ProjectCard";
import { CreateProjectDialog } from "./CreateProjectDialog";
import { ClipboardList } from "lucide-react";

interface ProjectGridProps {
    projects: Project[];
    loading: boolean;
    onEdit: (project: Project) => void;
    onDelete: (project: Project) => void;
    onProjectCreated: () => void;
}

export function ProjectGrid({ projects, loading, onEdit, onDelete, onProjectCreated }: ProjectGridProps) {
    if (loading) {
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />
                ))}
            </div>
        );
    }

    if (projects.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-lg bg-muted/10 p-8 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
                    <ClipboardList className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight mb-2">Aucun projet</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                    Vous n'avez pas encore de projet. Créez votre premier projet pour commencer à organiser votre contenu.
                </p>
                <CreateProjectDialog onProjectCreated={onProjectCreated} />
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
                <ProjectCard
                    key={project.id}
                    project={project}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            ))}
        </div>
    );
}
