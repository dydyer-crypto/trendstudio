import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    MessageSquare,
    Brain,
    Sparkles,
    Send,
    Eye,
    AlertTriangle,
    TrendingUp,
    Award,
    Users,
    HelpCircle,
    BookOpen,
    RefreshCw,
    Copy,
    Save,
    Target,
    BarChart3,
    Clock,
    ThumbsUp,
    MessageCircle,
    Share,
    CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { replyAssistantService, type SocialComment, type ReplyTemplate, type ReplySuggestion } from '@/services/replyAssistantService';

interface CommentCardProps {
    comment: SocialComment;
    onReply: (comment: SocialComment, replyText: string) => void;
    suggestions?: ReplySuggestion[];
    isGenerating?: boolean;
}

function CommentCard({ comment, onReply, suggestions = [], isGenerating = false }: CommentCardProps) {
    const [selectedSuggestion, setSelectedSuggestion] = useState<string>('');
    const [customReply, setCustomReply] = useState('');

    const getSentimentIcon = (sentiment: SocialComment['sentiment']) => {
        const icons = {
            positive: <ThumbsUp size={16} className="text-green-500" />,
            negative: <AlertTriangle size={16} className="text-red-500" />,
            neutral: <MessageCircle size={16} className="text-gray-500" />,
            question: <HelpCircle size={16} className="text-blue-500" />,
            complaint: <AlertTriangle size={16} className="text-orange-500" />,
            spam: <AlertTriangle size={16} className="text-red-700" />
        };
        return icons[sentiment] || <MessageCircle size={16} />;
    };

    const getSentimentColor = (sentiment: SocialComment['sentiment']) => {
        const colors = {
            positive: 'bg-green-100 text-green-800 border-green-200',
            negative: 'bg-red-100 text-red-800 border-red-200',
            neutral: 'bg-gray-100 text-gray-800 border-gray-200',
            question: 'bg-blue-100 text-blue-800 border-blue-200',
            complaint: 'bg-orange-100 text-orange-800 border-orange-200',
            spam: 'bg-red-100 text-red-800 border-red-200'
        };
        return colors[sentiment] || 'bg-gray-100 text-gray-800';
    };

    const getPriorityColor = (priority: number) => {
        if (priority >= 0.8) return 'border-red-300 bg-red-50';
        if (priority >= 0.6) return 'border-yellow-300 bg-yellow-50';
        return 'border-gray-200 bg-white';
    };

    const handleSendReply = () => {
        const replyText = selectedSuggestion || customReply;
        if (!replyText.trim()) {
            toast.error('Veuillez sélectionner ou saisir une réponse');
            return;
        }
        onReply(comment, replyText);
    };

    return (
        <Card className={`transition-all hover:shadow-md ${getPriorityColor(comment.priority_score)}`}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                            <AvatarFallback>
                                {comment.author_username?.[0]?.toUpperCase() || '?'}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">
                                    {comment.author_username || 'Utilisateur anonyme'}
                                </span>
                                <Badge variant="outline" className="text-xs capitalize">
                                    {comment.platform}
                                </Badge>
                                <Badge className={`text-xs ${getSentimentColor(comment.sentiment)}`}>
                                    {getSentimentIcon(comment.sentiment)}
                                    <span className="ml-1 capitalize">{comment.sentiment}</span>
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground">
                                    {new Date(comment.created_at).toLocaleString('fr-FR')}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    Priorité: {Math.round(comment.priority_score * 100)}%
                                </span>
                            </div>
                        </div>
                    </div>
                    {!comment.reply_sent && (
                        <Button
                            size="sm"
                            onClick={handleSendReply}
                            disabled={!selectedSuggestion && !customReply.trim()}
                        >
                            <Send size={14} className="mr-1" />
                            Répondre
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <p className="text-sm leading-relaxed">{comment.content}</p>

                {comment.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {comment.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}

                {comment.reply_sent && comment.reply_suggested && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle size={14} className="text-green-600" />
                            <span className="text-sm font-medium text-green-800">Réponse envoyée</span>
                        </div>
                        <p className="text-sm text-green-700">{comment.reply_suggested}</p>
                    </div>
                )}

                {!comment.reply_sent && (
                    <div className="space-y-3">
                        {/* AI Suggestions */}
                        {suggestions.length > 0 && (
                            <div className="space-y-2">
                                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Suggestions IA
                                </Label>
                                <div className="space-y-2">
                                    {suggestions.map((suggestion, index) => (
                                        <div
                                            key={index}
                                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedSuggestion === suggestion.text
                                                ? 'border-primary bg-primary/5'
                                                : 'border-muted hover:border-primary/50'
                                                }`}
                                            onClick={() => setSelectedSuggestion(suggestion.text)}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <Brain size={14} className="text-primary" />
                                                    <span className="text-xs font-medium capitalize">
                                                        {suggestion.tone}
                                                    </span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {Math.round(suggestion.confidence * 100)}%
                                                    </Badge>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigator.clipboard.writeText(suggestion.text);
                                                            toast.success('Suggestion copiée !');
                                                        }}
                                                    >
                                                        <Copy size={12} />
                                                    </Button>
                                                </div>
                                            </div>
                                            <p className="text-sm">{suggestion.text}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="flex gap-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <div
                                                            key={i}
                                                            className={`w-1.5 h-1.5 rounded-full ${i < Math.round(suggestion.estimated_engagement * 5)
                                                                ? 'bg-yellow-400'
                                                                : 'bg-gray-200'
                                                                }`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    Engagement estimé: {Math.round(suggestion.estimated_engagement * 100)}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Custom Reply */}
                        <div className="space-y-2">
                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Réponse personnalisée
                            </Label>
                            <Input
                                placeholder="Tapez votre réponse personnalisée..."
                                value={customReply}
                                onChange={(e) => setCustomReply(e.target.value)}
                                className="text-sm"
                            />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default function ReplyAssistantPage() {
    const { user } = useAuth();
    const [comments, setComments] = useState<SocialComment[]>([]);
    const [templates, setTemplates] = useState<ReplyTemplate[]>([]);
    const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
    const [isLoading, setIsLoading] = useState(false);
    const [generatingFor, setGeneratingFor] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const [commentsData, templatesData] = await Promise.all([
                replyAssistantService.fetchComments(user!.id),
                replyAssistantService.getReplyTemplates(user!.id)
            ]);

            setComments(commentsData);
            setTemplates(templatesData);
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('Erreur lors du chargement des données');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReply = async (comment: SocialComment, replyText: string) => {
        try {
            await replyAssistantService.sendReply(comment.id, replyText);

            // Update local state
            setComments(prev => prev.map(c =>
                c.id === comment.id
                    ? { ...c, reply_sent: true, reply_suggested: replyText, reply_timestamp: new Date().toISOString() }
                    : c
            ));

            toast.success('Réponse envoyée avec succès !');
        } catch (error) {
            console.error('Error sending reply:', error);
            toast.error('Erreur lors de l\'envoi de la réponse');
        }
    };

    const generateSuggestions = async (comment: SocialComment) => {
        setGeneratingFor(comment.id);
        try {
            const suggestions = await replyAssistantService.generateReplySuggestions(
                comment,
                null, // brandKit - will be added later
                templates
            );

            // Update comment with suggestions (in a real app, this would be stored)
            setComments(prev => prev.map(c =>
                c.id === comment.id ? { ...c, suggestions } : c
            ));

            toast.success(`${suggestions.length} suggestions générées !`);
        } catch (error) {
            console.error('Error generating suggestions:', error);
            toast.error('Erreur lors de la génération des suggestions');
        } finally {
            setGeneratingFor(null);
        }
    };

    const filteredComments = comments.filter(comment => {
        if (selectedPlatform === 'all') return true;
        return comment.platform === selectedPlatform;
    });

    const commentStats = {
        total: comments.length,
        pending: comments.filter(c => !c.reply_sent).length,
        replied: comments.filter(c => c.reply_sent).length,
        highPriority: comments.filter(c => c.priority_score >= 0.8).length
    };

    return (
        <div className="container mx-auto p-6 space-y-8 max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl xl:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent flex items-center gap-3">
                        IA Reply Assistant <MessageSquare className="text-primary h-8 w-8" />
                    </h1>
                    <p className="text-muted-foreground text-base xl:text-lg">
                        Gérez votre communauté avec l'IA - Réponses intelligentes et analyses sentiment.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="h-8 gap-1 border-primary/20 bg-primary/5">
                        <Brain size={12} className="text-primary" /> IA Gemini 1.5 Pro
                    </Badge>
                    <Badge variant="outline" className="h-8 gap-1">
                        <Target size={12} /> Analyse Sentiment
                    </Badge>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-blue-500" />
                            <div>
                                <p className="text-2xl font-bold">{commentStats.total}</p>
                                <p className="text-xs text-muted-foreground">Commentaires</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-500" />
                            <div>
                                <p className="text-2xl font-bold">{commentStats.pending}</p>
                                <p className="text-xs text-muted-foreground">En attente</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <div>
                                <p className="text-2xl font-bold">{commentStats.replied}</p>
                                <p className="text-xs text-muted-foreground">Répondus</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            <div>
                                <p className="text-2xl font-bold">{commentStats.highPriority}</p>
                                <p className="text-xs text-muted-foreground">Priorité haute</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="comments" className="space-y-6">
                <div className="flex items-center justify-between">
                    <TabsList>
                        <TabsTrigger value="comments">Commentaires</TabsTrigger>
                        <TabsTrigger value="templates">Templates</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-4">
                        <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                            <SelectTrigger className="w-40">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes plateformes</SelectItem>
                                <SelectItem value="youtube">YouTube</SelectItem>
                                <SelectItem value="instagram">Instagram</SelectItem>
                                <SelectItem value="tiktok">TikTok</SelectItem>
                                <SelectItem value="twitter">Twitter</SelectItem>
                                <SelectItem value="facebook">Facebook</SelectItem>
                                <SelectItem value="linkedin">LinkedIn</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            variant="outline"
                            onClick={loadData}
                            disabled={isLoading}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                            Actualiser
                        </Button>
                    </div>
                </div>

                <TabsContent value="comments" className="space-y-4">
                    {filteredComments.length === 0 ? (
                        <Card>
                            <CardContent className="py-16 text-center">
                                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Aucun commentaire trouvé</h3>
                                <p className="text-muted-foreground">
                                    Les commentaires de vos publications sociales apparaîtront ici automatiquement.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <ScrollArea className="h-[800px]">
                            <div className="space-y-4 pr-4">
                                {filteredComments
                                    .sort((a, b) => b.priority_score - a.priority_score)
                                    .map((comment) => (
                                        <CommentCard
                                            key={comment.id}
                                            comment={comment}
                                            onReply={handleReply}
                                            isGenerating={generatingFor === comment.id}
                                        />
                                    ))}
                            </div>
                        </ScrollArea>
                    )}
                </TabsContent>

                <TabsContent value="templates">
                    <Card>
                        <CardHeader>
                            <CardTitle>Templates de réponse</CardTitle>
                            <CardDescription>
                                Gérez vos templates de réponse personnalisés
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">
                                    Fonctionnalité templates en développement...
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics">
                    <Card>
                        <CardHeader>
                            <CardTitle>Analytics de performance</CardTitle>
                            <CardDescription>
                                Analysez les performances de vos réponses communautaires
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <p className="text-muted-foreground">
                                    Analytics avancés en développement...
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}