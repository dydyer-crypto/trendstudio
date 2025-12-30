import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Video, Image as ImageIcon, Calendar, TrendingUp, MessageSquare, Award, Clock, Play, Check, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/db/supabase';
import { tutorials } from '@/data/tutorials';
import { TutorialOverlay } from '@/components/tutorial/TutorialOverlay';
import type { TutorialProgress, Tutorial } from '@/types';
import { useNavigate } from 'react-router-dom';

const iconMap: Record<string, any> = {
  Video,
  Image: ImageIcon,
  Calendar,
  TrendingUp,
  MessageSquare,
};

export default function TutorialsPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState<Record<string, TutorialProgress>>({});
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, [profile]);

  const loadProgress = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('tutorial_progress')
        .select('*')
        .eq('user_id', profile.id);

      if (error) throw error;

      const progressMap: Record<string, TutorialProgress> = {};
      data?.forEach((p) => {
        progressMap[p.tutorial_id] = p;
      });
      setProgress(progressMap);
    } catch (error) {
      console.error('Erreur lors du chargement de la progression:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTutorial = async (tutorial: Tutorial) => {
    if (!profile) return;

    try {
      const existingProgress = progress[tutorial.id];

      if (!existingProgress) {
        // Create new progress entry
        const { error } = await supabase
          .from('tutorial_progress')
          .insert([{
            user_id: profile.id,
            tutorial_id: tutorial.id,
            status: 'in_progress',
            current_step: 0,
            started_at: new Date().toISOString(),
          }]);

        if (error) throw error;
      } else {
        // Update existing progress
        const { error } = await supabase
          .from('tutorial_progress')
          .update({
            status: 'in_progress',
            current_step: 0,
          })
          .eq('id', existingProgress.id);

        if (error) throw error;
      }

      // Navigate to the appropriate page for the tutorial
      const tutorialRoutes: Record<string, string> = {
        'create-first-video': '/video-generator',
        'generate-first-image': '/image-generator',
        'schedule-content': '/calendar',
        'discover-trends': '/trends',
        'use-chat-assistant': '/chat-assistant',
      };

      const route = tutorialRoutes[tutorial.id];
      if (route) {
        navigate(route);
        // Set active tutorial after navigation
        setTimeout(() => setActiveTutorial(tutorial), 500);
      } else {
        setActiveTutorial(tutorial);
      }
    } catch (error) {
      console.error('Erreur lors du démarrage du tutoriel:', error);
      toast.error('Impossible de démarrer le tutoriel');
    }
  };

  const completeTutorial = async () => {
    if (!profile || !activeTutorial) return;

    try {
      const existingProgress = progress[activeTutorial.id];

      if (existingProgress) {
        const { error } = await supabase
          .from('tutorial_progress')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', existingProgress.id);

        if (error) throw error;
      }

      // Award badge if tutorial has one
      if (activeTutorial.badge) {
        const { error: badgeError } = await supabase
          .from('tutorial_badges')
          .insert([{
            user_id: profile.id,
            badge_id: activeTutorial.badge.id,
            badge_name: activeTutorial.badge.name,
            badge_description: activeTutorial.badge.description,
          }]);

        if (badgeError && badgeError.code !== '23505') { // Ignore duplicate key error
          console.error('Erreur lors de l\'attribution du badge:', badgeError);
        }
      }

      setActiveTutorial(null);
      loadProgress();
    } catch (error) {
      console.error('Erreur lors de la complétion du tutoriel:', error);
    }
  };

  const skipTutorial = async () => {
    if (!profile || !activeTutorial) return;

    try {
      const existingProgress = progress[activeTutorial.id];

      if (existingProgress) {
        const { error } = await supabase
          .from('tutorial_progress')
          .update({ status: 'skipped' })
          .eq('id', existingProgress.id);

        if (error) throw error;
      }

      setActiveTutorial(null);
      loadProgress();
    } catch (error) {
      console.error('Erreur lors de l\'ignorance du tutoriel:', error);
    }
  };

  const resetTutorial = async (tutorialId: string) => {
    if (!profile) return;

    try {
      const existingProgress = progress[tutorialId];

      if (existingProgress) {
        const { error } = await supabase
          .from('tutorial_progress')
          .update({
            status: 'not_started',
            current_step: 0,
            completed_steps: [],
            started_at: null,
            completed_at: null,
          })
          .eq('id', existingProgress.id);

        if (error) throw error;
        toast.success('Tutoriel réinitialisé');
        loadProgress();
      }
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      toast.error('Impossible de réinitialiser le tutoriel');
    }
  };

  const getTutorialStatus = (tutorialId: string) => {
    const p = progress[tutorialId];
    if (!p) return 'not_started';
    return p.status;
  };

  const completedCount = Object.values(progress).filter(p => p.status === 'completed').length;
  const totalProgress = tutorials.length > 0 ? (completedCount / tutorials.length) * 100 : 0;

  return (
    <div className="container mx-auto p-4 xl:p-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl xl:text-4xl font-bold">Tutoriels interactifs</h1>
        <p className="text-muted-foreground text-base xl:text-lg">
          Apprenez à maîtriser TrendStudio avec nos guides pas à pas
        </p>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Votre progression</CardTitle>
              <CardDescription>
                {completedCount} sur {tutorials.length} tutoriels terminés
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold">{completedCount}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={totalProgress} className="h-2" />
        </CardContent>
      </Card>

      {/* Tutorials Grid */}
      <div className="grid gap-4 xl:grid-cols-2">
        {tutorials.map((tutorial) => {
          const Icon = iconMap[tutorial.icon] || Video;
          const status = getTutorialStatus(tutorial.id);
          const isCompleted = status === 'completed';
          const isInProgress = status === 'in_progress';

          return (
            <Card key={tutorial.id} className={`${isCompleted ? 'border-primary/50' : ''}`}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    isCompleted ? 'bg-primary text-white' : 'bg-gradient-to-br from-primary to-secondary text-white'
                  }`}>
                    {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-xl">{tutorial.title}</CardTitle>
                      {isCompleted && (
                        <Badge variant="default" className="gap-1">
                          <Check className="w-3 h-3" />
                          Terminé
                        </Badge>
                      )}
                      {isInProgress && (
                        <Badge variant="secondary">En cours</Badge>
                      )}
                    </div>
                    <CardDescription>{tutorial.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{tutorial.estimatedTime} min</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {tutorial.category}
                  </Badge>
                  <span>{tutorial.steps.length} étapes</span>
                </div>

                {tutorial.badge && (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-accent/50">
                    <Award className="w-4 h-4 text-primary" />
                    <span className="text-sm">Badge : {tutorial.badge.name}</span>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {isCompleted ? (
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => resetTutorial(tutorial.id)}
                    >
                      <RotateCcw className="w-4 h-4" />
                      Recommencer
                    </Button>
                  ) : (
                    <Button
                      className="flex-1 gap-2"
                      onClick={() => startTutorial(tutorial)}
                    >
                      <Play className="w-4 h-4" />
                      {isInProgress ? 'Continuer' : 'Commencer'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info Card */}
      <Card className="bg-accent/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            À propos des tutoriels
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Nos tutoriels interactifs vous guident pas à pas dans la découverte de TrendStudio.
          </p>
          <p>
            Complétez les tutoriels pour débloquer des badges et maîtriser toutes les fonctionnalités.
          </p>
          <p>
            Vous pouvez ignorer un tutoriel et y revenir plus tard à tout moment.
          </p>
        </CardContent>
      </Card>

      {/* Tutorial Overlay */}
      {activeTutorial && (
        <TutorialOverlay
          tutorial={activeTutorial}
          onComplete={completeTutorial}
          onSkip={skipTutorial}
          onClose={() => setActiveTutorial(null)}
        />
      )}
    </div>
  );
}
