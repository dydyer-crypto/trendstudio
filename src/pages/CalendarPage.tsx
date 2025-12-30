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
          <h1 className="text-3xl xl:text-4xl font-bold">Calendrier de publication</h1>
          <p className="text-muted-foreground text-base xl:text-lg">
            Planifiez et gérez vos publications sur les réseaux sociaux
          </p>
        </div>
        <Button onClick={() => openCreateDialog()} className="gap-2">
          <Plus className="w-4 h-4" />
          Nouvelle publication
        </Button>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={handleToday}>
                Aujourd'hui
              </Button>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <CardTitle className="text-xl xl:text-2xl">
              {format(currentDate, 'MMMM yyyy', { locale: fr })}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
              <div key={day} className="text-center font-medium text-sm text-muted-foreground p-2">
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
                  className={`min-h-24 xl:min-h-32 p-2 border rounded-lg ${
                    isCurrentMonth ? 'bg-card' : 'bg-muted/30'
                  } ${isToday ? 'border-primary border-2' : 'border-border'} cursor-pointer hover:bg-accent/50 transition-colors`}
                  onClick={() => openCreateDialog(day)}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : ''}`}>
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {dayPosts.slice(0, 3).map((post) => {
                      const PlatformIcon = platformIcons[post.platform];
                      return (
                        <div
                          key={post.id}
                          className="text-xs p-1 rounded bg-primary/10 hover:bg-primary/20 truncate cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditDialog(post);
                          }}
                        >
                          <div className="flex items-center gap-1">
                            <PlatformIcon className="w-3 h-3 shrink-0" />
                            <span className="truncate">{post.title}</span>
                          </div>
                        </div>
                      );
                    })}
                    {dayPosts.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayPosts.length - 3} plus
                      </div>
                    )}
                  </div>
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de la publication"
                rows={3}
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
