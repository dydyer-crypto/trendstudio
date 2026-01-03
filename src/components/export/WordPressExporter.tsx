import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { wordpressService, type WordPressSite, type WordPressExportOptions } from '@/services/wordpressService';
import { brandKitService } from '@/services/brandKitService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { FileText, Upload, Globe, CheckCircle, ExternalLink } from 'lucide-react';

interface WordPressExporterProps {
    content: string;
    title: string;
    excerpt?: string;
    tags?: string[];
    onExport?: (postUrl: string) => void;
    trigger?: React.ReactNode;
}

export function WordPressExporter({
    content,
    title,
    excerpt,
    tags = [],
    onExport,
    trigger
}: WordPressExporterProps) {
    const { user } = useAuth();
    const [sites, setSites] = useState<WordPressSite[]>([]);
    const [selectedSite, setSelectedSite] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [exportOptions, setExportOptions] = useState<WordPressExportOptions>({
        content,
        title,
        excerpt: excerpt || '',
        categories: [],
        tags: [...tags],
        status: 'draft',
        seoTitle: '',
        seoDescription: '',
        focusKeyword: ''
    });

    useEffect(() => {
        if (user && dialogOpen) {
            loadSites();
        }
    }, [user, dialogOpen]);

    useEffect(() => {
        // Update export options when props change
        setExportOptions(prev => ({
            ...prev,
            content,
            title,
            excerpt: excerpt || prev.excerpt,
            tags: [...tags, ...(prev.tags || []).filter(tag => !tags.includes(tag))]
        }));
    }, [content, title, excerpt, tags]);

    const loadSites = async () => {
        try {
            const userSites = await wordpressService.getUserSites(user!.id);
            setSites(userSites);
            if (userSites.length > 0 && !selectedSite) {
                setSelectedSite(userSites[0].id);
            }
        } catch (error) {
            console.error('Error loading WordPress sites:', error);
        }
    };

    const handleExport = async () => {
        if (!selectedSite) {
            toast.error('Veuillez sélectionner un site WordPress');
            return;
        }

        setLoading(true);
        try {
            const site = sites.find(s => s.id === selectedSite);
            if (!site) throw new Error('Site non trouvé');

            // Get brand kit for enhanced export
            let brandKit;
            try {
                brandKit = await brandKitService.getActiveBrandKit(user!.id);
            } catch (error) {
                // Brand kit is optional
            }

            // Enhance content with brand kit if available
            const enhancedOptions = { ...exportOptions };
            if (brandKit && !enhancedOptions.seoTitle) {
                enhancedOptions.seoTitle = exportOptions.title;
                if (brandKit.brand_voice?.keywords?.length > 0) {
                    enhancedOptions.focusKeyword = brandKit.brand_voice.keywords[0];
                }
            }

            const result = await wordpressService.exportToWordPress(site, enhancedOptions);

            toast.success('Contenu exporté vers WordPress avec succès !');
            setDialogOpen(false);

            if (onExport) {
                onExport(result.postUrl);
            }

            // Open the post in a new tab
            window.open(result.postUrl, '_blank');
        } catch (error: any) {
            console.error('Export error:', error);
            toast.error(error.message || 'Erreur lors de l\'export vers WordPress');
        } finally {
            setLoading(false);
        }
    };

    const defaultTrigger = (
        <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Exporter vers WordPress
        </Button>
    );

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
                {trigger || defaultTrigger}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Exporter vers WordPress
                    </DialogTitle>
                    <DialogDescription>
                        Publiez votre contenu directement sur votre site WordPress
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Site Selection */}
                    <div className="space-y-2">
                        <Label>Site WordPress</Label>
                        {sites.length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
                                <Globe className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground mb-2">
                                    Aucun site WordPress connecté
                                </p>
                                <Button variant="outline" size="sm" asChild>
                                    <a href="/settings/api">
                                        Connecter un site <ExternalLink className="h-3 w-3 ml-1" />
                                    </a>
                                </Button>
                            </div>
                        ) : (
                            <Select value={selectedSite} onValueChange={setSelectedSite}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionnez un site" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sites.map(site => (
                                        <SelectItem key={site.id} value={site.id}>
                                            <div className="flex items-center gap-2">
                                                <Globe className="h-4 w-4" />
                                                {site.site_name}
                                                <Badge variant="outline" className="text-xs">
                                                    {site.site_url}
                                                </Badge>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* Post Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="post-title">Titre de l'article</Label>
                            <Input
                                id="post-title"
                                value={exportOptions.title}
                                onChange={(e) => setExportOptions(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Titre de votre article"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Statut de publication</Label>
                            <Select
                                value={exportOptions.status}
                                onValueChange={(value: 'draft' | 'publish') =>
                                    setExportOptions(prev => ({ ...prev, status: value }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="draft">Brouillon</SelectItem>
                                    <SelectItem value="publish">Publier immédiatement</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="post-excerpt">Extrait (optionnel)</Label>
                        <Textarea
                            id="post-excerpt"
                            value={exportOptions.excerpt}
                            onChange={(e) => setExportOptions(prev => ({ ...prev, excerpt: e.target.value }))}
                            placeholder="Résumé de l'article..."
                            rows={2}
                        />
                    </div>

                    {/* Categories and Tags */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Catégories</Label>
                            <Input
                                placeholder="Blog, Marketing, SEO..."
                                value={exportOptions.categories?.join(', ') || ''}
                                onChange={(e) => setExportOptions(prev => ({
                                    ...prev,
                                    categories: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                                }))}
                            />
                            <p className="text-xs text-muted-foreground">
                                Séparées par des virgules
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>Tags</Label>
                            <Input
                                placeholder="IA, contenu, marketing..."
                                value={exportOptions.tags?.join(', ') || ''}
                                onChange={(e) => setExportOptions(prev => ({
                                    ...prev,
                                    tags: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                                }))}
                            />
                            <p className="text-xs text-muted-foreground">
                                Séparés par des virgules
                            </p>
                        </div>
                    </div>

                    {/* SEO Options */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="seo-options"
                                onCheckedChange={(checked) => {
                                    // Toggle SEO fields visibility
                                }}
                            />
                            <Label htmlFor="seo-options" className="text-sm font-medium">
                                Optimisation SEO (Yoast SEO)
                            </Label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-muted">
                            <div className="space-y-2">
                                <Label htmlFor="seo-title">Titre SEO</Label>
                                <Input
                                    id="seo-title"
                                    value={exportOptions.seoTitle}
                                    onChange={(e) => setExportOptions(prev => ({ ...prev, seoTitle: e.target.value }))}
                                    placeholder="Titre optimisé SEO"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="focus-keyword">Mot-clé principal</Label>
                                <Input
                                    id="focus-keyword"
                                    value={exportOptions.focusKeyword}
                                    onChange={(e) => setExportOptions(prev => ({ ...prev, focusKeyword: e.target.value }))}
                                    placeholder="Mot-clé cible"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="seo-description">Description SEO</Label>
                                <Textarea
                                    id="seo-description"
                                    value={exportOptions.seoDescription}
                                    onChange={(e) => setExportOptions(prev => ({ ...prev, seoDescription: e.target.value }))}
                                    placeholder="Description meta optimisée..."
                                    rows={2}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Content Preview */}
                    <div className="space-y-2">
                        <Label>Aperçu du contenu</Label>
                        <div className="max-h-32 overflow-y-auto p-3 bg-muted rounded-md text-sm">
                            {exportOptions.content.substring(0, 200)}...
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {exportOptions.content.length} caractères
                        </p>
                    </div>

                    {/* Export Button */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setDialogOpen(false)}
                            className="flex-1"
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleExport}
                            disabled={loading || !selectedSite || !exportOptions.title.trim()}
                            className="flex-1"
                        >
                            {loading ? (
                                <>
                                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                                    Export en cours...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Exporter vers WordPress
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}