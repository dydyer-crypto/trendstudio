
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Network, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Webhook {
    id: string;
    name: string;
    url: string;
    is_active: boolean;
    events: string[];
}

interface WebhookConfigProps {
    webhooks: Webhook[];
}

export function WebhookConfig({ webhooks }: WebhookConfigProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newHook, setNewHook] = useState({ name: '', url: '' });

    const handleAdd = () => {
        // Mock add logic
        toast.success("Webhook ajouté");
        setIsDialogOpen(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium flex items-center gap-2">
                    <Network className="h-5 w-5" /> Webhooks
                </h3>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Ajouter</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Configurer un Webhook</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Nom</Label>
                                <Input value={newHook.name} onChange={e => setNewHook({ ...newHook, name: e.target.value })} placeholder="ex: CRM Djaboo" />
                            </div>
                            <div className="space-y-2">
                                <Label>URL de callback</Label>
                                <Input value={newHook.url} onChange={e => setNewHook({ ...newHook, url: e.target.value })} placeholder="https://..." />
                            </div>
                            <Button className="w-full" onClick={handleAdd}>Sauvegarder</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>URL</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {webhooks.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">Aucun webhook configuré</TableCell>
                            </TableRow>
                        ) : (
                            webhooks.map(hook => (
                                <TableRow key={hook.id}>
                                    <TableCell className="font-medium">{hook.name}</TableCell>
                                    <TableCell className="font-mono text-xs max-w-[200px] truncate">{hook.url}</TableCell>
                                    <TableCell>
                                        <Switch checked={hook.is_active} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
