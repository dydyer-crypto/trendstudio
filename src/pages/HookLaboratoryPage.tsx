import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
    Brain,
    Sparkles,
    Eye,
    AlertTriangle,
    TrendingUp,
    Award,
    Users,
    BarChart3,
    HelpCircle,
    BookOpen,
    RotateCcw,
    Copy,
    Save,
    Play,
    Target
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { hookGeneratorService, type HookCategory, type GeneratedHook, type HookGenerationRequest } from '@/services/hookGeneratorService';

interface HookDisplayProps {
    hook: GeneratedHook;
    onCopy: (text: string) => void;
    onSave: (hook: GeneratedHook) => void;
}

function HookDisplay({ hook, onCopy, onSave }: HookDisplayProps) {
    const getCategoryIcon = (category: string) => {
        const icons = {
            curiosity: <Eye size={16} />,
            fear: <AlertTriangle size={16} />,
            gain: <TrendingUp size={16} />,
            authority: <Award size={16} />,
            social_proof: <Users size={16} />,
            contrast: <BarChart3 size={16} />,
            question: <HelpCircle size={16} />,
            storytelling: <BookOpen size={16} />
        };
        return icons[category as keyof typeof icons] || <Brain size={16} />;
    };

    const getCategoryColor = (category: string) => {
        const colors = {
            curiosity: 'bg-purple-500',
            fear: 'bg-red-500',
            gain: 'bg-green-500',
            authority: 'bg-blue-500',
            social_proof: 'bg-yellow-500',
            contrast: 'bg-pink-500',
            question: 'bg-cyan-500',
            storytelling: 'bg-lime-500'
        };
        return colors[category as keyof typeof colors] || 'bg-gray-500';
    };

    return (
        <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-full text-white ${getCategoryColor(hook.category)}`}>
                        {getCategoryIcon(hook.category)}
                    </div>
                    <div>
                        <span className="font-semibold text-sm">{hook.category_name}</span>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-2 h-2 rounded-full ${i < Math.round(hook.score / 20) ? 'bg-yellow-400' : 'bg-gray-200'
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="text-xs text-muted-foreground">{hook.score}%</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCopy(hook.text)}
                        className="h-8 w-8 p-0"
                    >
                        <Copy size={14} />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSave(hook)}
                        className="h-8 w-8 p-0"
                    >
                        <Save size={14} />
                    </Button>
                </div>
            </div>

            <p className="text-sm leading-relaxed mb-2">"{hook.text}"</p>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{hook.psychological_impact}</span>
                {hook.platform_specific && (
                    <Badge variant="outline" className="text-xs">Plateforme spécifique</Badge>
                )}
            </div>
        </div>
    );
}

export default function HookLaboratoryPage() {
    const { user } = useAuth();
    const [topic, setTopic] = useState('');
    const [targetAudience, setTargetAudience] = useState('');
    const [platform, setPlatform] = useState('youtube');
    const [category, setCategory] = useState('all');
    const [generatedHooks, setGeneratedHooks] = useState<GeneratedHook[]>([]);
    const [categories, setCategories] = useState<HookCategory[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [savedCount, setSavedCount] = useState(0);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const cats = await hookGeneratorService.getHookCategories();
            setCategories(cats);
        } catch (error) {
            console.error('Error loading categories:', error);
            toast.error('Erreur lors du chargement des catégories');
        }
    };

    const handleGenerate = async () => {
        if (!topic.trim()) {
            toast.error('Veuillez entrer un sujet');
            return;
        }

        setIsGenerating(true);
        setGeneratedHooks([]);

        try {
            const request: HookGenerationRequest = {
                topic: topic.trim(),
                target_audience: targetAudience.trim() || undefined,
                platform,
                category: category === 'all' ? undefined : category,
                count: 2 // 2 hooks per category
            };

            const hooks = await hookGeneratorService.generateHooks(request);
            setGeneratedHooks(hooks);

            toast.success(`${hooks.length} hooks générés avec succès ! 🎯`);

            // Auto-save to database
            if (user) {
                try {
                    await hookGeneratorService.saveGeneratedHooks(
                        user.id,
                        request,
                        hooks,
                        `Generated ${hooks.length} hooks for topic: ${topic}`
                    );
                } catch (error) {
                    console.error('Error auto-saving hooks:', error);
                }
            }

        } catch (error) {
            console.error('Generation error:', error);
            toast.error('Erreur lors de la génération des hooks');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyHook = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Hook copié dans le presse-papiers !');
    };

    const handleSaveHook = (hook: GeneratedHook) => {
        // TODO: Save to user's hook library
        setSavedCount(prev => prev + 1);
        toast.success('Hook sauvegardé dans votre bibliothèque !');
    };

    const handleClear = () => {
        setGeneratedHooks([]);
        setTopic('');
        setTargetAudience('');
        setPlatform('youtube');
        setCategory('all');
    };

    return (
        <div className="container mx-auto p-6 space-y-8 max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl xl:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
                        Laboratoire de Hooks <Brain className="text-primary h-8 w-8" />
                    </h1>
                    <p className="text-muted-foreground text-base xl:text-lg">
                        Générez des accroches optimisées pour exploser votre engagement.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="h-8 gap-1 border-primary/20 bg-primary/5">
                        <Target size={12} className="text-primary" /> IA Gemini 1.5 Pro
                    </Badge>
                    <Badge variant="outline" className="h-8 gap-1">
                        <Sparkles size={12} /> 8 Techniques Psycho
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Configuration Panel */}
                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
                    <Card className="border-2 border-primary/5 shadow-xl">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Brain className="h-5 w-5 text-primary" /> Configuration de Génération
                            </CardTitle>
                            <CardDescription>
                                Personnalisez vos hooks pour maximiser l'impact
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <Label className="text-sm font-bold uppercase tracking-wider opacity-70">
                                    1. Votre Sujet
                                </Label>
                                <Input
                                    placeholder="Ex: Création de vidéos IA, Marketing digital..."
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    className="h-12 bg-muted/30 border-none"
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-sm font-bold uppercase tracking-wider opacity-70">
                                    2. Audience Cible (optionnel)
                                </Label>
                                <Input
                                    placeholder="Ex: Créateurs de contenu, Entrepreneurs..."
                                    value={targetAudience}
                                    onChange={(e) => setTargetAudience(e.target.value)}
                                    className="h-10 bg-muted/30 border-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-3">
                                    <Label className="text-sm font-bold uppercase tracking-wider opacity-70">
                                        3. Plateforme
                                    </Label>
                                    <Select value={platform} onValueChange={setPlatform}>
                                        <SelectTrigger className="h-10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="youtube">YouTube</SelectItem>
                                            <SelectItem value="tiktok">TikTok</SelectItem>
                                            <SelectItem value="instagram">Instagram</SelectItem>
                                            <SelectItem value="linkedin">LinkedIn</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-sm font-bold uppercase tracking-wider opacity-70">
                                        4. Technique (optionnel)
                                    </Label>
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger className="h-10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Toutes les techniques</SelectItem>
                                            {categories.map(cat => (
                                                <SelectItem key={cat.id} value={cat.name}>
                                                    {cat.display_name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    size="lg"
                                    className="flex-1 h-14 gap-2 gradient-primary shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                    onClick={handleGenerate}
                                    disabled={isGenerating || !topic.trim()}
                                >
                                    {isGenerating ? (
                                        <><RotateCcw className="h-5 w-5 animate-spin" /> Génération...</>
                                    ) : (
                                        <><Sparkles className="h-5 w-5" /> Générer les Hooks</>
                                    )}
                                </Button>

                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={handleClear}
                                    className="px-4"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex gap-3 italic text-xs text-blue-700 dark:text-blue-300">
                        <Brain size={16} className="shrink-0" />
                        Chaque hook est optimisé selon des principes psychologiques éprouvés pour maximiser l'engagement des 3 premières secondes.
                    </div>
                </div>

                {/* Results Panel */}
                <div className="lg:col-span-8 min-h-[600px]">
                    <Card className="border-2 border-muted shadow-2xl">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="h-5 w-5 text-primary" />
                                    Hooks Générés
                                    {generatedHooks.length > 0 && (
                                        <Badge variant="secondary" className="ml-2">
                                            {generatedHooks.length} hooks
                                        </Badge>
                                    )}
                                </CardTitle>
                                {savedCount > 0 && (
                                    <Badge variant="outline" className="gap-1">
                                        <Save size={12} /> {savedCount} sauvegardés
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {generatedHooks.length === 0 ? (
                                <div className="text-center py-16 space-y-4">
                                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto">
                                        <Brain className="w-10 h-10 text-muted-foreground" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-semibold">Aucun hook généré</h3>
                                        <p className="text-muted-foreground max-w-sm mx-auto">
                                            Remplissez la configuration à gauche et cliquez sur "Générer les Hooks" pour créer des accroches optimisées.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {generatedHooks.map((hook) => (
                                        <HookDisplay
                                            key={hook.id}
                                            hook={hook}
                                            onCopy={handleCopyHook}
                                            onSave={handleSaveHook}
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}