import React, { useState } from 'react';
import { Video, Loader2, Download, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { createTextToVideo, queryTextToVideo, type TextToVideoRequest } from '@/services/api';

const VideoGeneratorPage: React.FC = () => {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [duration, setDuration] = useState<'5' | '10'>('5');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [isYouTubeShorts, setIsYouTubeShorts] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [generatedVideo, setGeneratedVideo] = useState<{ url: string; duration: string } | null>(null);

  // Auto-set aspect ratio for YouTube Shorts
  React.useEffect(() => {
    if (isYouTubeShorts) {
      setAspectRatio('9:16');
      setDuration('5'); // Shorts are max 60 seconds, but API supports 5 or 10
    }
  }, [isYouTubeShorts]);

  const pollVideoStatus = async (id: string) => {
    const maxAttempts = 120; // 10 minutes max (5 seconds interval)
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
              title: 'Video Generated Successfully! 🎉',
              description: 'Your AI video is ready to download.',
            });
          }
        } else if (response.data.task_status === 'failed') {
          setIsGenerating(false);
          toast({
            title: 'Video Generation Failed',
            description: response.data.task_status_msg || 'Please try again with a different prompt.',
            variant: 'destructive',
          });
        } else if (response.data.task_status === 'processing' || response.data.task_status === 'submitted') {
          attempts++;
          const progressPercent = Math.min(90, (attempts / maxAttempts) * 100);
          setProgress(progressPercent);
          
          if (attempts < maxAttempts) {
            setTimeout(poll, 5000); // Poll every 5 seconds
          } else {
            setIsGenerating(false);
            toast({
              title: 'Generation Timeout',
              description: 'Video generation is taking longer than expected. Please check back later.',
              variant: 'destructive',
            });
          }
        }
      } catch (error) {
        setIsGenerating(false);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to check video status',
          variant: 'destructive',
        });
      }
    };

    poll();
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Prompt Required',
        description: 'Please enter a prompt to generate your video.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setProgress(5);
    setGeneratedVideo(null);

    try {
      const request: TextToVideoRequest = {
        prompt: prompt.trim(),
        duration,
        aspect_ratio: aspectRatio,
        model_name: 'kling-v2-5-turbo',
      };

      if (negativePrompt.trim()) {
        request.negative_prompt = negativePrompt.trim();
      }

      const response = await createTextToVideo(request);
      setTaskId(response.data.task_id);
      setProgress(10);
      
      toast({
        title: 'Video Generation Started',
        description: 'Your video is being generated. This may take up to 10 minutes.',
      });

      // Start polling for status
      pollVideoStatus(response.data.task_id);
    } catch (error) {
      setIsGenerating(false);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to start video generation',
        variant: 'destructive',
      });
    }
  };

  const handleDownload = () => {
    if (generatedVideo) {
      window.open(generatedVideo.url, '_blank');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Video className="w-10 h-10 text-primary" />
          AI Video Generator
        </h1>
        <p className="text-muted-foreground text-lg">
          Generate high-quality AI videos with flexible duration and aspect ratios
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Video Settings</CardTitle>
            <CardDescription>Configure your AI video generation parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* YouTube Shorts Mode */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-accent">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold">YouTube Shorts Mode</Label>
                <p className="text-sm text-muted-foreground">Vertical 9:16 format, up to 60 seconds</p>
              </div>
              <Switch checked={isYouTubeShorts} onCheckedChange={setIsYouTubeShorts} />
            </div>

            {/* Prompt */}
            <div className="space-y-2">
              <Label htmlFor="prompt">Video Prompt *</Label>
              <Textarea
                id="prompt"
                placeholder="Describe the video you want to create... (e.g., A cinematic shot of a sunset over the ocean with waves crashing)"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">{prompt.length} characters</p>
            </div>

            {/* Negative Prompt */}
            <div className="space-y-2">
              <Label htmlFor="negativePrompt">Negative Prompt (Optional)</Label>
              <Textarea
                id="negativePrompt"
                placeholder="What to avoid in the video... (e.g., blurry, low quality, distorted)"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select value={duration} onValueChange={(value) => setDuration(value as '5' | '10')}>
                <SelectTrigger id="duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 seconds</SelectItem>
                  <SelectItem value="10">10 seconds</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <Label htmlFor="aspectRatio">Aspect Ratio</Label>
              <Select 
                value={aspectRatio} 
                onValueChange={(value) => setAspectRatio(value as '16:9' | '9:16' | '1:1')}
                disabled={isYouTubeShorts}
              >
                <SelectTrigger id="aspectRatio">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="16:9">16:9 (YouTube, Landscape)</SelectItem>
                  <SelectItem value="9:16">9:16 (Shorts, Reels, TikTok)</SelectItem>
                  <SelectItem value="1:1">1:1 (Square)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full gradient-primary text-white"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Video...
                </>
              ) : (
                <>
                  <Video className="w-5 h-5 mr-2" />
                  Generate Video
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Preview/Result */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Video</CardTitle>
            <CardDescription>Your AI-generated video will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            {isGenerating && (
              <div className="space-y-4">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                    <div>
                      <p className="font-medium">Generating your video...</p>
                      <p className="text-sm text-muted-foreground">This may take up to 10 minutes</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              </div>
            )}

            {!isGenerating && !generatedVideo && (
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Your generated video will appear here</p>
                </div>
              </div>
            )}

            {generatedVideo && (
              <div className="space-y-4">
                <video
                  src={generatedVideo.url}
                  controls
                  className="w-full rounded-lg"
                  style={{ aspectRatio: aspectRatio.replace(':', '/') }}
                >
                  Your browser does not support the video tag.
                </video>
                <div className="flex gap-2">
                  <Button onClick={handleDownload} className="flex-1 gap-2">
                    <Download className="w-4 h-4" />
                    Download Video
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  Duration: {generatedVideo.duration}s
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VideoGeneratorPage;
