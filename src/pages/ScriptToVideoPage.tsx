import React, { useState } from 'react';
import { FileText, Loader2, Video, Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { createTextToVideo, queryTextToVideo } from '@/services/api';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Scene {
  id: string;
  description: string;
  prompt: string;
  videoUrl?: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  taskId?: string;
}

const ScriptToVideoPage: React.FC = () => {
  const { toast } = useToast();
  const [script, setScript] = useState('');
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [editingScene, setEditingScene] = useState<Scene | null>(null);
  const [editPrompt, setEditPrompt] = useState('');

  const breakdownScript = () => {
    if (!script.trim()) {
      toast({
        title: 'Script Required',
        description: 'Please enter a script to break down into scenes.',
        variant: 'destructive',
      });
      return;
    }

    setIsBreakingDown(true);

    // Simple scene breakdown by paragraphs or sentences
    const lines = script.split('\n').filter((line) => line.trim());
    const newScenes: Scene[] = lines.map((line, index) => ({
      id: `scene-${Date.now()}-${index}`,
      description: line.trim(),
      prompt: `Create a cinematic video scene: ${line.trim()}`,
      status: 'pending',
    }));

    setScenes(newScenes);
    setIsBreakingDown(false);
    toast({
      title: 'Script Breakdown Complete',
      description: `Created ${newScenes.length} scenes from your script.`,
    });
  };

  const pollSceneVideo = async (sceneId: string, taskId: string) => {
    const maxAttempts = 120;
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await queryTextToVideo(taskId);

        if (response.data.task_status === 'succeed') {
          if (response.data.task_result?.videos?.[0]) {
            setScenes((prev) =>
              prev.map((scene) =>
                scene.id === sceneId
                  ? { ...scene, status: 'completed', videoUrl: response.data.task_result!.videos[0].url }
                  : scene
              )
            );
          }
        } else if (response.data.task_status === 'failed') {
          setScenes((prev) =>
            prev.map((scene) => (scene.id === sceneId ? { ...scene, status: 'failed' } : scene))
          );
        } else if (response.data.task_status === 'processing' || response.data.task_status === 'submitted') {
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(poll, 5000);
          } else {
            setScenes((prev) =>
              prev.map((scene) => (scene.id === sceneId ? { ...scene, status: 'failed' } : scene))
            );
          }
        }
      } catch (error) {
        setScenes((prev) =>
          prev.map((scene) => (scene.id === sceneId ? { ...scene, status: 'failed' } : scene))
        );
      }
    };

    poll();
  };

  const generateScene = async (scene: Scene) => {
    setScenes((prev) =>
      prev.map((s) => (s.id === scene.id ? { ...s, status: 'generating' } : s))
    );

    try {
      const response = await createTextToVideo({
        prompt: scene.prompt,
        duration: '5',
        aspect_ratio: '16:9',
        model_name: 'kling-v2-5-turbo',
      });

      setScenes((prev) =>
        prev.map((s) => (s.id === scene.id ? { ...s, taskId: response.data.task_id } : s))
      );

      pollSceneVideo(scene.id, response.data.task_id);
    } catch (error) {
      setScenes((prev) =>
        prev.map((s) => (s.id === scene.id ? { ...s, status: 'failed' } : s))
      );
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate scene',
        variant: 'destructive',
      });
    }
  };

  const generateAllScenes = async () => {
    setIsGeneratingAll(true);
    
    for (const scene of scenes) {
      if (scene.status === 'pending' || scene.status === 'failed') {
        await generateScene(scene);
        // Add delay between requests to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    setIsGeneratingAll(false);
    toast({
      title: 'Generating All Scenes',
      description: 'All scenes are being generated. This may take several minutes.',
    });
  };

  const deleteScene = (sceneId: string) => {
    setScenes((prev) => prev.filter((s) => s.id !== sceneId));
  };

  const addScene = () => {
    const newScene: Scene = {
      id: `scene-${Date.now()}`,
      description: 'New scene description',
      prompt: 'Create a cinematic video scene: New scene description',
      status: 'pending',
    };
    setScenes((prev) => [...prev, newScene]);
  };

  const handleEditScene = (scene: Scene) => {
    setEditingScene(scene);
    setEditPrompt(scene.prompt);
  };

  const saveEditedScene = () => {
    if (editingScene) {
      setScenes((prev) =>
        prev.map((s) =>
          s.id === editingScene.id ? { ...s, prompt: editPrompt, status: 'pending' } : s
        )
      );
      setEditingScene(null);
      toast({
        title: 'Scene Updated',
        description: 'Scene prompt has been updated.',
      });
    }
  };

  const completedScenes = scenes.filter((s) => s.status === 'completed').length;
  const totalScenes = scenes.length;
  const overallProgress = totalScenes > 0 ? (completedScenes / totalScenes) * 100 : 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <FileText className="w-10 h-10 text-primary" />
          Script to Video
        </h1>
        <p className="text-muted-foreground text-lg">
          Transform your scripts into complete videos with automatic scene breakdown
        </p>
      </div>

      <div className="space-y-6">
        {/* Script Input */}
        {scenes.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Enter Your Script</CardTitle>
              <CardDescription>
                Write or paste your script. Each paragraph or line will become a scene.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Enter your script here... Each line or paragraph will be converted into a video scene."
                rows={10}
                className="resize-none"
              />
              <Button
                onClick={breakdownScript}
                disabled={isBreakingDown || !script.trim()}
                className="w-full gradient-primary text-white"
                size="lg"
              >
                {isBreakingDown ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Breaking Down Script...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5 mr-2" />
                    Break Down into Scenes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Scenes List */}
        {scenes.length > 0 && (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Scenes ({completedScenes}/{totalScenes} completed)</CardTitle>
                    <CardDescription>Edit prompts and generate videos for each scene</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={addScene} variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Scene
                    </Button>
                    <Button
                      onClick={generateAllScenes}
                      disabled={isGeneratingAll || scenes.every((s) => s.status === 'completed')}
                      className="gradient-primary text-white"
                      size="sm"
                    >
                      {isGeneratingAll ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Video className="w-4 h-4 mr-2" />
                          Generate All
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {totalScenes > 0 && (
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Overall Progress</span>
                      <span>{Math.round(overallProgress)}%</span>
                    </div>
                    <Progress value={overallProgress} />
                  </div>
                )}
                <div className="space-y-4">
                  {scenes.map((scene, index) => (
                    <Card key={scene.id} className="border-2">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg">Scene {index + 1}</span>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  scene.status === 'completed'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                    : scene.status === 'generating'
                                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                      : scene.status === 'failed'
                                        ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                        : 'bg-muted text-muted-foreground'
                                }`}
                              >
                                {scene.status}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{scene.description}</p>
                            <p className="text-xs bg-muted p-2 rounded">{scene.prompt}</p>
                            {scene.videoUrl && (
                              <video src={scene.videoUrl} controls className="w-full rounded-lg mt-2" />
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() => handleEditScene(scene)}
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Scene Prompt</DialogTitle>
                                  <DialogDescription>
                                    Modify the prompt for this scene
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label>Prompt</Label>
                                    <Textarea
                                      value={editPrompt}
                                      onChange={(e) => setEditPrompt(e.target.value)}
                                      rows={5}
                                    />
                                  </div>
                                  <Button onClick={saveEditedScene} className="w-full">
                                    Save Changes
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => generateScene(scene)}
                              disabled={scene.status === 'generating' || scene.status === 'completed'}
                            >
                              <Video className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="destructive"
                              onClick={() => deleteScene(scene.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={() => setScenes([])}
              variant="outline"
              className="w-full"
            >
              Start New Script
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ScriptToVideoPage;
