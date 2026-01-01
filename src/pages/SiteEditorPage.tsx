
import { useParams, useNavigate } from "react-router-dom";
import { SiteEditor } from "@/components/sites/SiteEditor";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/db/supabase";

export default function SiteEditorPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [siteName, setSiteName] = useState("");

    useEffect(() => {
        const fetchSite = async () => {
            if (!id) return;
            try {
                const { data, error } = await supabase
                    .from("websites")
                    .select("name")
                    .eq("id", id)
                    .single();

                if (error) throw error;
                setSiteName(data.name);
            } catch (error) {
                console.error("Error fetching site:", error);
                toast.error("Impossible de charger le site");
                navigate("/site-builder");
            } finally {
                setLoading(false);
            }
        };

        fetchSite();
    }, [id, navigate]);

    const handleSave = async () => {
        // Logic to save page content would go here
        toast.promise(
            new Promise((resolve) => setTimeout(resolve, 1000)),
            {
                loading: 'Enregistrement...',
                success: 'Modifications enregistrées !',
                error: 'Erreur lors de l\'enregistrement',
            }
        );
    };

    if (loading) {
        return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /></div>
    }

    return (
        <div className="flex flex-col h-screen bg-background">
            <header className="border-b px-6 py-3 flex items-center gap-4 bg-background z-10">
                <Button variant="ghost" size="icon" onClick={() => navigate("/site-builder")}>
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h1 className="text-lg font-semibold">{siteName}</h1>
                    <p className="text-xs text-muted-foreground">Éditeur visuel</p>
                </div>
            </header>
            <main className="flex-1 p-6 bg-muted/20">
                <SiteEditor onSave={handleSave} />
            </main>
        </div>
    );
}
