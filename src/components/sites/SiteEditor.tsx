
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Save, Eye, Layout } from "lucide-react";

interface SiteEditorProps {
    onSave: () => void;
}

export function SiteEditor({ onSave }: SiteEditorProps) {
    return (
        <div className="flex flex-col h-[calc(100vh-200px)] border rounded-lg bg-background shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b bg-muted/30">
                <div className="flex items-center gap-2">
                    <Layout className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold">Éditeur de Page</span>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" /> Prévisualiser
                    </Button>
                    <Button size="sm" onClick={onSave}>
                        <Save className="mr-2 h-4 w-4" /> Enregistrer
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Controls */}
                <div className="w-80 border-r p-4 overflow-y-auto bg-muted/10">
                    <Tabs defaultValue="content" className="w-full">
                        <TabsList className="w-full mb-4">
                            <TabsTrigger value="content" className="flex-1">Contenu</TabsTrigger>
                            <TabsTrigger value="style" className="flex-1">Style</TabsTrigger>
                            <TabsTrigger value="seo" className="flex-1">SEO</TabsTrigger>
                        </TabsList>

                        <TabsContent value="content" className="space-y-4">
                            <div className="space-y-2">
                                <Label>Titre Principal (H1)</Label>
                                <Input placeholder="Bienvenue sur mon site" />
                            </div>
                            <div className="space-y-2">
                                <Label>Sous-titre</Label>
                                <Textarea placeholder="Une brève introduction..." />
                            </div>
                            <div className="space-y-2">
                                <Label>Texte du bouton</Label>
                                <Input placeholder="En savoir plus" />
                            </div>
                        </TabsContent>

                        <TabsContent value="style">
                            <p className="text-sm text-muted-foreground">Options de style à venir...</p>
                        </TabsContent>

                        <TabsContent value="seo">
                            <div className="space-y-2">
                                <Label>Titre SEO</Label>
                                <Input placeholder="Mon Site - Accueil" />
                            </div>
                            <div className="space-y-2">
                                <Label>Meta Description</Label>
                                <Textarea placeholder="Description pour les moteurs de recherche" />
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Preview Area */}
                <div className="flex-1 bg-muted/50 p-8 overflow-y-auto flex justify-center">
                    <div className="w-full max-w-4xl bg-white shadow-lg min-h-[500px] rounded-lg border p-8">
                        <div className="border-b pb-4 mb-6">
                            <div className="h-8 bg-gray-200 w-1/3 rounded animate-pulse mb-2"></div>
                            <div className="h-4 bg-gray-100 w-2/3 rounded animate-pulse"></div>
                        </div>
                        <div className="space-y-4">
                            <div className="h-40 bg-gray-100 rounded animate-pulse w-full"></div>
                            <div className="h-4 bg-gray-100 w-full rounded animate-pulse"></div>
                            <div className="h-4 bg-gray-100 w-full rounded animate-pulse"></div>
                            <div className="h-4 bg-gray-100 w-3/4 rounded animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
