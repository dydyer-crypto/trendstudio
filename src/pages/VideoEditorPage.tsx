import React, { useState } from 'react';
import { Scissors, Upload, Download, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const VideoEditorPage: React.FC = () => {
  const { toast } = useToast();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      toast({
        title: 'Video Loaded',
        description: 'Your video has been loaded into the editor.',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Scissors className="w-10 h-10 text-primary" />
          Video Editor
        </h1>
        <p className="text-muted-foreground text-lg">
          Preview and download your generated videos
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        {/* Video Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Video Preview</CardTitle>
            <CardDescription>Upload or load a generated video to preview</CardDescription>
          </CardHeader>
          <CardContent>
            {!videoUrl ? (
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-4">No video loaded</p>
                  <label htmlFor="video-upload">
                    <Button asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Video
                      </span>
                    </Button>
                  </label>
                  <input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <video src={videoUrl} controls className="w-full rounded-lg">
                  Your browser does not support the video tag.
                </video>
                <div className="flex gap-2">
                  <Button onClick={() => window.open(videoUrl, '_blank')} className="flex-1 gap-2">
                    <Download className="w-4 h-4" />
                    Download Video
                  </Button>
                  <label htmlFor="video-upload-replace" className="flex-1">
                    <Button variant="outline" className="w-full gap-2" asChild>
                      <span>
                        <Upload className="w-4 h-4" />
                        Replace Video
                      </span>
                    </Button>
                  </label>
                  <input
                    id="video-upload-replace"
                    type="file"
                    accept="video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tools Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" disabled={!videoUrl}>
                <Play className="w-4 h-4 mr-2" />
                Play Video
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled={!videoUrl}>
                <Pause className="w-4 h-4 mr-2" />
                Pause Video
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled={!videoUrl}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Video Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {videoUrl ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium">Loaded</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Format:</span>
                    <span className="font-medium">MP4</span>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">No video loaded</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Upload videos from your device</p>
              <p>• Preview before downloading</p>
              <p>• Download in original quality</p>
              <p>• Share directly to social media</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VideoEditorPage;
