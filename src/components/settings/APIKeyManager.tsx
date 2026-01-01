
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
import { Key, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface APIKey {
    id: string;
    provider: string;
    key_name: string;
    is_active: boolean;
    created_at: string;
}

interface APIKeyManagerProps {
    keys: APIKey[];
}

export function APIKeyManager({ keys }: APIKeyManagerProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newKey, setNewKey] = useState({ provider: 'openai', name: '', value: '' });

    const handleAddKey = () => {
        // Mock add logic
        toast.success("Clé API ajoutée avec succès");
        setIsDialogOpen(false);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium flex items-center gap-2">
                    <Key className="h-5 w-5" /> Clés API
                </h3>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Ajouter</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Ajouter une clé API</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Fournisseur</Label>
                                <Input value={newKey.provider} onChange={e => setNewKey({ ...newKey, provider: e.target.value })} placeholder="ex: openai" />
                            </div>
                            <div className="space-y-2">
                                <Label>Nom</Label>
                                <Input value={newKey.name} onChange={e => setNewKey({ ...newKey, name: e.target.value })} placeholder="ex: Ma clé GPT-4" />
                            </div>
                            <div className="space-y-2">
                                <Label>Clé</Label>
                                <Input type="password" value={newKey.value} onChange={e => setNewKey({ ...newKey, value: e.target.value })} placeholder="sk-..." />
                            </div>
                            <Button className="w-full" onClick={handleAddKey}>Sauvegarder</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Fournisseur</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {keys.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">Aucune clé configurée</TableCell>
                            </TableRow>
                        ) : (
                            keys.map(key => (
                                <TableRow key={key.id}>
                                    <TableCell className="font-medium">{key.key_name}</TableCell>
                                    <TableCell className="capitalize">{key.provider}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Switch checked={key.is_active} />
                                            <span className="text-sm text-muted-foreground">{key.is_active ? 'Actif' : 'Inactif'}</span>
                                        </div>
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
