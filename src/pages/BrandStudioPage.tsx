
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Palette, Upload, Check, Trash2, Sparkles, Wand2, Type, Layout, Plus, Image as ImageIcon, FileText, X } from 'lucide-react';
import { supabase } from '@/db/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { brandKitService, type BrandKit, type BrandAsset } from '@/services/brandKitService';
import { useSupabaseUpload } from '@/hooks/use-supabase-upload';

export default function BrandStudioPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [brandKits, setBrandKits] = useState<BrandKit[]>([]);
    const [currentKit, setCurrentKit] = useState<BrandKit | null>(null);
    const [brandAssets, setBrandAssets] = useState<BrandAsset[]>([]);
    const [selectedFont, setSelectedFont] = useState('Inter');

    // Upload functionality for logo
    const uploadHook = useSupabaseUpload({
        bucketName: 'trendstudio-images',
        path: user?.id ? `brand-assets/${user.id}` : '',
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'],
        maxFileSize: 5 * 1024 * 1024, // 5MB
        maxFiles: 1,
        supabase
    });

    const googleFonts = [
        'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
        'Poppins', 'Nunito', 'Oswald', 'Raleway', 'Ubuntu'
    ];

    useEffect(() => {
        if (user) loadBrandData();
    }, [user]);

    const loadBrandData = async () => {
        try {
            setLoading(true);
            const [kits, activeKit] = await Promise.all([
                brandKitService.getBrandKits(user!.id),
                brandKitService.getActiveBrandKit(user!.id)
            ]);

            setBrandKits(kits);

            if (activeKit) {
                setCurrentKit(activeKit);
                const assets = await brandKitService.getBrandAssets(activeKit.id);
                setBrandAssets(assets);
            } else if (kits.length > 0) {
                // Set first kit as active if none is active
                await brandKitService.setActiveBrandKit(user!.id, kits[0].id);
                setCurrentKit(kits[0]);
                const assets = await brandKitService.getBrandAssets(kits[0].id);
                setBrandAssets(assets);
            }
        } catch (error) {
            console.error('Error loading brand data:', error);
            toast.error('Erreur lors du chargement des données de marque');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!currentKit || !user) return;

        const toastId = toast.loading("Sauvegarde de l'identité visuelle...");
        try {
            await brandKitService.updateBrandKit(currentKit.id, currentKit);
            toast.success("Brand Kit mis à jour ✨", { id: toastId });
        } catch (error) {
            toast.error("Erreur de sauvegarde", { id: toastId });
        }
    };

    const handleCreateKit = async () => {
        if (!user) return;

        try {
            const newKit = await brandKitService.createBrandKit(user.id, {
                name: 'Nouveau Kit de Marque',
                description: 'Mon identité visuelle'
            });
            setBrandKits(prev => [...prev, newKit]);
            setCurrentKit(newKit);
            setBrandAssets([]);
            toast.success('Nouveau kit de marque créé !');
        } catch (error) {
            toast.error('Erreur lors de la création du kit');
        }
    };

    const handleKitChange = async (kitId: string) => {
        const kit = brandKits.find(k => k.id === kitId);
        if (kit) {
            await brandKitService.setActiveBrandKit(user!.id, kitId);
            setCurrentKit(kit);
            const assets = await brandKitService.getBrandAssets(kitId);
            setBrandAssets(assets);
        }
    };

    const handleExtractColorsFromLogo = async () => {
        if (!currentKit?.logo_url) {
            toast.error('Veuillez d\'abord uploader un logo');
            return;
        }

        try {
            const extractedColors = await brandKitService.extractColorsFromImage(currentKit.logo_url);

            // Update the current kit with extracted colors
            const updatedKit = {
                ...currentKit,
                primary_color: extractedColors[0] || currentKit.primary_color,
                secondary_color: extractedColors[1] || currentKit.secondary_color,
                accent_color: extractedColors[2] || currentKit.accent_color,
            };

            setCurrentKit(updatedKit);
            toast.success('Couleurs extraites automatiquement depuis le logo !');
        } catch (error) {
            toast.error('Erreur lors de l\'extraction des couleurs');
        }
    };

    const handleLogoUpload = useCallback(async () => {
        if (!currentKit || !user) return;

        try {
            await uploadHook.onUpload();

            if (uploadHook.isSuccess && uploadHook.successes.length > 0) {
                const logoUrl = `https://your-supabase-url.supabase.co/storage/v1/object/public/trendstudio-images/${user.id ? `brand-assets/${user.id}/` : ''}${uploadHook.successes[0]}`;

                // Update the brand kit with the logo URL
                const updatedKit = { ...currentKit, logo_url: logoUrl };
                await brandKitService.updateBrandKit(currentKit.id, updatedKit);
                setCurrentKit(updatedKit);

                toast.success('Logo uploadé avec succès !');

                // Clear uploaded files
                uploadHook.setFiles([]);
            }
        } catch (error) {
            toast.error('Erreur lors de l\'upload du logo');
        }
    }, [currentKit, user, uploadHook]);

    const handleRemoveLogo = async () => {
        if (!currentKit || !user) return;

        try {
            const updatedKit = { ...currentKit, logo_url: undefined };
            await brandKitService.updateBrandKit(currentKit.id, updatedKit);
            setCurrentKit(updatedKit);
            toast.success('Logo supprimé');
        } catch (error) {
            toast.error('Erreur lors de la suppression du logo');
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2">
                    <Palette size={14} /> Brand Experience Engine
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight">Studio de Marque</h1>
                <p className="text-muted-foreground">Centralisez votre identité pour que toutes les créations IA vous ressemblent.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Kit Selection */}
                <div className="lg:col-span-3 mb-6">
                    <Card className="border-2 border-primary/5">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Palette size={20} className="text-primary" /> Mes Kits de Marque
                                </CardTitle>
                                <Button onClick={handleCreateKit} size="sm">
                                    <Plus size={16} className="mr-2" />
                                    Nouveau Kit
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {brandKits.length > 0 ? (
                                <Select value={currentKit?.id || ''} onValueChange={handleKitChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Sélectionner un kit de marque" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {brandKits.map(kit => (
                                            <SelectItem key={kit.id} value={kit.id}>
                                                {kit.name} {kit.is_active && <Badge variant="secondary" className="ml-2">Actif</Badge>}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-muted-foreground mb-4">Aucun kit de marque trouvé. Créez votre premier kit !</p>
                                    <Button onClick={handleCreateKit}>
                                        <Plus size={16} className="mr-2" />
                                        Créer mon premier kit
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Visual Identity Form */}
                <div className="lg:col-span-2 space-y-6">
                    {currentKit && (
                        <>
                            <Card className="border-2 border-primary/5">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Layout size={20} className="text-primary" /> Identité de Base
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>Nom de la Marque</Label>
                                            <Input
                                                value={currentKit.name}
                                                onChange={(e) => setCurrentKit({ ...currentKit, name: e.target.value })}
                                                placeholder="Ex: TrendStudio"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Description</Label>
                                            <Input
                                                value={currentKit.description || ''}
                                                onChange={(e) => setCurrentKit({ ...currentKit, description: e.target.value })}
                                                placeholder="Description de votre marque"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label>Palette de Couleurs</Label>
                                            {currentKit.logo_url && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleExtractColorsFromLogo}
                                                    className="text-xs"
                                                >
                                                    <Wand2 size={14} className="mr-2" />
                                                    Extraire du logo
                                                </Button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-3 gap-4">
                                            <ColorPicker
                                                label="Primaire"
                                                value={currentKit.primary_color}
                                                onChange={(v) => setCurrentKit({ ...currentKit, primary_color: v })}
                                            />
                                            <ColorPicker
                                                label="Secondaire"
                                                value={currentKit.secondary_color}
                                                onChange={(v) => setCurrentKit({ ...currentKit, secondary_color: v })}
                                            />
                                            <ColorPicker
                                                label="Accent"
                                                value={currentKit.accent_color}
                                                onChange={(v) => setCurrentKit({ ...currentKit, accent_color: v })}
                                            />
                                        </div>
                                        {currentKit.logo_url && (
                                            <p className="text-xs text-muted-foreground">
                                                💡 Cliquez sur "Extraire du logo" pour analyser automatiquement les couleurs dominantes de votre logo
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <Label>Typographie</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm">Police Principale</Label>
                                                <Select
                                                    value={currentKit.typography?.primary || 'Inter'}
                                                    onValueChange={(value) => setCurrentKit({
                                                        ...currentKit,
                                                        typography: { ...currentKit.typography, primary: value }
                                                    })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {googleFonts.map(font => (
                                                            <SelectItem key={font} value={font}>{font}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm">Police du Corps</Label>
                                                <Select
                                                    value={currentKit.typography?.body || 'Inter'}
                                                    onValueChange={(value) => setCurrentKit({
                                                        ...currentKit,
                                                        typography: { ...currentKit.typography, body: value }
                                                    })}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {googleFonts.map(font => (
                                                            <SelectItem key={font} value={font}>{font}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label>Brand Voice (Voix de Marque)</Label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-sm">Ton</Label>
                                                <Textarea
                                                    placeholder="Professionnel, Amical, Ludique..."
                                                    value={currentKit.brand_voice?.tone?.join(', ') || ''}
                                                    onChange={(e) => setCurrentKit({
                                                        ...currentKit,
                                                        brand_voice: {
                                                            ...currentKit.brand_voice,
                                                            tone: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                                                        }
                                                    })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm">Style</Label>
                                                <Textarea
                                                    placeholder="Direct, Narratif, Humoristique..."
                                                    value={currentKit.brand_voice?.style?.join(', ') || ''}
                                                    onChange={(e) => setCurrentKit({
                                                        ...currentKit,
                                                        brand_voice: {
                                                            ...currentKit.brand_voice,
                                                            style: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                                                        }
                                                    })}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-sm">Mots-clés</Label>
                                                <Textarea
                                                    placeholder="Innovation, Qualité, Service..."
                                                    value={currentKit.brand_voice?.keywords?.join(', ') || ''}
                                                    onChange={(e) => setCurrentKit({
                                                        ...currentKit,
                                                        brand_voice: {
                                                            ...currentKit.brand_voice,
                                                            keywords: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                                                        }
                                                    })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="border-2 border-primary/5">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Upload size={20} className="text-primary" /> Logo & Assets
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Logo Upload */}
                                        <div className="border-2 border-dashed border-muted rounded-2xl p-6 text-center space-y-4 hover:border-primary/50 transition-colors cursor-pointer group">
                                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto group-hover:bg-primary/10 transition-colors">
                                                <Upload className="text-muted-foreground group-hover:text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-bold">Logo Principal</p>
                                                <p className="text-xs text-muted-foreground">PNG, SVG, JPG (Max 5MB)</p>
                                            </div>
                                        </div>

                                        {/* Other Assets */}
                                        <div className="space-y-4">
                                            <h4 className="font-semibold">Assets de Marque</h4>
                                            <div className="space-y-2">
                                                {brandAssets.length > 0 ? (
                                                    brandAssets.map(asset => (
                                                        <div key={asset.id} className="flex items-center gap-3 p-2 bg-muted rounded">
                                                            {asset.asset_type === 'logo' && <ImageIcon size={16} />}
                                                            {asset.asset_type === 'font' && <Type size={16} />}
                                                            {asset.asset_type === 'template' && <FileText size={16} />}
                                                            <span className="text-sm flex-1">{asset.asset_name}</span>
                                                            <Button variant="ghost" size="sm">
                                                                <Trash2 size={14} />
                                                            </Button>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">Aucun asset ajouté</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </>
                    )}

                    {currentKit && (
                        <Button onClick={handleSave} className="w-full h-14 text-lg font-bold gradient-primary shadow-xl">
                            Enregistrer mon Brand Kit
                        </Button>
                    )}


                </div>

                {/* Live Preview */}
                <div className="space-y-6">
                    {currentKit && (
                        <>
                            <h3 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Apperçu Dynamique</h3>
                            <Card className="overflow-hidden border-2 shadow-2xl sticky top-6">
                                <div className="h-3 bg-gradient-to-r" style={{
                                    backgroundImage: `linear-gradient(to right, ${currentKit.primary_color}, ${currentKit.secondary_color}, ${currentKit.accent_color})`
                                }} />
                                <CardContent className="p-0">
                                    {/* Mock Report Header */}
                                    <div className="p-6 space-y-6">
                                        <div className="flex justify-between items-center">
                                            {currentKit.logo_url ? (
                                                <img src={currentKit.logo_url} alt="Logo" className="w-8 h-8 object-contain" />
                                            ) : (
                                                <div className="w-8 h-8 rounded bg-muted" />
                                            )}
                                            <div className="flex gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentKit.primary_color }} />
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentKit.secondary_color }} />
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentKit.accent_color }} />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h4 className="text-xl font-bold" style={{
                                                color: currentKit.primary_color,
                                                fontFamily: currentKit.typography?.primary || 'Inter'
                                            }}>
                                                Rapport de Performance IA
                                            </h4>
                                            <div className="h-2 w-full bg-muted rounded-full">
                                                <div className="h-full rounded-full" style={{ width: '75%', backgroundColor: currentKit.accent_color }} />
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Ceci est un aperçu de comment vos couleurs seront appliquées sur vos rapports PDF et vos créations IA.
                                            </p>
                                        </div>

                                        <Button size="sm" className="w-full text-white" style={{ backgroundColor: currentKit.primary_color }}>
                                            Bouton Signature
                                        </Button>

                                        <div className="pt-6 border-t border-muted">
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="p-2 rounded-lg bg-muted text-primary"><Wand2 size={16} /></div>
                                                <span className="text-xs font-bold uppercase">Prompt IA Généré</span>
                                            </div>
                                            <div className="p-3 bg-muted/50 rounded-lg text-[10px] text-muted-foreground font-mono">
                                                "Génère une image professionnelle utilisant la palette {currentKit.primary_color}, {currentKit.secondary_color}, {currentKit.accent_color} avec le style {currentKit.brand_voice?.tone?.[0] || 'moderne'}..."
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-3 italic text-xs">
                                <Sparkles className="text-primary shrink-0" size={16} />
                                <p>Désormais, toutes vos devis, newsletters et visuels sociaux suivront automatiquement ces directives.</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function ColorPicker({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
    return (
        <div className="space-y-2">
            <Label className="text-[10px] uppercase font-bold text-muted-foreground">{label}</Label>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border">
                <input
                    type="color"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                />
                <span className="text-xs font-mono uppercase font-bold">{value}</span>
            </div>
        </div>
    );
}
