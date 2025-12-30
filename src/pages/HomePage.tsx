import React from 'react';
import { Link } from 'react-router-dom';
import { Video, Image as ImageIcon, MessageSquare, FileText, Sparkles, Zap, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const HomePage: React.FC = () => {
  const features = [
    {
      icon: <Video className="w-8 h-8" />,
      title: 'AI Video Generator',
      description: 'Generate stunning AI videos up to 4 minutes long with flexible aspect ratios for any platform.',
      link: '/video-generator',
      gradient: 'from-primary to-secondary',
    },
    {
      icon: <ImageIcon className="w-8 h-8" />,
      title: 'AI Image Generator',
      description: 'Create high-resolution, cinematic images from text or transform existing images with AI.',
      link: '/image-generator',
      gradient: 'from-secondary to-primary',
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: 'AI Chat Assistant',
      description: 'Get help writing scripts, creating viral content ideas, and optimizing your prompts.',
      link: '/chat-assistant',
      gradient: 'from-primary via-secondary to-primary',
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: 'Script to Video',
      description: 'Transform your scripts into complete videos with automatic scene breakdown and generation.',
      link: '/script-to-video',
      gradient: 'from-secondary to-primary',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-background" />
        <div className="relative container mx-auto px-4 py-20 xl:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent text-accent-foreground text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>All-in-One AI Content Creation Studio</span>
            </div>
            
            <h1 className="text-4xl xl:text-6xl font-bold leading-tight">
              Create Viral Content with{' '}
              <span className="gradient-text">AI-Powered Tools</span>
            </h1>
            
            <p className="text-lg xl:text-xl text-muted-foreground max-w-2xl mx-auto">
              Generate, write, animate, and edit AI images and videos in one place. 
              Replace multiple AI tools with one powerful platform designed for content creators.
            </p>
            
            <div className="flex flex-col xl:flex-row items-center justify-center gap-4">
              <Link to="/video-generator">
                <Button size="lg" className="gradient-primary text-white gap-2 shadow-lg hover:shadow-xl transition-all">
                  <Zap className="w-5 h-5" />
                  Start Creating Videos
                </Button>
              </Link>
              <Link to="/image-generator">
                <Button size="lg" variant="outline" className="gap-2">
                  <Wand2 className="w-5 h-5" />
                  Generate Images
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16 xl:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl xl:text-4xl font-bold mb-4">
            Everything You Need to Go Viral
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional AI tools for creating engaging content across all social media platforms
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-2 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Link key={index} to={feature.link}>
              <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer border-2 hover:border-primary/50">
                <CardHeader>
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white mb-4`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-2xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="gap-2 group">
                    Get Started
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-muted/30">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { label: 'Video Duration', value: 'Up to 4 min' },
              { label: 'Image Quality', value: 'High-Res' },
              { label: 'Aspect Ratios', value: 'All Formats' },
              { label: 'AI Models', value: 'Latest Tech' },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl xl:text-4xl font-bold gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 xl:py-32">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl xl:text-5xl font-bold">
            Ready to Create Viral Content?
          </h2>
          <p className="text-lg text-muted-foreground">
            Join content creators using TrendStudio to produce professional AI-generated videos and images
          </p>
          <div className="flex flex-col xl:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/video-generator">
              <Button size="lg" className="gradient-primary text-white gap-2 shadow-lg">
                <Sparkles className="w-5 h-5" />
                Start Creating Now
              </Button>
            </Link>
            <Link to="/chat-assistant">
              <Button size="lg" variant="outline" className="gap-2">
                <MessageSquare className="w-5 h-5" />
                Chat with AI Assistant
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
