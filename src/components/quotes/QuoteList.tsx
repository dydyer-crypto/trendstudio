
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, MoreHorizontal, Download } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { crmService } from "@/services/crm";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { supabase } from "@/db/supabase";

interface Quote {
    id: string;
    client_name: string;
    project_type: string;
    total_amount: number;
    status: 'draft' | 'sent' | 'accepted' | 'rejected';
    created_at: string;
}

interface QuoteListProps {
    quotes: Quote[];
    loading: boolean;
}

export function QuoteList({ quotes, loading }: QuoteListProps) {
    const { user } = useAuth();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'accepted': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'sent': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'draft': return 'Brouillon';
            case 'sent': return 'Envoyé';
            case 'accepted': return 'Accepté';
            case 'rejected': return 'Refusé';
            default: return status;
        }
    };

    const handleSendToCRM = async (quote: any) => {
        if (!user) return;

        const toastId = toast.loading("Envoi au CRM...");
        try {
            const webhooks = await crmService.getWebhooks(user.id);
            const activeHooks = webhooks.filter(h => h.is_active);

            if (activeHooks.length === 0) {
                toast.error("Aucun webhook CRM actif configuré", { id: toastId });
                return;
            }

            let success = false;
            for (const hook of activeHooks) {
                const res = await crmService.sendQuoteToCRM(hook.url, quote);
                if (res) success = true;
            }

            if (success) {
                await supabase.from('quotes').update({ status: 'sent' }).eq('id', quote.id);
                toast.success("Devis envoyé au CRM !", { id: toastId });
                window.location.reload();
            } else {
                toast.error("Erreur lors de l'envoi", { id: toastId });
            }
        } catch (error) {
            toast.error("Une erreur est survenue", { id: toastId });
        }
    };

    if (loading) {
        return <div className="space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}
        </div>
    }

    if (quotes.length === 0) {
        return (
            <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/10">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                <h3 className="text-lg font-medium">Aucun devis</h3>
                <p className="text-muted-foreground">Créez votre premier devis pour commencer.</p>
            </div>
        )
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Client</TableHead>
                        <TableHead>Projet</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Montant</TableHead>
                        <TableHead className="text-center">Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {quotes.map((quote) => (
                        <TableRow key={quote.id}>
                            <TableCell className="font-medium">{quote.client_name}</TableCell>
                            <TableCell>{quote.project_type}</TableCell>
                            <TableCell className="text-muted-foreground">
                                {format(new Date(quote.created_at), 'dd MMM yyyy', { locale: fr })}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(quote.total_amount)}
                            </TableCell>
                            <TableCell className="text-center">
                                <Badge variant="outline" className={getStatusColor(quote.status)}>
                                    {getStatusLabel(quote.status)}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem>
                                            <FileText className="mr-2 h-4 w-4" /> Voir les détails
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleSendToCRM(quote)}>
                                            <Send className="mr-2 h-4 w-4" /> Envoyer au CRM
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Download className="mr-2 h-4 w-4" /> Télécharger PDF
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
