import { PlatformCredential } from '../../socialAuth';

export interface YouTubeVideoPost {
    title: string;
    description: string;
    tags?: string[];
    privacy?: 'public' | 'private' | 'unlisted';
    contentUrl: string; // URL to the video file
    thumbnailUrl?: string;
}

export interface YouTubePostResult {
    videoId: string;
    url: string;
    status: 'uploaded' | 'processing' | 'failed';
    error?: string;
}

export class YouTubeAPIClient {
    constructor(private credential: PlatformCredential) { }

    /**
     * Upload a video to YouTube
     */
    async uploadVideo(post: YouTubeVideoPost): Promise<YouTubePostResult> {
        try {
            // Step 1: Get upload URL
            const uploadUrl = await this.getUploadURL(post);

            // Step 2: Upload video file
            const videoId = await this.uploadVideoFile(uploadUrl, post.contentUrl, post);

            return {
                videoId,
                url: `https://www.youtube.com/watch?v=${videoId}`,
                status: 'uploaded',
            };
        } catch (error) {
            console.error('YouTube upload failed:', error);
            return {
                videoId: '',
                url: '',
                status: 'failed',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Get resumable upload URL from YouTube
     */
    private async getUploadURL(post: YouTubeVideoPost): Promise<string> {
        const metadata = {
            snippet: {
                title: post.title,
                description: post.description,
                tags: post.tags || [],
            },
            status: {
                privacyStatus: post.privacy || 'public',
            },
        };

        // Get file info for content-length
        const response = await fetch(post.contentUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch video file: ${response.statusText}`);
        }
        const contentLength = response.headers.get('content-length');

        const uploadResponse = await fetch(
            'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.credential.access_token}`,
                    'Content-Type': 'application/json',
                    'X-Upload-Content-Length': contentLength || '',
                    'X-Upload-Content-Type': 'video/*',
                },
                body: JSON.stringify(metadata),
            }
        );

        if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(`YouTube upload initialization failed: ${errorData.error?.message || uploadResponse.statusText}`);
        }

        return uploadResponse.headers.get('Location') || '';
    }

    /**
     * Upload video file to the resumable upload URL
     */
    private async uploadVideoFile(uploadUrl: string, videoUrl: string, post: YouTubeVideoPost): Promise<string> {
        // Fetch video blob
        const videoResponse = await fetch(videoUrl);
        if (!videoResponse.ok) {
            throw new Error(`Failed to fetch video: ${videoResponse.statusText}`);
        }
        const videoBlob = await videoResponse.blob();

        const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${this.credential.access_token}`,
                'Content-Type': 'video/*',
            },
            body: videoBlob,
        });

        if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(`Video upload failed: ${errorData.error?.message || uploadResponse.statusText}`);
        }

        const result = await uploadResponse.json();
        return result.id;
    }

    /**
     * Update video thumbnail
     */
    async updateThumbnail(videoId: string, thumbnailUrl: string): Promise<void> {
        if (!thumbnailUrl) return;

        // Fetch thumbnail blob
        const thumbnailResponse = await fetch(thumbnailUrl);
        if (!thumbnailResponse.ok) {
            throw new Error(`Failed to fetch thumbnail: ${thumbnailResponse.statusText}`);
        }
        const thumbnailBlob = await thumbnailResponse.blob();

        const response = await fetch(
            `https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${videoId}`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.credential.access_token}`,
                    'Content-Type': thumbnailBlob.type,
                },
                body: thumbnailBlob,
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Thumbnail update failed: ${errorData.error?.message || response.statusText}`);
        }
    }

    /**
     * Get channel info
     */
    async getChannelInfo(): Promise<any> {
        const response = await fetch(
            'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
            {
                headers: {
                    'Authorization': `Bearer ${this.credential.access_token}`,
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to get channel info: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        return data.items?.[0] || null;
    }

    /**
     * Get channel statistics
     */
    async getChannelStats(): Promise<{ followerCount: number; viewCount: number; videoCount: number }> {
        const response = await fetch(
            'https://www.googleapis.com/youtube/v3/channels?part=statistics&mine=true',
            {
                headers: {
                    'Authorization': `Bearer ${this.credential.access_token}`,
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to get channel stats: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const stats = data.items?.[0]?.statistics;

        return {
            followerCount: parseInt(stats?.subscriberCount || '0'),
            viewCount: parseInt(stats?.viewCount || '0'),
            videoCount: parseInt(stats?.videoCount || '0'),
        };
    }

    /**
     * Get statistics for a specific video
     */
    async getVideoStats(videoId: string): Promise<{ views: number; likes: number; comments: number }> {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}`,
            {
                headers: {
                    'Authorization': `Bearer ${this.credential.access_token}`,
                },
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to get video stats: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const stats = data.items?.[0]?.statistics;

        return {
            views: parseInt(stats?.viewCount || '0'),
            likes: parseInt(stats?.likeCount || '0'),
            comments: parseInt(stats?.commentCount || '0'),
        };
    }
}