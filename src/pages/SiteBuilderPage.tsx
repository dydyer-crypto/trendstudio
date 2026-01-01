
import { useEffect, useState } from "react";
import { SiteCard, Website } from "@/components/sites/SiteCard";
import { TemplateSelector } from "@/components/sites/TemplateSelector";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { supabase } from "@/db/supabase";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SiteBuilderPage() {
    const [websites, setWebsites] = useState<Website[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [step, setStep] = useState<'templates' | 'details'>('templates');
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [newSiteName, setNewSiteName] = useState("");

    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchWebsites = async () => {
        try {
            setLoading(true);
            if (!user) return;

            const { data, error } = await supabase
                .from("websites")
                .select("*")
                .order("updated_at", { ascending: false });

            if (error) throw error;

            setWebsites(data as Website[]);
        } catch (error) {
            console.error("Error fetching websites:", error);
            toast.error("Erreur lors du chargement des sites");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchWebsites();
    }, [user]);

    const handleCreateStart = () => {
        setStep('templates');
        setSelectedTemplate(null);
        setNewSiteName("");
        setIsCreating(true);
    };

    const handleTemplateSelect = (templateId: string) => {
        setSelectedTemplate(templateId);
        setStep('details');
    };

    const handleCreateSubmit = async () => {
        if (!selectedTemplate || !newSiteName.trim()) return;

        try {
            if (!user) throw new Error("User not authenticated");

            const { data, error } = await supabase
                .from("websites")
                .insert({
                    user_id: user.id,
                    name: newSiteName,
                    template: selectedTemplate,
                    status: 'draft',
                    Project_id: null
                })
                .select() // Add select to verify the object is returned
                .single();

            if (error) {
                console.error("Supabase insert error:", error); // Log full error details
                throw error;
            }

            toast.success("Site créé avec succès !");
            setIsCreating(false);
            fetchWebsites();

            // Navigate to editor for the new site
            if (data) {
                navigate(`/site-editor/${data.id}`);
            }

        } catch (error: any) {
            console.error("Error creating website:", error);
            toast.error(`Erreur lors de la création: ${error.message || 'Unknown error'}`);
        }
    };

    if (!user) {
        return <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /></div>
    }

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Constructeur de Site</h1>
                    <p className="text-muted-foreground mt-2">
                        Créez et gérez vos sites web professionnels sans code.
                    </p>
                </div>
                <Button onClick={handleCreateStart}>
                    <Plus className="mr-2 h-4 w-4" /> Nouveau Site
                </Button>
            </div>

            {loading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 rounded-lg bg-muted animate-pulse" />
                    ))}
                </div>
            ) : websites.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {websites.map((site) => (
                        <SiteCard
                            key={site.id}
                            website={site}
                            onEdit={(s) => navigate(`/site-editor/${s.id}`)}
                            onManage={(s) => toast.info(`Gestion de ${s.name} à venir`)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 border-2 border-dashed rounded-lg bg-muted/10">
                    <h3 className="text-xl font-semibold mb-2">Aucun site pour le moment</h3>
                    <p className="text-muted-foreground mb-6">Commencez par créer votre premier site web.</p>
                    <Button onClick={handleCreateStart}>Créer mon premier site</Button>
                </div>
            )}

            <Dialog open={isCreating} onOpenChange={setIsCreating}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>
                            {step === 'templates' ? "Choisir un modèle" : "Détails du site"}
                        </DialogTitle>
                        <DialogDescription>
                            {step === 'templates' ? "Sélectionnez un point de départ pour votre site." : "Donnez un nom à votre nouveau site."}
                        </DialogDescription>
                    </DialogHeader>

                    {step === 'templates' ? (
                        <div className="py-4">
                            <TemplateSelector selectedTemplateId={selectedTemplate} onSelect={handleTemplateSelect} />
                        </div>
                    ) : (
                        <div className="py-4 space-y-4 max-w-md mx-auto">
                            <div className="space-y-2">
                                <Label>Nom du site</Label>
                                <Input
                                    placeholder="Mon Super Site"
                                    value={newSiteName}
                                    onChange={(e) => setNewSiteName(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleCreateSubmit()}
                                />
                            </div>
                            <div className="flex gap-2 justify-end pt-4">
                                <Button variant="outline" onClick={() => setStep('templates')}>Retour</Button>
                                <Button onClick={handleCreateSubmit} disabled={!newSiteName.trim()}>Créer le site</Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
