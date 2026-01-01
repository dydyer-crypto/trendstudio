import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Video, Image as ImageIcon, FileText, Youtube, Instagram, Facebook, Twitter, Linkedin } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/db/supabase';
import type { ScheduledPost, SocialPlatform, PostStatus, ContentType } from '@/types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { aiConsultant } from '@/services/aiConsultant';
import { Wand2, BrainCircuit, BarChart3, Clock, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SocialAnalytics } from '@/components/analytics/SocialAnalytics';
import { Lightbulb, CopyPlus, Rocket, RefreshCcw, Trophy, Zap } from 'lucide-react';
import { addDays, startOfToday } from 'date-fns';

const platformIcons: Record<SocialPlatform, any> = {
  youtube: Youtube,
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  tiktok: Video,
  other: FileText,
};

const platformColors: Record<SocialPlatform, string> = {
  youtube: 'bg-red-500',
  instagram: 'bg-pink-500',
  facebook: 'bg-blue-600',
  twitter: 'bg-sky-500',
  linkedin: 'bg-blue-700',
  tiktok: 'bg-black',
  other: 'bg-gray-500',
};

const statusColors: Record<PostStatus, string> = {
  draft: 'bg-gray-500',
  scheduled: 'bg-blue-500',
  published: 'bg-green-500',
  cancelled: 'bg-red-500',
};

const statusLabels: Record<PostStatus, string> = {
  draft: 'Brouillon',
  scheduled: 'Planifié',
  published: 'Publié',
  cancelled: 'Annulé',
};

