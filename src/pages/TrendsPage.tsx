import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp, TrendingDown, Hash, Video, Image as ImageIcon, Search,
  Youtube, Instagram, Facebook, Twitter, Linkedin, Flame, Eye,
  Heart, MessageCircle, Share2, Sparkles, BrainCircuit, Rocket
} from 'lucide-react';
import { aiConsultant, type SocialMediaReport } from '@/services/aiConsultant';
import { toast } from 'sonner';
import { SocialAuditReport } from '@/components/trends/SocialAuditReport';

// ... (mockTrends and other constants remain same)

export default function TrendsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // AI Social Audit States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [socialReport, setSocialReport] = useState<SocialMediaReport | null>(null);

  const handleAISocialAudit = async () => {
    if (!searchQuery.trim()) {
      toast.error("Veuillez entrer une thématique ou un profil à analyser");
      return;
    }

    setIsAnalyzing(true);
    setSocialReport(null);
    toast.info("L'IA Consultant élabore votre stratégie virale...");

    try {
      const result = await aiConsultant.analyzeSocial(searchQuery);
      setSocialReport(result);
      toast.success("Stratégie prête ! 🚀");
    } catch (error) {
      console.error(error);
      toast.error("Échec de l'audit stratégique");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const filteredTrends = mockTrends.filter((trend) => {
    const matchesSearch = trend.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trend.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trend.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPlatform = selectedPlatform === 'all' || trend.platform === selectedPlatform || trend.platform === 'all';
    const matchesCategory = selectedCategory === 'all' || trend.category === selectedCategory;
    return matchesSearch && matchesPlatform && matchesCategory;
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="container mx-auto p-4 xl:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl xl:text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Social Trends & IA
          </h1>
          <p className="text-muted-foreground text-base xl:text-lg">
            Découvrez les tendances et demandez à l'IA d'élaborer une stratégie virale.
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1 border-primary/20 bg-primary/5 text-primary gap-2">
          <BrainCircuit size={14} /> IA Consultant v2.0
        </Badge>
      </div>

      {/* Main Analysis Bar */}
      <Card className="border-2 border-primary/10 shadow-xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-primary/20" />
        <CardContent className="pt-8 pb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Ex: Stratégie AI SaaS 2025, Mode éthique, @votre_profil..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-lg bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-primary/50"
              />
            </div>
            <Button
              onClick={handleAISocialAudit}
              disabled={isAnalyzing || !searchQuery}
              size="lg"
              className="h-14 px-8 gap-3 gradient-primary shadow-lg shadow-primary/20"
            >
              {isAnalyzing ? "Analyse..." : <><Rocket size={20} /> Audit Stratégique IA</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 w-full md:w-auto h-12">
          <TabsTrigger value="trends" className="px-6 h-10">🌍 Tendances Globales</TabsTrigger>
          <TabsTrigger value="audit" className="px-6 h-10 gap-2">
            <Sparkles size={14} className="text-primary" /> Stratégie IA
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-8 animate-in fade-in duration-500">
          {/* Platform & Category Filters (simplified) */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2 p-1 bg-muted/40 rounded-lg">
              {['all', 'youtube', 'instagram', 'tiktok', 'linkedin'].map(p => (
                <Button
                  key={p}
                  variant={selectedPlatform === p ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedPlatform(p)}
                  className="h-8 capitalize"
                >
                  {p === 'all' ? 'Toutes' : p}
                </Button>
              ))}
            </div>
          </div>

          {/* Stats Summary Rows */}
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard title="Volume Total" value={formatNumber(filteredTrends.reduce((sum, t) => sum + t.volume, 0))} icon={Eye} sub="Vues détectées" />
            <StatCard title="Croissance" value={`+${(filteredTrends.reduce((sum, t) => sum + t.growth, 0) / filteredTrends.length || 0).toFixed(0)}%`} icon={TrendingUp} sub="Dernières 24h" color="text-green-500" />
            <StatCard title="Engagement" value={`${(filteredTrends.reduce((sum, t) => sum + t.engagement, 0) / filteredTrends.length || 0).toFixed(1)}%`} icon={Heart} sub="Taux moyen" color="text-red-500" />
            <StatCard title="Tendances" value={filteredTrends.length} icon={Hash} sub="Mots-clés filtrés" />
          </div>

          {/* Trends Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {filteredTrends.map((trend) => (
              <TrendItem key={trend.id} trend={trend} formatNumber={formatNumber} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          {!socialReport ? (
            <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed rounded-3xl bg-muted/10 text-center">
              <div className="bg-primary/10 p-6 rounded-full mb-6">
                <BrainCircuit className="h-12 w-12 text-primary animate-pulse" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Aucun audit en cours</h3>
              <p className="text-muted-foreground max-w-sm mb-8">
                Entrez une thématique ou un profil dans la barre ci-dessus et lancez l'IA pour obtenir une stratégie virale complète.
              </p>
              <Button onClick={handleAISocialAudit} variant="outline" className="gap-2">
                <Rocket size={16} /> Lancer l'analyse test
              </Button>
            </div>
          ) : (
            <SocialAuditReport report={socialReport} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Subcomponents for cleaner code
function StatCard({ title, value, icon: Icon, sub, color }: any) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-primary/5">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <Icon className={`h-4 w-4 ${color || 'text-muted-foreground'}`} />
        </div>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}

function TrendItem({ trend, formatNumber }: any) {
  return (
    <Card className="group hover:shadow-2xl hover:border-primary/20 transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold group-hover:text-primary transition-colors">{trend.title}</span>
              <Badge variant="secondary" className="text-[10px] h-5">{trend.platform}</Badge>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">{trend.description}</p>
          </div>
          <div className="flex items-center gap-1 text-green-500 font-bold text-sm bg-green-500/10 px-2 py-1 rounded-full">
            <TrendingUp size={14} /> +{trend.growth}%
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 items-center">
          <div className="flex-1 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Volume</span>
              <span className="font-medium">{formatNumber(trend.volume)}</span>
            </div>
            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${Math.min(trend.engagement * 5, 100)}%` }} />
            </div>
          </div>
          <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
            <Share2 size={16} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
