import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Hash, Video, Image as ImageIcon, Search, Youtube, Instagram, Facebook, Twitter, Linkedin, Flame, Eye, Heart, MessageCircle, Share2 } from 'lucide-react';

interface Trend {
  id: string;
  title: string;
  category: 'hashtag' | 'topic' | 'video' | 'challenge';
  platform: string;
  volume: number;
  growth: number;
  engagement: number;
  description: string;
  tags: string[];
}

// Mock trending data for demonstration
const mockTrends: Trend[] = [
  {
    id: '1',
    title: '#AIContent',
    category: 'hashtag',
    platform: 'all',
    volume: 2500000,
    growth: 45,
    engagement: 8.5,
    description: 'Contenu généré par IA et créativité numérique',
    tags: ['IA', 'Créativité', 'Tech'],
  },
  {
    id: '2',
    title: 'Tutoriels IA',
    category: 'topic',
    platform: 'youtube',
    volume: 1800000,
    growth: 32,
    engagement: 7.2,
    description: 'Guides et tutoriels sur les outils IA',
    tags: ['Éducation', 'IA', 'Tutoriel'],
  },
  {
    id: '3',
    title: '#ContentCreator',
    category: 'hashtag',
    platform: 'instagram',
    volume: 3200000,
    growth: 28,
    engagement: 9.1,
    description: 'Créateurs de contenu et stratégies marketing',
    tags: ['Marketing', 'Créateur', 'Social'],
  },
  {
    id: '4',
    title: 'Vidéos virales 2025',
    category: 'video',
    platform: 'tiktok',
    volume: 5600000,
    growth: 67,
    engagement: 12.3,
    description: 'Formats vidéo qui deviennent viraux',
    tags: ['Viral', 'Tendance', 'Vidéo'],
  },
  {
    id: '5',
    title: '#DigitalMarketing',
    category: 'hashtag',
    platform: 'linkedin',
    volume: 980000,
    growth: 18,
    engagement: 6.8,
    description: 'Stratégies de marketing digital',
    tags: ['Marketing', 'Business', 'Stratégie'],
  },
  {
    id: '6',
    title: 'Défi créatif IA',
    category: 'challenge',
    platform: 'instagram',
    volume: 1500000,
    growth: 89,
    engagement: 15.7,
    description: 'Défi de création de contenu avec IA',
    tags: ['Défi', 'IA', 'Créativité'],
  },
  {
    id: '7',
    title: '#SocialMediaTips',
    category: 'hashtag',
    platform: 'twitter',
    volume: 750000,
    growth: 22,
    engagement: 5.4,
    description: 'Conseils pour les réseaux sociaux',
    tags: ['Conseils', 'Social', 'Marketing'],
  },
  {
    id: '8',
    title: 'Shorts YouTube',
    category: 'video',
    platform: 'youtube',
    volume: 4200000,
    growth: 54,
    engagement: 10.9,
    description: 'Format court qui cartonne sur YouTube',
    tags: ['Shorts', 'YouTube', 'Vidéo'],
  },
];

const platformIcons: Record<string, any> = {
  youtube: Youtube,
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  tiktok: Video,
  all: TrendingUp,
};

const categoryIcons: Record<string, any> = {
  hashtag: Hash,
  topic: MessageCircle,
  video: Video,
  challenge: Flame,
};

const categoryLabels: Record<string, string> = {
  hashtag: 'Hashtag',
  topic: 'Sujet',
  video: 'Vidéo',
  challenge: 'Défi',
};