export default function CalendarPage() {
  const { profile } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingPost, setEditingPost] = useState<ScheduledPost | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content_type: 'video' as ContentType,
    platform: 'youtube' as SocialPlatform,
    status: 'scheduled' as PostStatus,
    scheduled_date: '',
    scheduled_time: '12:00',
    notes: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isAutoPiloting, setIsAutoPiloting] = useState(false);
  const [socialStrategy, setSocialStrategy] = useState<any>(null);

  useEffect(() => {
    loadPosts();
  }, [profile, currentDate]);

  const loadPosts = async () => {
    if (!profile) return;

    try {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);

      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', profile.id)
        .gte('scheduled_date', monthStart.toISOString())
        .lte('scheduled_date', monthEnd.toISOString())
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des publications:', error);
      toast.error('Impossible de charger les publications');
    } finally {
      setLoading(false);
    }
  };

  const loadLatestStrategy = async () => {
    if (!profile) return;
    try {
      const { data } = await supabase
        .from('social_media_analyses')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        setSocialStrategy(data[0].results);
      }
    } catch (e) {
      console.error('Failed to load strategy');
    }
  };

  useEffect(() => {
    loadLatestStrategy();
  }, [profile]);

  const handleAIGenerate = async () => {
    if (!formData.title || !formData.platform) {
      toast.error("Donnez au moins un titre et une plateforme");
      return;
    }

    setIsGenerating(true);
    try {
      const content = await aiConsultant.generateAIOContent({
        type: `Post ${formData.platform}`,
        topic: formData.title,
        tone: socialStrategy?.strategy?.tone_of_voice || 'Viral & Engageant'
      });
      setFormData(prev => ({ ...prev, description: content }));
      toast.success("Contenu généré par l'IA ! ✨");
    } catch (error) {
      toast.error("Erreur de génération AI");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const openCreateDialog = (date?: Date) => {
    setSelectedDate(date || new Date());
    setEditingPost(null);
    setFormData({
      title: '',
      description: '',
      content_type: 'video',
      platform: 'youtube',
      status: 'scheduled',
      scheduled_date: format(date || new Date(), 'yyyy-MM-dd'),
      scheduled_time: '12:00',
      notes: '',
    });
    setDialogOpen(true);
  };

  const openEditDialog = (post: ScheduledPost) => {
    setEditingPost(post);
    const postDate = parseISO(post.scheduled_date);
    setFormData({
      title: post.title,
      description: post.description || '',
      content_type: post.content_type || 'video',
      platform: post.platform,
      status: post.status,
      scheduled_date: format(postDate, 'yyyy-MM-dd'),
      scheduled_time: format(postDate, 'HH:mm'),
      notes: post.notes || '',
    });
    setDialogOpen(true);
  };

  const handleAutoPilot = async () => {
    if (!profile || !socialStrategy) {
      toast.error("Veuillez d'abord générer une stratégie dans l'audit de site");
      return;
    }

    const confirmAction = confirm("Voulez-vous que l'IA ajoute 30 jours de contenu supplémentaire basés sur votre stratégie et vos posts existants ?");
    if (!confirmAction) return;

    setIsAutoPiloting(true);
    const toastId = toast.loading("TrendStudio Auto-Pilot en cours d'activation...");

    try {
      // 1. Get existing post titles to avoid duplicates
      const { data: existingPosts } = await supabase
        .from('scheduled_posts')
        .select('title, scheduled_date')
        .eq('user_id', profile.id);

      const existingTitles = existingPosts?.map(p => p.title) || [];

      // 2. Find the last scheduled date
      let startDate = startOfToday();
      if (existingPosts && existingPosts.length > 0) {
        const lastPostDate = new Date(Math.max(...existingPosts.map(p => new Date(p.scheduled_date).getTime())));
        if (lastPostDate > startDate) {
          startDate = lastPostDate;
        }
      }

      toast.message("Analyse de l'historique et planification de la suite...", { id: toastId });
      const suggestedPosts = await aiConsultant.generateCalendarChunk(socialStrategy, 30, existingTitles);

      toast.message(`Génération de ${suggestedPosts.length} nouvelles publications...`, { id: toastId });

      const postsToInsert = suggestedPosts.map((p: any) => ({
        user_id: profile?.id,
        title: p.title,
        platform: p.platform,
        content_type: p.content_type,
        status: 'scheduled',
        scheduled_date: addDays(startDate, p.day_offset).toISOString(),
        description: `IA Sugérée: ${p.title}. Utilisez la Magie IA pour rédiger le contenu.`
      }));

      const { error } = await supabase.from('scheduled_posts').insert(postsToInsert);
      if (error) throw error;

      toast.success("30 jours de contenu ajoutés au planning ! 🚀", { id: toastId });
      loadPosts();
    } catch (error) {
      console.error(error);
      toast.error("Échec de l'Auto-Pilot", { id: toastId });
    } finally {
      setIsAutoPiloting(false);
    }
  };

  const handleSavePost = async () => {
    if (!profile || !formData.title || !formData.scheduled_date) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }

    try {
      const scheduledDateTime = new Date(`${formData.scheduled_date}T${formData.scheduled_time}`);

      const postData = {
        user_id: profile.id,
        title: formData.title,
        description: formData.description || null,
        content_type: formData.content_type,
        platform: formData.platform,
        status: formData.status,
        scheduled_date: scheduledDateTime.toISOString(),
        notes: formData.notes || null,
      };

      if (editingPost) {
        // Update existing post
        const { error } = await supabase
          .from('scheduled_posts')
          .update(postData)
          .eq('id', editingPost.id);

        if (error) throw error;
        toast.success('Publication mise à jour avec succès');
      } else {
        // Create new post
        const { error } = await supabase
          .from('scheduled_posts')
          .insert([postData]);

        if (error) throw error;
        toast.success('Publication créée avec succès');
      }

      setDialogOpen(false);
      loadPosts();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Échec de la sauvegarde de la publication');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette publication ?')) return;

    try {
      const { error } = await supabase
        .from('scheduled_posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
      toast.success('Publication supprimée');
      loadPosts();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Échec de la suppression');
    }
  };

  // Generate calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getPostsForDay = (day: Date) => {
    return posts.filter(post => isSameDay(parseISO(post.scheduled_date), day));
  };

  return (
    <div className="container mx-auto p-4 xl:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-1">
            <BrainCircuit size={14} /> Intelligence Sociale Active
          </div>
          <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Planificateur Social Pro
          </h1>
          <p className="text-muted-foreground text-sm xl:text-base">
            Gérez vos campagnes et optimisez votre viralité avec l'IA.
          </p>
        </div>
        <div className="flex gap-3">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="gap-2 border-2">
                <BarChart3 className="w-4 h-4" /> Analyse
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[100vw] sm:max-w-[800px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                  <BarChart3 className="text-primary" /> Intelligence Analytique
                </SheetTitle>
                <SheetDescription>
                  Visualisez l'impact et la performance de votre stratégie sociale.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-8 pb-12">
                <SocialAnalytics />
              </div>
            </SheetContent>
          </Sheet>

          <AIContentIdeas strategy={socialStrategy} onCreatePost={(title) => {
            setFormData(prev => ({ ...prev, title }));
            setDialogOpen(true);
          }} />

          <Button
            variant="outline"
            className="gap-2 border-2 border-primary/20 bg-primary/5 text-primary hover:bg-primary/10"
            onClick={handleAutoPilot}
            disabled={isAutoPiloting}
          >
            {isAutoPiloting ? (
              <RefreshCcw className="w-4 h-4 animate-spin" />
            ) : (
              <Rocket className="w-4 h-4" />
            )}
            Auto-Pilot 30j
          </Button>
          <Button onClick={() => openCreateDialog()} className="gap-2 gradient-primary shadow-lg shadow-primary/20 h-11 px-6">
            <Plus className="w-4 h-4" />
            Planifier un contenu
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatSmallCard icon={Clock} label="En attente" value={posts.filter(p => p.status === 'scheduled').length} color="text-blue-500" />
        <StatSmallCard icon={CheckCircle2} label="Publiés ce mois" value={posts.filter(p => p.status === 'published').length} color="text-green-500" />
        <StatSmallCard icon={AlertCircle} label="Brouillons" value={posts.filter(p => p.status === 'draft').length} color="text-amber-500" />
        <Card className="bg-primary/5 border-primary/20 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:scale-110 transition-transform">
            <Sparkles className="w-12 h-12" />
          </div>
          <CardContent className="p-4 flex flex-col justify-center h-full">
            <p className="text-xs font-bold uppercase text-primary/70 mb-1">Potentiel Viral</p>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold">85%</span>
              <Progress value={85} className="h-1.5 flex-1" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardHeader className="border-b bg-muted/30 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={handlePreviousMonth}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="sm" className="h-8 font-bold" onClick={handleToday}>
                Aujourd'hui
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={handleNextMonth}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
            <CardTitle className="text-xl font-bold font-mono">
              {format(currentDate, 'MMMM yyyy', { locale: fr }).toUpperCase()}
            </CardTitle>
            <Tabs defaultValue="month" className="h-8">
              <TabsList className="h-8">
                <TabsTrigger value="month" className="text-xs h-6">Mois</TabsTrigger>
                <TabsTrigger value="week" className="text-xs h-6">Semaine</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-px bg-border">
            {/* Day headers */}
            {['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI', 'DIMANCHE'].map((day) => (
              <div key={day} className="bg-muted/50 text-center font-bold text-[10px] tracking-widest text-muted-foreground p-3 border-b">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((day) => {
              const dayPosts = getPostsForDay(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={day.toISOString()}
                  className={`min-h-[120px] xl:min-h-[160px] p-2 bg-card relative group transition-all hover:bg-muted/20 ${!isCurrentMonth ? 'opacity-40 grayscale-[0.5]' : ''
                    }`}
                  onClick={() => openCreateDialog(day)}
                >
                  <div className={`text-sm font-bold mb-2 flex justify-between items-center ${isToday ? 'bg-primary text-primary-foreground h-7 w-7 rounded-full flex items-center justify-center' : 'text-muted-foreground'}`}>
                    {format(day, 'd')}
                    {isToday && <span className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                  </div>

                  <div className="space-y-1.5 overflow-hidden">
                    {dayPosts.map((post) => {
                      const PlatformIcon = platformIcons[post.platform];
                      return (
                        <div
                          key={post.id}
                          className={`group/item text-[10px] p-1.5 rounded-md border-l-4 ${platformColors[post.platform]} bg-white dark:bg-zinc-900 shadow-sm border border-border/50 hover:shadow-md transition-all cursor-pointer truncate flex items-center gap-2`}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDialog(post);
                          }}
                        >
                          <PlatformIcon className="w-3 h-3 shrink-0" />
                          <span className="font-semibold truncate flex-1">{post.title}</span>
                          <div className={`w-1.5 h-1.5 rounded-full ${statusColors[post.status]}`} />
                        </div>
                      );
                    })}
                  </div>

                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border-2 border-primary/20 rounded-sm" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? 'Modifier la publication' : 'Nouvelle publication'}
            </DialogTitle>
            <DialogDescription>
              Planifiez votre contenu pour les réseaux sociaux
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Titre de la publication"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="description">Contenu du Post (Caption)</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[10px] gap-1.5 text-primary hover:text-primary hover:bg-primary/10 font-bold"
                  onClick={handleAIGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <><Sparkles className="w-3 h-3 animate-spin" /> Rédaction...</>
                  ) : (
                    <><Wand2 className="w-3 h-3" /> Magie IA</>
                  )}
                </Button>
              </div>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Rédigez votre texte ici ou utilisez la magie IA..."
                rows={6}
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="content_type">Type de contenu</Label>
                <Select
                  value={formData.content_type}
                  onValueChange={(value: ContentType) => setFormData({ ...formData, content_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Vidéo</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="text">Texte</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="platform">Plateforme *</Label>
                <Select
                  value={formData.platform}
                  onValueChange={(value: SocialPlatform) => setFormData({ ...formData, platform: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduled_date">Date *</Label>
                <Input
                  id="scheduled_date"
                  type="date"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduled_time">Heure</Label>
                <Input
                  id="scheduled_time"
                  type="time"
                  value={formData.scheduled_time}
                  onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select
                value={formData.status}
                onValueChange={(value: PostStatus) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="scheduled">Planifié</SelectItem>
                  <SelectItem value="published">Publié</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes internes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notes pour vous-même"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            {editingPost && (
              <Button
                variant="destructive"
                onClick={() => {
                  handleDeletePost(editingPost.id);
                  setDialogOpen(false);
                }}
              >
                Supprimer
              </Button>
            )}
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSavePost}>
              {editingPost ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AIContentIdeas({ strategy, onCreatePost }: { strategy: any, onCreatePost: (title: string) => void }) {
  if (!strategy) return null;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2 border-2 border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800">
          <Lightbulb className="w-4 h-4" /> Idées IA
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BrainCircuit className="text-primary" /> Bibliothèque d'Idées Stratégiques
          </SheetTitle>
          <SheetDescription>
            Utilisez vos piliers de contenu et hooks viraux pour créer des posts.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)] pr-4 mt-6">
          <div className="space-y-8">
            {/* Content Pillars */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" /> Piliers de Contenu
              </h3>
              <div className="grid gap-3">
                {strategy.strategy?.content_pillars?.map((pillar: any, i: number) => (
                  <Card key={i} className="hover:border-primary/50 transition-colors group cursor-pointer" onClick={() => onCreatePost(pillar.title)}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-sm group-hover:text-primary">{pillar.title}</h4>
                        <CopyPlus className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{pillar.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Viral Hooks */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" /> Hooks Viraux (Accroches)
              </h3>
              <div className="grid gap-2">
                {strategy.hooks?.map((hook: string, i: number) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg border bg-muted/30 text-xs font-medium hover:bg-primary/5 hover:border-primary/30 transition-all cursor-pointer flex justify-between items-center group"
                    onClick={() => onCreatePost(hook)}
                  >
                    <span className="flex-1 italic">"{hook}"</span>
                    <Plus className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100" />
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Topics */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-500" /> Sujets suggérés
              </h3>
              <div className="flex flex-wrap gap-2">
                {strategy.strategy?.suggested_topics?.map((topic: string, i: number) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="py-1.5 px-3 cursor-pointer hover:bg-primary hover:text-white transition-colors"
                    onClick={() => onCreatePost(topic)}
                  >
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function StatSmallCard({ icon: Icon, label, value, color }: any) {
  return (
    <Card className="shadow-sm border-none bg-muted/20">
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`p-2 rounded-lg bg-white dark:bg-zinc-900 shadow-sm ${color}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
