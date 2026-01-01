
import { useEffect, useState } from "react";
import { ProjectStats } from "@/components/projects/ProjectStats";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { Project } from "@/components/projects/ProjectCard";
import { supabase } from "@/db/supabase";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const fetchProjects = async () => {
        try {
            setLoading(true);
            if (!user) return;

            const { data, error } = await supabase
                .from("projects")
                .select("*")
                .order("updated_at", { ascending: false });

            if (error) {
                throw error;
            }

            setProjects(data as Project[]);
        } catch (error) {
            console.error("Error fetching projects:", error);
            toast.error("Erreur lors du chargement des projets");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchProjects();
        }
    }, [user]);

    const handleDelete = async (project: Project) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) return;

        try {
            const { error } = await supabase
                .from("projects")
                .delete()
                .eq("id", project.id);

            if (error) throw error;

            toast.success("Projet supprimé");
            fetchProjects();
        } catch (error) {
            console.error("Error deleting project:", error);
            toast.error("Erreur lors de la suppression");
        }
    };

    const handleEdit = (project: Project) => {
        // TODO: Implement edit functionality (dialog or page)
        toast.info("Modification à venir bientôt");
    };

    if (!user) {
        return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /></div>
    }

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Mes Projets</h1>
                <p className="text-muted-foreground mt-2">
                    Gérez vos créations de contenu, sites web et analyses SEO.
                </p>
            </div>

            <ProjectStats projects={projects} />

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold tracking-tight">Liste des projets</h2>
                </div>
                <ProjectGrid
                    projects={projects}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onProjectCreated={fetchProjects}
                />
            </div>
        </div>
    );
}
