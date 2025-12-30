import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Eye, Heart, Share2, MessageCircle, Video, Image as ImageIcon, FileText, Youtube, Instagram, Facebook, Twitter, Linkedin, Calendar } from 'lucide-react';

interface ContentPerformance {
  id: string;
  title: string;
  type: 'video' | 'image' | 'text';
  platform: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  engagement_rate: number;
  published_date: string;
}

// Mock performance data for demonstration
const mockPerformanceData: ContentPerformance[] = [
  {
    id: '1',
    title: 'AI Video Tutorial - Getting Started',
    type: 'video',
    platform: 'youtube',
    views: 125000,
    likes: 8500,
    shares: 2100,
    comments: 450,
    engagement_rate: 8.8,
    published_date: '2025-01-15',
  },
  {
    id: '2',
    title: 'Top 10 AI Tools for Content Creators',
    type: 'image',
    platform: 'instagram',
    views: 89000,
    likes: 12000,
    shares: 3200,
    comments: 890,
    engagement_rate: 18.1,
    published_date: '2025-01-20',
  },
  {
    id: '3',
    title: 'How to Create Viral Content with AI',
    type: 'video',
    platform: 'tiktok',
    views: 450000,
    likes: 45000,
    shares: 8900,
    comments: 2300,
    engagement_rate: 12.5,
    published_date: '2025-01-18',
  },
  {
    id: '4',
    title: 'AI Content Strategy Guide',
    type: 'text',
    platform: 'linkedin',
    views: 34000,
    likes: 2800,
    shares: 890,
    comments: 340,
    engagement_rate: 11.9,
    published_date: '2025-01-22',
  },
  {
    id: '5',
    title: 'Behind the Scenes: AI Video Production',
    type: 'video',
    platform: 'youtube',
    views: 78000,
    likes: 5600,
    shares: 1200,
    comments: 380,
    engagement_rate: 9.2,
    published_date: '2025-01-25',
  },
];

const platformIcons: Record<string, any> = {
  youtube: Youtube,
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  tiktok: Video,
};

const contentTypeIcons: Record<string, any> = {
  video: Video,
  image: ImageIcon,
  text: FileText,
};

const contentTypeLabels: Record<string, string> = {
  video: 'Video',
  image: 'Image',
  text: 'Text',
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

  const filteredData = mockPerformanceData.filter(
    item => selectedPlatform === 'all' || item.platform === selectedPlatform
  );

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  // Calculate aggregate statistics
  const totalViews = filteredData.reduce((sum, item) => sum + item.views, 0);
  const totalLikes = filteredData.reduce((sum, item) => sum + item.likes, 0);
  const totalShares = filteredData.reduce((sum, item) => sum + item.shares, 0);
  const totalComments = filteredData.reduce((sum, item) => sum + item.comments, 0);
  const avgEngagement = filteredData.length > 0
    ? filteredData.reduce((sum, item) => sum + item.engagement_rate, 0) / filteredData.length
    : 0;

  // Get top performing content
  const topContent = [...filteredData].sort((a, b) => b.views - a.views).slice(0, 5);

  // Platform breakdown
  const platformStats = mockPerformanceData.reduce((acc, item) => {
    if (!acc[item.platform]) {
      acc[item.platform] = { views: 0, engagement: 0, count: 0 };
    }
    acc[item.platform].views += item.views;
    acc[item.platform].engagement += item.engagement_rate;
    acc[item.platform].count += 1;
    return acc;
  }, {} as Record<string, { views: number; engagement: number; count: number }>);

  return (
    <div className="container mx-auto p-4 xl:p-8 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl xl:text-4xl font-bold">Content Performance Analytics</h1>
        <p className="text-muted-foreground text-base xl:text-lg">
          Track and analyze your content performance across all platforms
        </p>
      </div>

      {/* Time Range and Platform Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col xl:flex-row gap-4">
            {/* Time Range */}
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium">Time Range</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={timeRange === '7d' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('7d')}
                >
                  Last 7 Days
                </Button>
                <Button
                  variant={timeRange === '30d' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('30d')}
                >
                  Last 30 Days
                </Button>
                <Button
                  variant={timeRange === '90d' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('90d')}
                >
                  Last 90 Days
                </Button>
                <Button
                  variant={timeRange === '1y' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange('1y')}
                >
                  Last Year
                </Button>
              </div>
            </div>

            {/* Platform Filter */}
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium">Platform</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedPlatform === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedPlatform('all')}
                >
                  All Platforms
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
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 xl:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalViews)}</div>
            <p className="text-xs text-muted-foreground">
              Across {filteredData.length} posts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalLikes)}</div>
            <p className="text-xs text-muted-foreground">
              {((totalLikes / totalViews) * 100).toFixed(1)}% like rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Shares</CardTitle>
            <Share2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalShares)}</div>
            <p className="text-xs text-muted-foreground">
              {((totalShares / totalViews) * 100).toFixed(1)}% share rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
            <MessageCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalComments)}</div>
            <p className="text-xs text-muted-foreground">
              {((totalComments / totalViews) * 100).toFixed(1)}% comment rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgEngagement.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Engagement rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Content */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Content</CardTitle>
          <CardDescription>Your best performing posts in the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topContent.map((content, index) => {
              const PlatformIcon = platformIcons[content.platform];
              const TypeIcon = contentTypeIcons[content.type];
              
              return (
                <div
                  key={content.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                    {index + 1}
                  </div>
                  
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                    <TypeIcon className="w-6 h-6 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{content.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="gap-1">
                        <PlatformIcon className="w-3 h-3" />
                        {content.platform}
                      </Badge>
                      <Badge variant="outline">
                        {contentTypeLabels[content.type]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(content.published_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="hidden xl:flex items-center gap-6">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-muted-foreground mb-1">
                        <Eye className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-bold">{formatNumber(content.views)}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-muted-foreground mb-1">
                        <Heart className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-bold">{formatNumber(content.likes)}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-muted-foreground mb-1">
                        <Share2 className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-bold">{formatNumber(content.shares)}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-muted-foreground mb-1">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-bold text-primary">{content.engagement_rate}%</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Platform Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Performance Breakdown</CardTitle>
          <CardDescription>Compare performance across different platforms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 xl:grid-cols-3">
            {Object.entries(platformStats).map(([platform, stats]) => {
              const PlatformIcon = platformIcons[platform];
              const avgEngagement = stats.engagement / stats.count;
              
              return (
                <Card key={platform}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <PlatformIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg capitalize">{platform}</CardTitle>
                        <p className="text-xs text-muted-foreground">{stats.count} posts</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Views</span>
                      <span className="font-bold">{formatNumber(stats.views)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Avg Engagement</span>
                      <span className="font-bold text-primary">{avgEngagement.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Avg Views/Post</span>
                      <span className="font-bold">{formatNumber(Math.round(stats.views / stats.count))}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-accent/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            About Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Track your content performance across all platforms to understand what resonates with your audience.
          </p>
          <p>
            Use these insights to optimize your content strategy and create more engaging posts.
          </p>
          <p className="text-xs italic">
            Note: The data displayed is for demonstration purposes. Connect your social media accounts to see real analytics.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
