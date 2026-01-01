import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Zap,
    Target,
    Users,
    Youtube,
    Instagram,
    Music,
    Linkedin,
    Sparkles,
    Copy,
    Heart,
    TrendingUp,
    Eye,
    MessageCircle,
    BarChart3,
    Loader2,
    RefreshCw,
    Star,
    CheckCircle,
    AlertCircle,
    Video,
    Share,
    Search,
    Filter,
    Grid3X3,
    List,
    X,
    Plus,
    Calendar,
    Tag
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { hookGeneratorService, type GeneratedHook, type HookCategory, type HookGenerationResult } from '@/services/hookGeneratorService';
import { hookLibraryService, type HookLibraryItem, type HookLibraryStats } from '@/services/hookLibraryService';

const HookLaboratoryPage: React.FC = () => {
    const { user } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    // Form state
    const [topic, setTopic] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const [platform, setPlatform] = useState<'youtube' | 'tiktok' | 'instagram' | 'linkedin'>('youtube');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    // Generation state
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [results, setResults] = useState<HookGenerationResult | null>(null);

    // Categories state
    const [categories, setCategories] = useState<HookCategory[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    // UI state
    const [activeTab, setActiveTab] = useState('generate');
    const [copiedHooks, setCopiedHooks] = useState<Set<string>>(new Set());

    // Library state
    const [libraryHooks, setLibraryHooks] = useState<HookLibraryItem[]>([]);
    const [loadingLibrary, setLoadingLibrary] = useState(false);
    const [librarySearch, setLibrarySearch] = useState('');
    const [libraryFilters, setLibraryFilters] = useState({
        category: '',
        platform: '',
        isFavorite: false,
        sortBy: 'last_used_at' as 'performance_score' | 'usage_count' | 'last_used_at' | 'created_at' | 'hook_text',
        sortOrder: 'desc' as 'asc' | 'desc'
    });
    const [libraryView, setLibraryView] = useState<'grid' | 'list'>('grid');
    const [showLibraryFilters, setShowLibraryFilters] = useState(false);
    const [libraryStats, setLibraryStats] = useState<HookLibraryStats | null>(null);
    const [showLibraryStats, setShowLibraryStats] = useState(false);

    // Bulk operations state
    const [selectedHooks, setSelectedHooks] = useState<Set<string>>(new Set());
    const [showBulkActions, setShowBulkActions] = useState(false);

    useEffect(() => {
        loadCategories();
    }, []);

    useEffect(() => {
        if (activeTab === 'library') {
            loadLibrary();
            loadLibraryStats();
        }
    }, [activeTab, librarySearch, libraryFilters]);

    const loadCategories = async () => {
        try {
            const cats = await hookGeneratorService.getCategories();
            setCategories(cats);
        } catch (error) {
            console.error('Failed to load categories:', error);
            toast({
                title: 'Erreur',
                description: 'Impossible de charger les catégories de hooks',
                variant: 'destructive'
            });
        } finally {
            setLoadingCategories(false);
        }
    };

    const loadLibrary = async () => {
        setLoadingLibrary(true);
        try {
            const result = await hookLibraryService.getHooks({
                search: librarySearch,
                category: libraryFilters.category || undefined,
                platform: libraryFilters.platform || undefined,
                isFavorite: libraryFilters.isFavorite || undefined,
                sortBy: libraryFilters.sortBy,
                sortOrder: libraryFilters.sortOrder,
                limit: 50
            });
            setLibraryHooks(result.hooks);
        } catch (error) {
            console.error('Failed to load library:', error);
            toast({
                title: 'Erreur',
                description: 'Impossible de charger la bibliothèque',
                variant: 'destructive'
            });
        } finally {
            setLoadingLibrary(false);
        }
    };

    const loadLibraryStats = async () => {
        try {
            const stats = await hookLibraryService.getStats();
            setLibraryStats(stats);
        } catch (error) {
            console.error('Failed to load library stats:', error);
        }
    };

    const handleGenerate = async () => {
        if (!topic.trim()) {
            toast({
                title: 'Sujet requis',
                description: 'Veuillez entrer un sujet pour générer des hooks',
                variant: 'destructive'
            });
            return;
        }

        setIsGenerating(true);
        setGenerationProgress(0);
        setResults(null);

        try {
            // Simulate progress updates
            const progressInterval = setInterval(() => {
                setGenerationProgress(prev => Math.min(prev + 15, 90));
            }, 200);

            const request = {
                topic: topic.trim(),
                targetAudience: targetAudience.trim() || undefined,
                platform,
                category: selectedCategory === 'all' ? undefined : selectedCategory,
                count: 8
            };

            const result = await hookGeneratorService.generateHooks(request);

            clearInterval(progressInterval);
            setGenerationProgress(100);
            setResults(result);

            toast({
                title: '🎯 Hooks générés !',
                description: `${result.generatedHooks.length} accroches optimisées créées pour ${platform}`,
            });

            // Auto-switch to results tab
            setTimeout(() => setActiveTab('results'), 500);

        } catch (error) {
            console.error('Generation failed:', error);
            toast({
                title: 'Erreur de génération',
                description: 'Impossible de générer les hooks. Veuillez réessayer.',
                variant: 'destructive'
            });
        } finally {
            setIsGenerating(false);
            setGenerationProgress(0);
        }
    };

    const copyToClipboard = async (text: string, hookId: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedHooks(prev => new Set([...prev, hookId]));
            toast({
                title: 'Copié !',
                description: 'Hook copié dans le presse-papiers',
            });

            // Remove copied state after 2 seconds
            setTimeout(() => {
                setCopiedHooks(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(hookId);
                    return newSet;
                });
            }, 2000);
        } catch (error) {
            toast({
                title: 'Erreur',
                description: 'Impossible de copier dans le presse-papiers',
                variant: 'destructive'
            });
        }
    };

    const useInVideoGenerator = async (hookText: string, topic: string) => {
        try {
            // Auto-save hook to library when used
            await saveHookToLibrary(hookText, '', 'youtube', topic);

            // Store hook in sessionStorage to pre-fill video generator
            sessionStorage.setItem('hookLab_hook', hookText);
            sessionStorage.setItem('hookLab_topic', topic);
            navigate('/video-generator');
            toast({
                title: 'Intégration Vidéo',
                description: 'Hook sauvegardé et transféré vers le générateur de vidéos',
            });
        } catch (error) {
            // Still navigate even if save fails
            sessionStorage.setItem('hookLab_hook', hookText);
            sessionStorage.setItem('hookLab_topic', topic);
            navigate('/video-generator');
            toast({
                title: 'Intégration Vidéo',
                description: 'Hook transféré vers le générateur de vidéos',
                variant: 'default'
            });
        }
    };

    const useInSocialPublisher = async (hookText: string, platform: string) => {
        try {
            // Auto-save hook to library when used
            await saveHookToLibrary(hookText, '', platform, results?.topic);

            // Store hook in sessionStorage to pre-fill social publisher
            sessionStorage.setItem('hookLab_hook', hookText);
            sessionStorage.setItem('hookLab_platform', platform);
            // Navigate to social settings/api page where publishing happens
            navigate('/settings/api');
            toast({
                title: 'Intégration Sociale',
                description: 'Hook sauvegardé et transféré vers le publisher social',
            });
        } catch (error) {
            // Still navigate even if save fails
            sessionStorage.setItem('hookLab_hook', hookText);
            sessionStorage.setItem('hookLab_platform', platform);
            navigate('/settings/api');
            toast({
                title: 'Intégration Sociale',
                description: 'Hook transféré vers le publisher social',
                variant: 'default'
            });
        }
    };

    const getPlatformIcon = (platformName: string) => {
        switch (platformName) {
            case 'youtube': return <Youtube className="w-4 h-4" />;
            case 'tiktok': return <Music className="w-4 h-4" />;
            case 'instagram': return <Instagram className="w-4 h-4" />;
            case 'linkedin': return <Linkedin className="w-4 h-4" />;
            default: return <Target className="w-4 h-4" />;
        }
    };

    const getPlatformColor = (platformName: string) => {
        switch (platformName) {
            case 'youtube': return 'text-red-500';
            case 'tiktok': return 'text-black';
            case 'instagram': return 'text-pink-500';
            case 'linkedin': return 'text-blue-700';
            default: return 'text-gray-500';
        }
    };

    // Library functions
    const saveHookToLibrary = async (hookText: string, category?: string, platform?: string, topic?: string) => {
        try {
            const categoryObj = categories.find(c => c.name === category);
            await hookLibraryService.addHook({
                hookText,
                categoryId: categoryObj?.id,
                topic: topic || results?.topic,
                platform: platform || results?.platform,
                tags: []
            });
            toast({
                title: 'Hook sauvegardé !',
                description: 'Le hook a été ajouté à votre bibliothèque',
            });
            if (activeTab === 'library') {
                loadLibrary();
                loadLibraryStats();
            }
        } catch (error) {
            console.error('Failed to save hook:', error);
            toast({
                title: 'Erreur',
                description: 'Impossible de sauvegarder le hook',
                variant: 'destructive'
            });
        }
    };

    const toggleFavorite = async (hookId: string) => {
        try {
            await hookLibraryService.toggleFavorite(hookId);
            setLibraryHooks(prev => prev.map(hook =>
                hook.id === hookId
                    ? { ...hook, isFavorite: !hook.isFavorite }
                    : hook
            ));
            toast({
                title: 'Favoris mis à jour',
                description: 'Le statut favori a été modifié',
            });
            loadLibraryStats();
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
            toast({
                title: 'Erreur',
                description: 'Impossible de modifier le favori',
                variant: 'destructive'
            });
        }
    };

    const deleteHookFromLibrary = async (hookId: string) => {
        try {
            await hookLibraryService.deleteHook(hookId);
            setLibraryHooks(prev => prev.filter(hook => hook.id !== hookId));
            toast({
                title: 'Hook supprimé',
                description: 'Le hook a été retiré de votre bibliothèque',
            });
            loadLibraryStats();
        } catch (error) {
            console.error('Failed to delete hook:', error);
            toast({
                title: 'Erreur',
                description: 'Impossible de supprimer le hook',
                variant: 'destructive'
            });
        }
    };

    const useHookFromLibrary = async (hook: HookLibraryItem) => {
        try {
            await hookLibraryService.recordUsage(hook.id);
            // Update local state
            setLibraryHooks(prev => prev.map(h =>
                h.id === hook.id
                    ? { ...h, usageCount: h.usageCount + 1, lastUsedAt: new Date().toISOString() }
                    : h
            ));

            // Copy to clipboard
            await navigator.clipboard.writeText(hook.hookText);
            setCopiedHooks(prev => new Set([...prev, hook.id]));
            setTimeout(() => {
                setCopiedHooks(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(hook.id);
                    return newSet;
                });
            }, 2000);

            toast({
                title: 'Hook utilisé !',
                description: 'Copié dans le presse-papiers et utilisation enregistrée',
            });
        } catch (error) {
            console.error('Failed to record usage:', error);
        }
    };

    // Bulk operations functions
    const toggleHookSelection = (hookId: string) => {
        setSelectedHooks(prev => {
            const newSet = new Set(prev);
            if (newSet.has(hookId)) {
                newSet.delete(hookId);
            } else {
                newSet.add(hookId);
            }
            setShowBulkActions(newSet.size > 0);
            return newSet;
        });
    };

    const selectAllHooks = () => {
        if (selectedHooks.size === libraryHooks.length) {
            setSelectedHooks(new Set());
            setShowBulkActions(false);
        } else {
            setSelectedHooks(new Set(libraryHooks.map(h => h.id)));
            setShowBulkActions(true);
        }
    };

    const bulkDeleteHooks = async () => {
        try {
            for (const hookId of selectedHooks) {
                await hookLibraryService.deleteHook(hookId);
            }
            setLibraryHooks(prev => prev.filter(hook => !selectedHooks.has(hook.id)));
            setSelectedHooks(new Set());
            setShowBulkActions(false);
            loadLibraryStats();
            toast({
                title: `${selectedHooks.size} hooks supprimés`,
                description: 'Les hooks ont été retirés de votre bibliothèque',
            });
        } catch (error) {
            console.error('Failed to bulk delete hooks:', error);
            toast({
                title: 'Erreur',
                description: 'Impossible de supprimer certains hooks',
                variant: 'destructive'
            });
        }
    };

    const bulkToggleFavorites = async () => {
        try {
            for (const hookId of selectedHooks) {
                await hookLibraryService.toggleFavorite(hookId);
            }
            setLibraryHooks(prev => prev.map(hook =>
                selectedHooks.has(hook.id)
                    ? { ...hook, isFavorite: !hook.isFavorite }
                    : hook
            ));
            setSelectedHooks(new Set());
            setShowBulkActions(false);
            loadLibraryStats();
            toast({
                title: 'Favoris mis à jour',
                description: `${selectedHooks.size} hooks ont été modifiés`,
            });
        } catch (error) {
            console.error('Failed to bulk toggle favorites:', error);
            toast({
                title: 'Erreur',
                description: 'Impossible de modifier certains favoris',
                variant: 'destructive'
            });
        }
    };

    const exportSelectedHooks = () => {
        const selectedData = libraryHooks.filter(hook => selectedHooks.has(hook.id));
        const exportData = {
            exportedAt: new Date().toISOString(),
            hooks: selectedData.map(hook => ({
                text: hook.hookText,
                category: hook.category?.displayName,
                platform: hook.platform,
                isFavorite: hook.isFavorite,
                usageCount: hook.usageCount,
                performanceScore: hook.performanceScore,
                tags: hook.tags,
                createdAt: hook.createdAt
            }))
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hooks-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
            title: 'Export réussi',
            description: `${selectedHooks.size} hooks exportés`,
        });
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 text-purple-600 text-xs font-bold mb-2">
                    <Zap size={14} /> Laboratoire de Hooks IA
                </div>
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                    <Target className="w-10 h-10 text-purple-500" />
                    Générateur de Hooks Révolutionnaire
                </h1>
                <p className="text-muted-foreground text-lg">
                    Transformez vos 3 premières secondes en or pur grâce à l'IA psychologique
                </p>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
                    <TabsTrigger value="generate" className="flex items-center gap-2">
                        <Sparkles size={16} />
                        Générer
                    </TabsTrigger>
                    <TabsTrigger value="results" disabled={!results} className="flex items-center gap-2">
                        <Target size={16} />
                        Résultats ({results?.generatedHooks.length || 0})
                    </TabsTrigger>
                    <TabsTrigger value="library" className="flex items-center gap-2">
                        <Star size={16} />
                        Bibliothèque ({libraryStats?.totalHooks || 0})
                    </TabsTrigger>
                </TabsList>

                {/* Generation Tab */}
                <TabsContent value="generate" className="space-y-6">
                    <div className="grid gap-6 xl:grid-cols-2">
                        {/* Configuration Panel */}
                        <Card className="border-2 border-purple-500/10">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-purple-500" />
                                    Configuration IA
                                </CardTitle>
                                <CardDescription>
                                    Paramétrez votre génération pour des hooks ultra-ciblés
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Topic Input */}
                                <div className="space-y-2">
                                    <Label htmlFor="topic">Sujet Principal *</Label>
                                    <Textarea
                                        id="topic"
                                        placeholder="Ex: Comment créer des vidéos YouTube qui cartonnent..."
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        rows={3}
                                        className="resize-none"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Plus votre sujet est précis, plus les hooks seront impactants
                                    </p>
                                </div>

                                {/* Target Audience */}
                                <div className="space-y-2">
                                    <Label htmlFor="audience">Audience Cible</Label>
                                    <Input
                                        id="audience"
                                        placeholder="Ex: Créateurs débutants, Marketeurs, Freelancers..."
                                        value={targetAudience}
                                        onChange={(e) => setTargetAudience(e.target.value)}
                                    />
                                </div>

                                {/* Platform & Category */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Plateforme</Label>
                                        <Select value={platform} onValueChange={(value: any) => setPlatform(value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="youtube">
                                                    <div className="flex items-center gap-2">
                                                        <Youtube className="w-4 h-4 text-red-500" />
                                                        YouTube
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="tiktok">
                                                    <div className="flex items-center gap-2">
                                                        <Music className="w-4 h-4 text-black" />
                                                        TikTok
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="instagram">
                                                    <div className="flex items-center gap-2">
                                                        <Instagram className="w-4 h-4 text-pink-500" />
                                                        Instagram
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="linkedin">
                                                    <div className="flex items-center gap-2">
                                                        <Linkedin className="w-4 h-4 text-blue-700" />
                                                        LinkedIn
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Catégorie Psychologique</Label>
                                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Toutes les catégories" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">🌟 Toutes les catégories</SelectItem>
                                                {categories.map(cat => (
                                                    <SelectItem key={cat.id} value={cat.name}>
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-3 h-3 rounded-full"
                                                                style={{ backgroundColor: cat.color }}
                                                            />
                                                            {cat.displayName}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Generate Button */}
                                <Button
                                    onClick={handleGenerate}
                                    disabled={isGenerating || !topic.trim()}
                                    className="w-full h-14 text-lg font-bold gradient-primary shadow-xl"
                                    size="lg"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Génération IA en cours...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5 mr-2" />
                                            Générer 40 Hooks Révolutionnaires
                                        </>
                                    )}
                                </Button>

                                {/* Progress */}
                                {isGenerating && (
                                    <div className="space-y-2">
                                        <Progress value={generationProgress} className="w-full" />
                                        <p className="text-xs text-center text-muted-foreground">
                                            Analyse psychologique des patterns gagnants...
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Preview Panel */}
                        <Card className="border-2 border-purple-500/10">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Eye className="w-5 h-5 text-purple-500" />
                                    Aperçu du Résultat
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {/* Stats Preview */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
                                            <div className="text-2xl font-bold text-purple-600">40</div>
                                            <div className="text-xs text-muted-foreground">Hooks Générés</div>
                                        </div>
                                        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                                            <div className="text-2xl font-bold text-blue-600">8</div>
                                            <div className="text-xs text-muted-foreground">Catégories Psycho</div>
                                        </div>
                                    </div>

                                    {/* Example Hooks Preview */}
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-sm">Aperçu des Hooks :</h4>
                                        <div className="space-y-2">
                                            <div className="p-3 bg-muted/50 rounded-lg text-sm">
                                                <Badge variant="secondary" className="mb-1">Curiosité</Badge>
                                                <p>"Ce secret va révolutionner votre façon de créer..."</p>
                                            </div>
                                            <div className="p-3 bg-muted/50 rounded-lg text-sm">
                                                <Badge variant="secondary" className="mb-1">Preuve Sociale</Badge>
                                                <p>"Comment j'ai aidé 10k créateurs à exploser..."</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Platform Tips */}
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <h4 className="font-semibold text-blue-800 mb-2">💡 Conseils {platform}</h4>
                                        <ul className="text-sm text-blue-700 space-y-1">
                                            {platform === 'tiktok' && (
                                                <>
                                                    <li>• Maximum 80 caractères pour TikTok</li>
                                                    <li>• Ton énergique et direct</li>
                                                    <li>• Focus sur le choc visuel immédiat</li>
                                                </>
                                            )}
                                            {platform === 'youtube' && (
                                                <>
                                                    <li>• 8-15 minutes de vidéo idéale</li>
                                                    <li>• Questions rhétoriques engageantes</li>
                                                    <li>• Promesses de valeur concrètes</li>
                                                </>
                                            )}
                                            {platform === 'instagram' && (
                                                <>
                                                    <li>• Contenu visuel et lifestyle</li>
                                                    <li>• Storytelling émotionnel</li>
                                                    <li>• Accent sur la communauté</li>
                                                </>
                                            )}
                                            {platform === 'linkedin' && (
                                                <>
                                                    <li>• Ton professionnel et crédible</li>
                                                    <li>• Insights B2B pertinents</li>
                                                    <li>• Mise en avant de l'expertise</li>
                                                </>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Results Tab */}
                <TabsContent value="results" className="space-y-6">
                    {results && (
                        <div className="space-y-6">
                            {/* Results Header */}
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold flex items-center gap-2">
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                                Hooks Générés pour "{results.topic}"
                                            </h3>
                                            <p className="text-muted-foreground">
                                                {results.generatedHooks.length} accroches optimisées •
                                                Plateforme: {results.platform} •
                                                Temps de génération: {(results.generationTime / 1000).toFixed(1)}s
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary">
                                                {getPlatformIcon(results.platform)}
                                                <span className="ml-1 capitalize">{results.platform}</span>
                                            </Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Hooks by Category */}
                            <div className="grid gap-6">
                                {Object.entries(
                                    results.generatedHooks.reduce((acc, hook) => {
                                        if (!acc[hook.category]) acc[hook.category] = [];
                                        acc[hook.category].push(hook);
                                        return acc;
                                    }, {} as Record<string, GeneratedHook[]>)
                                ).map(([categoryName, hooks]) => {
                                    const category = categories.find(c => c.name === categoryName);
                                    return (
                                        <Card key={categoryName} className="border-2" style={{ borderColor: `${category?.color}20` }}>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-3">
                                                    <div
                                                        className="w-4 h-4 rounded-full"
                                                        style={{ backgroundColor: category?.color }}
                                                    />
                                                    {category?.displayName}
                                                    <Badge variant="outline">{hooks.length} hooks</Badge>
                                                </CardTitle>
                                                <CardDescription>
                                                    {category?.description}
                                                    <br />
                                                    <span className="text-xs">
                                                        Taux de succès moyen: {category?.successRate.toFixed(1)}%
                                                    </span>
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid gap-3">
                                                    {hooks.map((hook) => (
                                                        <div
                                                            key={hook.id}
                                                            className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                                        >
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div className="flex-1">
                                                                    <p className="font-medium mb-2">{hook.text}</p>
                                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                                        <span className="flex items-center gap-1">
                                                                            <TrendingUp size={12} />
                                                                            {hook.estimatedEngagement.toFixed(1)}% engagement estimé
                                                                        </span>
                                                                        <span className="flex items-center gap-1">
                                                                            <Eye size={12} />
                                                                            {hook.characterCount} caractères
                                                                        </span>
                                                                        <span className="flex items-center gap-1">
                                                                            <BarChart3 size={12} />
                                                                            Confiance: {Math.round(hook.confidence * 100)}%
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-2 flex-wrap">
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => copyToClipboard(hook.text, hook.id)}
                                                                        className="flex items-center gap-1"
                                                                    >
                                                                        {copiedHooks.has(hook.id) ? (
                                                                            <CheckCircle size={14} className="text-green-500" />
                                                                        ) : (
                                                                            <Copy size={14} />
                                                                        )}
                                                                        {copiedHooks.has(hook.id) ? 'Copié' : 'Copier'}
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => useInVideoGenerator(hook.text, results?.topic || '')}
                                                                        className="flex items-center gap-1"
                                                                        title="Utiliser dans le générateur de vidéos"
                                                                    >
                                                                        <Video size={14} />
                                                                        Vidéo
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => useInSocialPublisher(hook.text, hook.platform)}
                                                                        className="flex items-center gap-1"
                                                                        title="Publier sur les réseaux sociaux"
                                                                    >
                                                                        <Share size={14} />
                                                                        Social
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => saveHookToLibrary(hook.text, hook.category, hook.platform)}
                                                                        title="Sauvegarder dans la bibliothèque"
                                                                    >
                                                                        <Heart size={14} />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </TabsContent>

                {/* Library Tab */}
                <TabsContent value="library" className="space-y-6">
                    {/* Library Header */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Star className="w-5 h-5 text-yellow-500" />
                                        Bibliothèque de Hooks
                                    </CardTitle>
                                    <CardDescription>
                                        Gérez vos hooks favoris, consultez les statistiques et retrouvez vos meilleures accroches
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            loadLibrary();
                                            loadLibraryStats();
                                        }}
                                        className="flex items-center gap-2"
                                    >
                                        <RefreshCw size={14} />
                                        Actualiser
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowLibraryStats(!showLibraryStats)}
                                        className="flex items-center gap-2"
                                    >
                                        <BarChart3 size={14} />
                                        {showLibraryStats ? 'Masquer Stats' : 'Voir Stats'}
                                    </Button>
                                    {libraryHooks.length > 0 && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={selectAllHooks}
                                            className="flex items-center gap-2"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedHooks.size === libraryHooks.length && libraryHooks.length > 0}
                                                onChange={selectAllHooks}
                                                className="rounded"
                                            />
                                            {selectedHooks.size === libraryHooks.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Search and Filters */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Rechercher dans vos hooks..."
                                        value={librarySearch}
                                        onChange={(e) => setLibrarySearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setShowLibraryFilters(!showLibraryFilters)}
                                        className="flex items-center gap-2"
                                    >
                                        <Filter size={14} />
                                        Filtres
                                        {showLibraryFilters && <X size={14} className="ml-1" />}
                                    </Button>
                                    <div className="flex border rounded-md">
                                        <Button
                                            variant={libraryView === 'grid' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setLibraryView('grid')}
                                            className="rounded-r-none"
                                        >
                                            <Grid3X3 size={14} />
                                        </Button>
                                        <Button
                                            variant={libraryView === 'list' ? 'default' : 'ghost'}
                                            size="sm"
                                            onClick={() => setLibraryView('list')}
                                            className="rounded-l-none"
                                        >
                                            <List size={14} />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Advanced Filters */}
                            {showLibraryFilters && (
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium">Catégorie</Label>
                                        <Select
                                            value={libraryFilters.category}
                                            onValueChange={(value) => setLibraryFilters(prev => ({ ...prev, category: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Toutes" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">Toutes</SelectItem>
                                                {categories.map(cat => (
                                                    <SelectItem key={cat.id} value={cat.name}>
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-3 h-3 rounded-full"
                                                                style={{ backgroundColor: cat.color }}
                                                            />
                                                            {cat.displayName}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium">Plateforme</Label>
                                        <Select
                                            value={libraryFilters.platform}
                                            onValueChange={(value) => setLibraryFilters(prev => ({ ...prev, platform: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Toutes" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">Toutes</SelectItem>
                                                <SelectItem value="youtube">YouTube</SelectItem>
                                                <SelectItem value="tiktok">TikTok</SelectItem>
                                                <SelectItem value="instagram">Instagram</SelectItem>
                                                <SelectItem value="linkedin">LinkedIn</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium">Trier par</Label>
                                        <Select
                                            value={libraryFilters.sortBy}
                                            onValueChange={(value: any) => setLibraryFilters(prev => ({ ...prev, sortBy: value }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="last_used_at">Dernière utilisation</SelectItem>
                                                <SelectItem value="usage_count">Utilisations</SelectItem>
                                                <SelectItem value="performance_score">Performance</SelectItem>
                                                <SelectItem value="created_at">Date de création</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium">Favoris uniquement</Label>
                                        <div className="flex items-center space-x-2 pt-2">
                                            <input
                                                type="checkbox"
                                                id="favorites-only"
                                                checked={libraryFilters.isFavorite}
                                                onChange={(e) => setLibraryFilters(prev => ({ ...prev, isFavorite: e.target.checked }))}
                                                className="rounded"
                                            />
                                            <label htmlFor="favorites-only" className="text-sm">
                                                <Heart size={14} className="inline mr-1 text-red-500" />
                                                Favoris
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Statistics Section */}
                    {showLibraryStats && libraryStats && (
                        <Card className="border-2 border-blue-500/10">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-blue-500" />
                                    Statistiques de Bibliothèque
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">{libraryStats.totalHooks}</div>
                                        <div className="text-xs text-muted-foreground">Total Hooks</div>
                                    </div>
                                    <div className="text-center p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-lg">
                                        <div className="text-2xl font-bold text-red-600">{libraryStats.favoriteHooks}</div>
                                        <div className="text-xs text-muted-foreground">Favoris</div>
                                    </div>
                                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">{libraryStats.totalUsage}</div>
                                        <div className="text-xs text-muted-foreground">Utilisations Totales</div>
                                    </div>
                                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg">
                                        <div className="text-2xl font-bold text-purple-600">{libraryStats.averagePerformance.toFixed(1)}%</div>
                                        <div className="text-xs text-muted-foreground">Performance Moyenne</div>
                                    </div>
                                </div>

                                {libraryStats.topCategories.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                                            <Target size={16} />
                                            Top Catégories
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            {libraryStats.topCategories.slice(0, 3).map((cat, index) => (
                                                <div key={cat.categoryId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-3 h-3 rounded-full"
                                                            style={{ backgroundColor: categories.find(c => c.name === cat.categoryId)?.color || '#666' }}
                                                        />
                                                        <span className="text-sm font-medium">{cat.categoryName}</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {cat.count} • {cat.averagePerformance.toFixed(1)}%
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {libraryStats.topPlatforms.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                                            <Share size={16} />
                                            Top Plateformes
                                        </h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {libraryStats.topPlatforms.slice(0, 4).map((platform) => (
                                                <div key={platform.platform} className="text-center p-3 bg-muted/50 rounded-lg">
                                                    <div className="text-lg mb-1">{getPlatformIcon(platform.platform)}</div>
                                                    <div className="text-sm font-medium capitalize">{platform.platform}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {platform.count} • {platform.averagePerformance.toFixed(1)}%
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Bulk Actions Bar */}
                    {showBulkActions && selectedHooks.size > 0 && (
                        <Card className="border-2 border-blue-500/20 bg-blue-50/50">
                            <CardContent className="py-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium">
                                            {selectedHooks.size} hook{selectedHooks.size > 1 ? 's' : ''} sélectionné{selectedHooks.size > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={bulkToggleFavorites}
                                            className="flex items-center gap-2"
                                        >
                                            <Heart size={14} />
                                            Basculer Favoris
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={exportSelectedHooks}
                                            className="flex items-center gap-2"
                                        >
                                            <Share size={14} />
                                            Exporter
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={bulkDeleteHooks}
                                            className="flex items-center gap-2"
                                        >
                                            <X size={14} />
                                            Supprimer
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedHooks(new Set());
                                                setShowBulkActions(false);
                                            }}
                                            className="flex items-center gap-2"
                                        >
                                            <X size={14} />
                                            Annuler
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Library Content */}
                    {loadingLibrary ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : libraryHooks.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-12">
                                <Star className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground mb-4">
                                    {librarySearch || libraryFilters.category || libraryFilters.platform || libraryFilters.isFavorite
                                        ? 'Aucun hook ne correspond à vos critères'
                                        : 'Votre bibliothèque est vide'
                                    }
                                </p>
                                {!librarySearch && !libraryFilters.category && !libraryFilters.platform && !libraryFilters.isFavorite && (
                                    <p className="text-sm text-muted-foreground">
                                        Sauvegardez des hooks depuis l'onglet Résultats pour les retrouver ici
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <div className={
                            libraryView === 'grid'
                                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                                : "space-y-3"
                        }>
                            {libraryHooks.map((hook) => (
                                <Card key={hook.id} className={`hover:shadow-md transition-shadow ${libraryView === 'list' ? 'flex items-center' : ''}`}>
                                    <CardContent className={`p-4 ${libraryView === 'list' ? 'flex-1' : ''}`}>
                                        <div className="flex items-start gap-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedHooks.has(hook.id)}
                                                onChange={() => toggleHookSelection(hook.id)}
                                                className="mt-1 rounded border-gray-300"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    {hook.category && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-xs"
                                                            style={{
                                                                backgroundColor: `${hook.category.color}20`,
                                                                color: hook.category.color
                                                            }}
                                                        >
                                                            {hook.category.displayName}
                                                        </Badge>
                                                    )}
                                                    {hook.platform && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {getPlatformIcon(hook.platform)}
                                                            <span className="ml-1 capitalize">{hook.platform}</span>
                                                        </Badge>
                                                    )}
                                                    {hook.isFavorite && (
                                                        <Heart size={12} className="text-red-500 fill-current" />
                                                    )}
                                                </div>

                                                <p className={`font-medium mb-3 ${libraryView === 'list' ? 'text-sm' : ''}`}>
                                                    {hook.hookText}
                                                </p>

                                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <TrendingUp size={12} />
                                                        {hook.performanceScore.toFixed(1)}%
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <BarChart3 size={12} />
                                                        {hook.usageCount} utilisations
                                                    </span>
                                                    {hook.lastUsedAt && (
                                                        <span className="flex items-center gap-1">
                                                            <Calendar size={12} />
                                                            {new Date(hook.lastUsedAt).toLocaleDateString('fr-FR')}
                                                        </span>
                                                    )}
                                                </div>

                                                {hook.tags && hook.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {hook.tags.slice(0, 3).map((tag, index) => (
                                                            <Badge key={index} variant="outline" className="text-xs">
                                                                <Tag size={10} className="mr-1" />
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                        {hook.tags.length > 3 && (
                                                            <Badge variant="outline" className="text-xs">
                                                                +{hook.tags.length - 3}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex gap-1 flex-shrink-0">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => useHookFromLibrary(hook)}
                                                    title="Utiliser ce hook"
                                                    className="flex items-center gap-1"
                                                >
                                                    {copiedHooks.has(hook.id) ? (
                                                        <CheckCircle size={14} className="text-green-500" />
                                                    ) : (
                                                        <Copy size={14} />
                                                    )}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleFavorite(hook.id)}
                                                    title={hook.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                                                    className={`flex items-center gap-1 ${hook.isFavorite ? 'text-red-500' : ''}`}
                                                >
                                                    <Heart size={14} className={hook.isFavorite ? 'fill-current' : ''} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => deleteHookFromLibrary(hook.id)}
                                                    title="Supprimer de la bibliothèque"
                                                    className="text-destructive hover:text-destructive"
                                                >
                                                    <X size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default HookLaboratoryPage;