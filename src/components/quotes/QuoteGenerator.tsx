
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Sparkles, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface QuoteGeneratorProps {
    onSave: (quoteData: any) => void;
    onCancel: () => void;
}

export function QuoteGenerator({ onSave, onCancel }: QuoteGeneratorProps) {
    const [clientName, setClientName] = useState("");
    const [projectType, setProjectType] = useState("");
    const [items, setItems] = useState<{ description: string, price: number }[]>([
        { description: "Création site web vitrine", price: 1500 }
    ]);

    const total = items.reduce((sum, item) => sum + item.price, 0);

    const handleAddItem = () => {
        setItems([...items, { description: "", price: 0 }]);
    };

    const handleUpdateItem = (index: number, field: 'description' | 'price', value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleGenerateAI = async () => {
        if (!projectType) return toast.error("Sélectionnez un type de projet");
        toast.info("Génération du devis par IA...");

        // Mock AI generation
        setTimeout(() => {
            if (projectType === 'website') {
                setItems([
                    { description: "Design UI/UX personnalisé", price: 800 },
                    { description: "Développement Front-end React", price: 1200 },
                    { description: "Intégration CMS & Back-office", price: 600 },
                    { description: "Optimisation SEO de base", price: 400 },
                    { description: "Formation administration", price: 200 },
                ]);
            } else if (projectType === 'seo') {
                setItems([
                    { description: "Audit technique complet", price: 500 },
                    { description: "Recherche de mots-clés", price: 300 },
                    { description: "Optimisation On-page (10 pages)", price: 800 },
                    { description: "Stratégie de contenu", price: 400 },
                ]);
            }
            toast.success("Suggestions générées !");
        }, 1500);
    };

    const handleSubmit = () => {
        if (!clientName || !projectType) {
            return toast.error("Veuillez remplir les informations client");
        }

        onSave({
            client_name: clientName,
            project_type: projectType,
            items,
            total_amount: total
        });
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                    <Label>Nom du Client</Label>
                    <Input
                        placeholder="Entreprise SAS"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Type de Projet</Label>
                    <div className="flex gap-2">
                        <Select value={projectType} onValueChange={setProjectType}>
                            <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Choisir..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="website">Création Site Web</SelectItem>
                                <SelectItem value="seo">Audit & SEO</SelectItem>
                                <SelectItem value="content">Stratégie de Contenu</SelectItem>
                                <SelectItem value="social">Social Media</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="secondary" onClick={handleGenerateAI} disabled={!projectType}>
                            <Sparkles className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <Card className="bg-muted/30">
                <CardContent className="pt-6 space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <Label>Prestations</Label>
                        <Button variant="ghost" size="sm" onClick={handleAddItem}><Plus className="h-4 w-4 mr-1" /> Ajouter</Button>
                    </div>

                    {items.map((item, idx) => (
                        <div key={idx} className="flex gap-2 items-end">
                            <div className="flex-1 space-y-1">
                                <Input
                                    placeholder="Description"
                                    value={item.description}
                                    onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                                />
                            </div>
                            <div className="w-32 space-y-1">
                                <Input
                                    type="number"
                                    placeholder="Prix"
                                    value={item.price}
                                    onChange={(e) => handleUpdateItem(idx, 'price', parseFloat(e.target.value) || 0)}
                                />
                            </div>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleRemoveItem(idx)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}

                    <div className="pt-4 border-t flex justify-between items-center text-lg font-bold">
                        <span>Total HT</span>
                        <span>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(total)}</span>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onCancel}>Annuler</Button>
                <Button onClick={handleSubmit}>Créer le devis</Button>
            </div>
        </div>
    );
}
