
import { useState, useEffect } from "react";
import { QuoteList } from "@/components/quotes/QuoteList";
import { QuoteGenerator } from "@/components/quotes/QuoteGenerator";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/db/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function QuotesPage() {
    const [quotes, setQuotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const { user } = useAuth();

    const fetchQuotes = async () => {
        try {
            setLoading(true);
            if (!user) return;

            const { data, error } = await supabase
                .from("quotes")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setQuotes(data || []);
        } catch (error) {
            console.error("Error fetching quotes:", error);
            toast.error("Erreur lors du chargement des devis");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchQuotes();
    }, [user]);

    const handleCreateQuote = async (quoteData: any) => {
        if (!user) return;
        try {
            const { data: quote, error: quoteError } = await supabase
                .from("quotes")
                .insert({
                    user_id: user.id,
                    client_name: quoteData.client_name,
                    project_type: quoteData.project_type,
                    total_amount: quoteData.total_amount,
                    status: 'draft',
                    services: quoteData.items
                })
                .select()
                .single();

            if (quoteError) throw quoteError;

            // In a real app we would insert items into quote_items here, 
            // but for simplicity we stored services as JSONB in quotes based on the generator output
            // However, the migration created quote_items. Let's populate it too for completeness if we were using it relationally.
            // For this version, we will stick to the 'services' JSONB for display in the simple list.

            toast.success("Devis créé avec succès !");
            setIsCreating(false);
            fetchQuotes();

        } catch (error) {
            console.error("Error creating quote:", error);
            toast.error("Impossible de créer le devis");
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Devis IA</h1>
                    <p className="text-muted-foreground mt-2">
                        Générez et gérez vos devis commerciaux en quelques clics.
                    </p>
                </div>
                <Button onClick={() => setIsCreating(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Nouveau Devis
                </Button>
            </div>

            <QuoteList quotes={quotes} loading={loading} />

            <Dialog open={isCreating} onOpenChange={setIsCreating}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Nouveau Devis Intelligent</DialogTitle>
                        <DialogDescription>
                            Remplissez les détails ou laissez l'IA suggérer les prestations.
                        </DialogDescription>
                    </DialogHeader>
                    <QuoteGenerator
                        onSave={handleCreateQuote}
                        onCancel={() => setIsCreating(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