export default function TrendsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredTrends = mockTrends.filter((trend) => {
    const matchesSearch = trend.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trend.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trend.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPlatform = selectedPlatform === 'all' || trend.platform === selectedPlatform || trend.platform === 'all';
    const matchesCategory = selectedCategory === 'all' || trend.category === selectedCategory;
    return matchesSearch && matchesPlatform && matchesCategory;
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="container mx-auto p-4 xl:p-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl xl:text-4xl font-bold">Analyse des tendances</h1>
        <p className="text-muted-foreground text-base xl:text-lg">
          Découvrez les tendances en temps réel sur les réseaux sociaux
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher des tendances, hashtags, sujets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Platform Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Plateforme</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedPlatform === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPlatform('all')}
                >
                  Toutes
                </Button>
                <Button
                  variant={selectedPlatform === 'youtube' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPlatform('youtube')}
                  className="gap-2"
                >
                  <Youtube className="w-4 h-4" />
                  YouTube
                </Button>
                <Button
                  variant={selectedPlatform === 'instagram' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPlatform('instagram')}
                  className="gap-2"
                >
                  <Instagram className="w-4 h-4" />
                  Instagram
                </Button>
                <Button
                  variant={selectedPlatform === 'tiktok' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPlatform('tiktok')}
                  className="gap-2"
                >
                  <Video className="w-4 h-4" />
                  TikTok
                </Button>
                <Button
                  variant={selectedPlatform === 'twitter' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPlatform('twitter')}
                  className="gap-2"
                >
                  <Twitter className="w-4 h-4" />
                  Twitter
                </Button>
                <Button
                  variant={selectedPlatform === 'linkedin' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPlatform('linkedin')}
                  className="gap-2"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </Button>
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Catégorie</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                >
                  Toutes
                </Button>
                <Button
                  variant={selectedCategory === 'hashtag' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('hashtag')}
                  className="gap-2"
                >
                  <Hash className="w-4 h-4" />
                  Hashtags
                </Button>
                <Button
                  variant={selectedCategory === 'topic' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('topic')}
                  className="gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Sujets
                </Button>
                <Button
                  variant={selectedCategory === 'video' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('video')}
                  className="gap-2"
                >
                  <Video className="w-4 h-4" />
                  Vidéos
                </Button>
                <Button
                  variant={selectedCategory === 'challenge' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('challenge')}
                  className="gap-2"
                >
                  <Flame className="w-4 h-4" />
                  Défis
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid gap-4 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tendances actives</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredTrends.length}</div>
            <p className="text-xs text-muted-foreground">
              Tendances détectées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volume total</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(filteredTrends.reduce((sum, t) => sum + t.volume, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              Mentions totales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Croissance moyenne</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              +{(filteredTrends.reduce((sum, t) => sum + t.growth, 0) / filteredTrends.length || 0).toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Dernières 24h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement moyen</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(filteredTrends.reduce((sum, t) => sum + t.engagement, 0) / filteredTrends.length || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Taux d'engagement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trends Grid */}
      <div className="grid gap-4 xl:grid-cols-2">
        {filteredTrends.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Aucune tendance trouvée</p>
              <p className="text-sm text-muted-foreground">
                Essayez de modifier vos filtres de recherche
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredTrends.map((trend) => {
            const CategoryIcon = categoryIcons[trend.category];
            const PlatformIcon = platformIcons[trend.platform] || TrendingUp;
            
            return (
              <Card key={trend.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <CategoryIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{trend.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="gap-1">
                            <PlatformIcon className="w-3 h-3" />
                            {trend.platform === 'all' ? 'Toutes' : trend.platform}
                          </Badge>
                          <Badge variant="outline">
                            {categoryLabels[trend.category]}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                      trend.growth > 50 ? 'bg-green-500/10 text-green-500' : 
                      trend.growth > 20 ? 'bg-blue-500/10 text-blue-500' : 
                      'bg-gray-500/10 text-gray-500'
                    }`}>
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-bold">+{trend.growth}%</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {trend.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {trend.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Eye className="w-4 h-4" />
                        <span className="text-xs">Volume</span>
                      </div>
                      <p className="text-lg font-bold">{formatNumber(trend.volume)}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-xs">Croissance</span>
                      </div>
                      <p className="text-lg font-bold text-green-500">+{trend.growth}%</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Heart className="w-4 h-4" />
                        <span className="text-xs">Engagement</span>
                      </div>
                      <p className="text-lg font-bold text-primary">{trend.engagement}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Info Card */}
      <Card className="bg-accent/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            À propos des tendances
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Les données de tendances sont mises à jour en temps réel pour vous aider à créer du contenu viral.
          </p>
          <p>
            Utilisez ces insights pour planifier votre stratégie de contenu et rester à jour avec les dernières tendances.
          </p>
          <p className="text-xs italic">
            Note : Les données affichées sont des exemples de démonstration. Connectez vos comptes de réseaux sociaux pour obtenir des données réelles.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
