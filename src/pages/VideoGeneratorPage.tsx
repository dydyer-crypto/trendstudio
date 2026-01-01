import React, { useState } from 'react';
import { Video as VideoIcon, Loader2, Download, Play, Sparkles, Film, Settings2, Trash2, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { createTextToVideo, queryTextToVideo, type TextToVideoRequest } from '@/services/api';
import VideoPlayer from '@/components/ui/video';

const STYLE_PRESETS = [
  { name: 'Réaliste', prompt: 'photorealistic, 8k, highly detailed, cinematic lighting' },
  { name: 'Animation', prompt: '3d animation style, pixar style, vibrant colors' },
  { name: 'Cyberpunk', prompt: 'cyberpunk style, neon lights, futuristic city' },
  { name: 'Anime', prompt: 'anime style, studio ghibli inspired, hand-drawn' },
  { name: 'Vintage', prompt: 'vintage film style, 1960s, grain, sepia tones' },
];

const VideoGeneratorPage: React.FC = () => {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [duration, setDuration] = useState<'5' | '10'>('5');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [isYouTubeShorts, setIsYouTubeShorts] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedVideo, setGeneratedVideo] = useState<{ url: string; duration: string } | null>(null);

  // Auto-set aspect ratio for YouTube Shorts
  React.useEffect(() => {
    if (isYouTubeShorts) {
      setAspectRatio('9:16');
      setDuration('5');
    }
  }, [isYouTubeShorts]);

  const pollVideoStatus = async (id: string) => {
    const maxAttempts = 120;
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await queryTextToVideo(id);

        if (response.data.task_status === 'succeed') {
          setProgress(100);
          setIsGenerating(false);
          if (response.data.task_result?.videos?.[0]) {
            setGeneratedVideo(response.data.task_result.videos[0]);
            toast({
              title: 'Vidéo générée avec succès ! 🎉',
              description: 'Votre vidéo IA est prête à être visualisée.',
            });
          }
        } else if (response.data.task_status === 'failed') {
          setIsGenerating(false);
          toast({
            title: 'Échec de la génération vidéo',
            description: response.data.task_status_msg || 'Veuillez réessayer avec un prompt différent.',
            variant: 'destructive',
          });
        } else {
          attempts++;
          const progressPercent = Math.min(95, 10 + (attempts / maxAttempts) * 85);
          setProgress(progressPercent);

          if (attempts < maxAttempts) {
            setTimeout(poll, 5000);
          } else {
            setIsGenerating(false);
            toast({
              title: 'Délai dépassé',
              description: 'La génération prend trop de temps. Vérifiez l\'historique plus tard.',
              variant: 'destructive',
            });
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
        // Continue polling on transient network errors
        setTimeout(poll, 5000);
      }
    };

    poll();
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Prompt requis',
        description: 'Veuillez décrire la vidéo que vous souhaitez créer.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setProgress(5);
    setGeneratedVideo(null);

    try {
      const finalPrompt = selectedStyle
        ? `${prompt.trim()}, ${STYLE_PRESETS.find(s => s.name === selectedStyle)?.prompt}`
        : prompt.trim();

      const request: TextToVideoRequest = {
        prompt: finalPrompt,
        duration,
        aspect_ratio: aspectRatio,
        model_name: 'kling-v2-5-turbo',
      };

      if (negativePrompt.trim()) {
        request.negative_prompt = negativePrompt.trim();
      }

      const response = await createTextToVideo(request);
      pollVideoStatus(response.data.task_id);

      toast({
        title: 'Traitement en cours',
        description: 'Le serveur IA prépare votre vidéo (Kling V2.5 Turbo).',
      });
    } catch (error) {
      setIsGenerating(false);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Démarrage impossible',
        variant: 'destructive',
      });
    }
  };

  const applyPreset = (styleName: string) => {
    setSelectedStyle(styleName === selectedStyle ? null : styleName);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 flex items-center gap-3 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            <VideoIcon className="w-10 h-10 text-primary" />
            AI Video Studio
          </h1>
          <p className="text-muted-foreground text-lg">
            Transformez vos idées en vidéos cinématographiques grâce à la puissance du modèle Kling V2.5.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <History className="w-4 h-4" /> Historique
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Configuration Panel */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-2 border-primary/10 shadow-xl overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-primary/10">
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-primary" />
                <CardTitle>Configuration</CardTitle>
              </div>
              <CardDescription>Personnalisez le rendu de votre vidéo</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* YouTube Shorts Mode */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/10">
                <div className="space-y-0.5">
                  <Label className="text-base font-bold flex items-center gap-2">
                    <Film className="w-4 h-4" /> Mode YouTube Shorts
                  </Label>
                  <p className="text-xs text-muted-foreground italic">Optimisé pour la publication verticale</p>
                </div>
                <Switch checked={isYouTubeShorts} onCheckedChange={setIsYouTubeShorts} />
              </div>

              {/* Prompt Section */}
              <div className="space-y-3">
                <Label htmlFor="prompt" className="flex justify-between">
                  <span>Votre Vision *</span>
                  <span className="text-xs font-normal text-muted-foreground">{prompt.length}/500</span>
                </Label>
                <Textarea
                  id="prompt"
                  placeholder="Un coucher de soleil cinématique sur l'océan avec des vagues majestueuses..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  className="resize-none border-2 focus:ring-primary h-32"
                />
              </div>

              {/* Style Presets */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-500" /> Styles Rapides
                </Label>
                <div className="flex flex-wrap gap-2">
                  {STYLE_PRESETS.map((style) => (
                    <Badge
                      key={style.name}
                      variant={selectedStyle === style.name ? 'default' : 'outline'}
                      className="cursor-pointer py-1.5 px-3 hover:bg-primary/10 transition-colors"
                      onClick={() => applyPreset(style.name)}
                    >
                      {style.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Durée</Label>
                  <Select value={duration} onValueChange={(value) => setDuration(value as '5' | '10')} disabled={isYouTubeShorts}>
                    <SelectTrigger id="duration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 secondes</SelectItem>
                      <SelectItem value="10">10 secondes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aspectRatio">Format</Label>
                  <Select
                    value={aspectRatio}
                    onValueChange={(value) => setAspectRatio(value as '16:9' | '9:16' | '1:1')}
                    disabled={isYouTubeShorts}
                  >
                    <SelectTrigger id="aspectRatio">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="16:9">16:9 (Cinéma)</SelectItem>
                      <SelectItem value="9:16">9:16 (Shorts/TikTok)</SelectItem>
                      <SelectItem value="1:1">1:1 (Carré)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="negativePrompt">Prompt Négatif (facultatif)</Label>
                <Textarea
                  id="negativePrompt"
                  placeholder="Flou, mauvaise qualité, distorsion..."
                  value={negativePrompt}
                  onChange={(e) => setNegativePrompt(e.target.value)}
                  rows={2}
                  className="resize-none"
                />
              </div>
            </CardContent>
            <CardFooter className="bg-primary/5 border-t border-primary/10 py-4">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full text-lg h-12 font-bold shadow-lg transition-all hover:scale-[1.02]"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-3" />
                    Générer la Vidéo
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Preview Panel */}
        <div className="lg:col-span-7">
          <Card className="h-full border-2 bg-slate-950 shadow-2xl overflow-hidden flex flex-col">
            <CardHeader className="border-b border-white/5 bg-slate-900/50">
              <div className="flex justify-between items-center">
                <CardTitle className="text-white"> Studio de Rendu</CardTitle>
                {generatedVideo && (
                  <Badge variant="success" className="bg-green-500/20 text-green-400 border-green-500/30">
                    Terminé
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0 flex flex-col items-center justify-center relative min-h-[400px]">
              {isGenerating ? (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-8 p-12">
                  <div className="relative">
                    <Loader2 className="w-24 h-24 animate-spin text-primary opacity-20" />
                    <VideoIcon className="w-10 h-10 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div className="w-full max-w-md space-y-4">
                    <div className="flex justify-between text-white text-sm font-medium">
                      <span>Rendu IA en cours...</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-white/10" />
                    <p className="text-slate-400 text-xs text-center px-8">
                      Veuillez patienter quelques minutes. Nos processeurs Kling calculent chaque frame de votre vidéo.
                    </p>
                  </div>
                </div>
              ) : generatedVideo ? (
                <div className="w-full h-full p-4 flex flex-col sm:p-8">
                  <div className="rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-black flex-1 flex items-center">
                    <VideoPlayer
                      src={generatedVideo.url}
                      className="w-full h-full"
                      aspectRatio={aspectRatio === '16:9' ? '16:9' : aspectRatio === '9:16' ? '9:16' : '1:1'}
                    />
                  </div>
                  <div className="mt-6 flex flex-wrap gap-4">
                    <Button
                      onClick={() => window.open(generatedVideo.url, '_blank')}
                      className="flex-1 gap-2 bg-white text-slate-950 hover:bg-white/90"
                    >
                      <Download className="w-4 h-4" />
                      Télécharger
                    </Button>
                    <Button
                      variant="outline"
                      className="border-white/10 text-white hover:bg-white/5"
                      onClick={() => setGeneratedVideo(null)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Effacer
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-6 opacity-40 group p-12">
                  <div className="w-32 h-32 rounded-full border-4 border-dashed border-white/20 flex items-center justify-center mx-auto transition-all group-hover:scale-110 group-hover:border-primary/50">
                    <Play className="w-16 h-16 text-white fill-white/10" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-white text-xl font-medium">Prêt pour le tournage</p>
                    <p className="text-slate-400 max-w-xs mx-auto text-sm">
                      Remplissez le prompt à gauche et cliquez sur générer pour voir la magie opérer.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VideoGeneratorPage;
