import { PlatformCredential } from '../../socialAuth';

export interface TikTokPost {
    title: string;
    description: string;
    videoUrl: string;
    privacyLevel?: 'public' | 'friends' | 'private';
    allowComments?: boolean;
    allowDuet?: boolean;
    allowStitch?: boolean;
}

export interface TikTokPostResult {
    postId: string;
    url: string;
    status: 'published' | 'processing' | 'failed';
    error?: string;
}

export class TikTokAPIClient {
    constructor(private credential: PlatformCredential) { }

    /**
     * Publish a video to TikTok
     */
    async publishVideo(post: TikTokPost): Promise<TikTokPostResult> {
        try {
            // Step 1: Initialize video upload
            const initResponse = await this.initializeUpload(post);

            // Step 2: Upload video chunks
            await this.uploadVideoChunks(initResponse.upload_url, post.videoUrl);

            // Step 3: Complete the upload
            const publishResponse = await this.completeUpload(initResponse.video_id, post);

            return {
                postId: publishResponse.video_id,
                url: `https://www.tiktok.com/@${this.credential.account_name}/video/${publishResponse.video_id}`,
                status: 'published',
            };
        } catch (error) {
            console.error('TikTok upload failed:', error);
            return {
                postId: '',
                url: '',
                status: 'failed',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Initialize video upload
     */
    private async initializeUpload(post: TikTokPost): Promise<any> {
        const response = await fetch('https://open-api.tiktok.com/share/video/upload/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.credential.access_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                video_title: post.title,
                video_description: post.description,
                privacy_level: post.privacyLevel || 'public',
                allow_comments: post.allowComments ?? true,
                allow_duet: post.allowDuet ?? true,
                allow_stitch: post.allowStitch ?? true,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`TikTok upload initialization failed: ${errorData.error?.message || response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Upload video file in chunks
     */
    private async uploadVideoChunks(uploadUrl: string, videoUrl: string): Promise<void> {
        // Fetch video blob
        const videoResponse = await fetch(videoUrl);
        if (!videoResponse.ok) {
            throw new Error(`Failed to fetch video: ${videoResponse.statusText}`);
        }
        const videoBlob = await videoResponse.blob();

        // For simplicity, upload in one chunk (TikTok supports chunked uploads)
        const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${this.credential.access_token}`,
                'Content-Type': 'video/mp4',
                'Content-Length': videoBlob.size.toString(),
            },
            body: videoBlob,
        });

        if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            throw new Error(`Video upload failed: ${errorData.error?.message || uploadResponse.statusText}`);
        }
    }

    /**
     * Complete the upload and publish
     */
    private async completeUpload(videoId: string, post: TikTokPost): Promise<any> {
        const response = await fetch(`https://open-api.tiktok.com/share/video/publish/${videoId}/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.credential.access_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                video_title: post.title,
                video_description: post.description,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Publish failed: ${errorData.error?.message || response.statusText}`);
        }

        return await response.json();
    }

    /**
     * Get user info
     */
    async getUserInfo(): Promise<any> {
        try {
            const response = await fetch('https://open-api.tiktok.com/user/info/', {
                headers: {
                    'Authorization': `Bearer ${this.credential.access_token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`TikTok API error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to get TikTok user info:', error);
            return null;
        }
    }
}