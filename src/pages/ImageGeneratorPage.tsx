import React, { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Loader2, Download, Upload, X, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { generateImage, extractImageFromMarkdown, type ImageGenerationRequest } from '@/services/api';
import { uploadImage, fileToBase64, formatFileSize } from '@/utils/imageUpload';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { brandKitService, type BrandKit } from '@/services/brandKitService';

type AspectRatio = '1:1' | '9:16' | '16:9' | '4:5';

const ImageGeneratorPage: React.FC = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<'text' | 'image'>('text');
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [activeBrandKit, setActiveBrandKit] = useState<BrandKit | null>(null);
  const [useBrandKit, setUseBrandKit] = useState(true);

  // Load active brand kit on component mount
  useEffect(() => {
    if (user) {
      loadActiveBrandKit();
    }
  }, [user]);

  const loadActiveBrandKit = async () => {
    try {
      const kit = await brandKitService.getActiveBrandKit(user!.id);
      setActiveBrandKit(kit);
    } catch (error) {
      console.error('Failed to load brand kit:', error);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadImage(file, setUploadProgress);
      setUploadedFile(file);
      setUploadedImageUrl(result.url);

      if (result.compressed) {
        toast({
          title: 'Image Uploaded & Compressed',
          description: `Image was automatically compressed to ${formatFileSize(result.finalSize)} to meet size requirements.`,
        });
      } else {
        toast({
          title: 'Image Uploaded Successfully',
          description: `File size: ${formatFileSize(result.finalSize)}`,
        });
      }
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setUploadedFile(null);
    setUploadedImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Prompt requis',
        description: 'Veuillez entrer un prompt pour générer votre image.',
        variant: 'destructive',
      });
      return;
    }

    if (mode === 'image' && !uploadedFile) {
      toast({
        title: 'Image Required',
        description: 'Please upload an image for image-to-image generation.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      const request: ImageGenerationRequest = {
        contents: [
          {
            parts: [],
          },
        ],
      };

      // Add uploaded image if in image mode
      if (mode === 'image' && uploadedFile) {
        const base64 = await fileToBase64(uploadedFile);
        const mimeType = uploadedFile.type as 'image/png' | 'image/jpeg' | 'image/webp';
        request.contents[0].parts.push({
          inline_data: {
            mime_type: mimeType,
            data: base64,
          },
        });
      }

      // Add prompt with aspect ratio hint and brand kit integration
      let enhancedPrompt = `${prompt.trim()}. Aspect ratio: ${aspectRatio}`;

      // Integrate brand kit if enabled and available
      if (useBrandKit && activeBrandKit) {
        const brandContext = [];

        // Add color palette context
        if (activeBrandKit.primary_color && activeBrandKit.secondary_color && activeBrandKit.accent_color) {
          brandContext.push(`Use color palette: primary ${activeBrandKit.primary_color}, secondary ${activeBrandKit.secondary_color}, accent ${activeBrandKit.accent_color}`);
        }

        // Add brand voice/style context
        if (activeBrandKit.brand_voice?.tone?.length > 0) {
          brandContext.push(`Style: ${activeBrandKit.brand_voice.tone.join(', ')}`);
        }

        // Add brand keywords
        if (activeBrandKit.brand_voice?.keywords?.length > 0) {
          brandContext.push(`Incorporate these brand elements: ${activeBrandKit.brand_voice.keywords.join(', ')}`);
        }

        // Add typography hint if available
        if (activeBrandKit.typography?.primary) {
          brandContext.push(`Typography style: ${activeBrandKit.typography.primary} font family`);
        }

        if (brandContext.length > 0) {
          enhancedPrompt += `. Brand guidelines: ${brandContext.join('. ')}.`;
        }

        // Show brand kit notification
        toast({
          title: '🎨 Charte appliquée !',
          description: `Votre kit "${activeBrandKit.name}" est automatiquement intégré.`,
        });
      }

      request.contents[0].parts.push({
        text: enhancedPrompt,
      });

      const response = await generateImage(request);

      if (response.status === 0 && response.candidates?.[0]?.content?.parts?.[0]?.text) {
        const markdown = response.candidates[0].content.parts[0].text;
        const base64Image = extractImageFromMarkdown(markdown);

        if (base64Image) {
          setGeneratedImage(`data:image/png;base64,${base64Image}`);
          toast({
            title: 'Image générée avec succès ! 🎨',
            description: 'Votre image IA est prête à être téléchargée.',
          });
        } else {
          throw new Error('Failed to extract image from response');
        }
      } else {
        throw new Error(response.msg || 'Image generation failed');
      }
    } catch (error) {
      toast({
        title: 'Échec de la génération',
        description: error instanceof Error ? error.message : 'Échec de la génération de l\'image',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `trendstudio-image-${Date.now()}.png`;
      link.click();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <ImageIcon className="w-10 h-10 text-primary" />
          AI Image Generator
        </h1>
        <p className="text-muted-foreground text-lg">
          Create high-resolution, cinematic images from text or transform existing images
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Image Settings</CardTitle>
            <CardDescription>Configure your AI image generation parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mode Selection */}
            <Tabs value={mode} onValueChange={(value) => setMode(value as 'text' | 'image')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="text">Text to Image</TabsTrigger>
                <TabsTrigger value="image">Image to Image</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Image Upload (Image-to-Image mode) */}
            {mode === 'image' && (
              <div className="space-y-2">
                <Label>Upload Reference Image</Label>
                {!uploadedFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                  >
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm font-medium mb-1">Click to upload image</p>
                    <p className="text-xs text-muted-foreground">
                      JPEG, PNG, GIF, WEBP, AVIF (max 1MB)
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={uploadedImageUrl || ''}
                      alt="Uploaded"
                      className="w-full rounded-lg"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={handleRemoveImage}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {isUploading && (
                  <div className="space-y-2">
                    <Progress value={uploadProgress} />
                    <p className="text-xs text-muted-foreground text-center">
                      Uploading... {Math.round(uploadProgress)}%
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Prompt */}
            <div className="space-y-2">
              <Label htmlFor="prompt">
                {mode === 'text' ? 'Image Prompt *' : 'Transformation Prompt *'}
              </Label>
              <Textarea
                id="prompt"
                placeholder={
                  mode === 'text'
                    ? 'Describe the image you want to create... (e.g., A cute orange kitten sitting in a sunny garden, surrounded by colorful flowers, cartoon style, high definition)'
                    : 'Describe how to transform the image... (e.g., Convert to cartoon style, add vibrant colors)'
                }
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
                className="resize-none"
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground">{prompt.length} / 2000 characters</p>
            </div>

            {/* Brand Kit Integration */}
            {activeBrandKit && (
              <div className="space-y-3 p-4 bg-primary/5 rounded-lg border border-primary/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-primary" />
                    <Label className="font-medium">Intégration Brand Kit</Label>
                    <Badge variant="secondary" className="text-xs">
                      {activeBrandKit.name}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      id="useBrandKit"
                      checked={useBrandKit}
                      onChange={(e) => setUseBrandKit(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="useBrandKit" className="cursor-pointer">
                      Appliquer automatiquement
                    </label>
                  </div>
                </div>

                {useBrandKit && (
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Couleurs: {activeBrandKit.primary_color}, {activeBrandKit.secondary_color}, {activeBrandKit.accent_color}</p>
                    {activeBrandKit.brand_voice?.tone?.length > 0 && (
                      <p>• Ton: {activeBrandKit.brand_voice.tone.join(', ')}</p>
                    )}
                    {activeBrandKit.brand_voice?.keywords?.length > 0 && (
                      <p>• Mots-clés: {activeBrandKit.brand_voice.keywords.join(', ')}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <Label htmlFor="aspectRatio">Aspect Ratio</Label>
              <Select value={aspectRatio} onValueChange={(value) => setAspectRatio(value as AspectRatio)}>
                <SelectTrigger id="aspectRatio">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1:1">1:1 (Square)</SelectItem>
                  <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                  <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                  <SelectItem value="4:5">4:5 (Instagram)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim() || (mode === 'image' && !uploadedFile)}
              className="w-full gradient-primary text-white"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Génération de l'image en cours...
                </>
              ) : (
                <>
                  <ImageIcon className="w-5 h-5 mr-2" />
                  Generate Image
                </>
              )}
            </Button>
            {isGenerating && (
              <p className="text-xs text-muted-foreground text-center">
                Cela peut prendre jusqu'à 5 minutes...
              </p>
            )}
          </CardContent>
        </Card>

        {/* Preview/Result */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Image</CardTitle>
            <CardDescription>Your AI-generated image will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            {isGenerating && (
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                  <div>
                    <p className="font-medium">Generating your image...</p>
                    <p className="text-sm text-muted-foreground">This may take up to 5 minutes</p>
                  </div>
                </div>
              </div>
            )}

            {!isGenerating && !generatedImage && (
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Your generated image will appear here</p>
                </div>
              </div>
            )}

            {generatedImage && (
              <div className="space-y-4">
                <img
                  src={generatedImage}
                  alt="Generated"
                  className="w-full rounded-lg"
                  crossOrigin="anonymous"
                />
                <Button onClick={handleDownload} className="w-full gap-2">
                  <Download className="w-4 h-4" />
                  Download Image
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImageGeneratorPage;
