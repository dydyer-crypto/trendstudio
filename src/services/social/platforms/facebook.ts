import { PlatformCredential } from '../../socialAuth';

export interface FacebookPost {
    message: string;
    imageUrls?: string[];
    videoUrl?: string;
    link?: string;
    privacy?: 'EVERYONE' | 'ALL_FRIENDS' | 'FRIENDS_OF_FRIENDS' | 'SELF';
}

export interface FacebookPostResult {
    postId: string;
    url: string;
    status: 'published' | 'failed';
    error?: string;
}

export class FacebookAPIClient {
    constructor(private credential: PlatformCredential) { }

    /**
     * Publish a post to Facebook
     */
    async publishPost(post: FacebookPost): Promise<FacebookPostResult> {
        try {
            const pageId = await this.getPageId();
            const endpoint = `https://graph.facebook.com/v18.0/${pageId}/feed`;

            const postData: any = {
                message: post.message,
                privacy: { value: post.privacy || 'EVERYONE' },
            };

            // Add link if provided
            if (post.link) {
                postData.link = post.link;
            }

            // Add media if provided
            if (post.imageUrls?.length || post.videoUrl) {
                const mediaIds = await this.uploadMedia(post.imageUrls, post.videoUrl);
                if (mediaIds.length > 0) {
                    postData.attached_media = mediaIds.map(id => ({ media_fbid: id }));
                }
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.credential.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Facebook API error: ${errorData.error?.message || response.statusText}`);
            }

            const result = await response.json();

            return {
                postId: result.id,
                url: `https://www.facebook.com/${result.id.split('_')[0]}/posts/${result.id.split('_')[1]}`,
                status: 'published',
            };
        } catch (error) {
            console.error('Facebook post failed:', error);
            return {
                postId: '',
                url: '',
                status: 'failed',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Get the page ID for posting
     */
    private async getPageId(): Promise<string> {
        // For simplicity, assume the credential has the page ID in metadata
        if (this.credential.metadata?.pageId) {
            return this.credential.metadata.pageId;
        }

        // Otherwise, get the user's pages
        const response = await fetch('https://graph.facebook.com/v18.0/me/accounts', {
            headers: {
                'Authorization': `Bearer ${this.credential.access_token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to get pages: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.data && data.data.length > 0) {
            return data.data[0].id; // Return first page
        }

        throw new Error('No Facebook pages found');
    }

    /**
     * Upload media to Facebook
     */
    private async uploadMedia(imageUrls?: string[], videoUrl?: string): Promise<string[]> {
        const mediaIds: string[] = [];

        // Upload images
        if (imageUrls) {
            for (const imageUrl of imageUrls) {
                try {
                    const mediaId = await this.uploadPhoto(imageUrl);
                    mediaIds.push(mediaId);
                } catch (error) {
                    console.error(`Failed to upload image ${imageUrl}:`, error);
                }
            }
        }

        // Upload video
        if (videoUrl) {
            try {
                const mediaId = await this.uploadVideo(videoUrl);
                mediaIds.push(mediaId);
            } catch (error) {
                console.error(`Failed to upload video ${videoUrl}:`, error);
            }
        }

        return mediaIds;
    }

    /**
     * Upload a photo to Facebook
     */
    private async uploadPhoto(imageUrl: string): Promise<string> {
        const pageId = await this.getPageId();

        // Fetch image blob
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
            throw new Error(`Failed to fetch image: ${imageResponse.statusText}`);
        }
        const imageBlob = await imageResponse.blob();

        // Create FormData for upload
        const formData = new FormData();
        formData.append('source', imageBlob);
        formData.append('published', 'false'); // Upload but don't publish yet

        const response = await fetch(`https://graph.facebook.com/v18.0/${pageId}/photos`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.credential.access_token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Photo upload failed: ${errorData.error?.message || response.statusText}`);
        }

        const result = await response.json();
        return result.id;
    }

    /**
     * Upload a video to Facebook
     */
    private async uploadVideo(videoUrl: string): Promise<string> {
        const pageId = await this.getPageId();

        // Fetch video blob
        const videoResponse = await fetch(videoUrl);
        if (!videoResponse.ok) {
            throw new Error(`Failed to fetch video: ${videoResponse.statusText}`);
        }
        const videoBlob = await videoResponse.blob();

        // Create FormData for upload
        const formData = new FormData();
        formData.append('source', videoBlob);
        formData.append('published', 'false'); // Upload but don't publish yet

        const response = await fetch(`https://graph.facebook.com/v18.0/${pageId}/videos`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.credential.access_token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Video upload failed: ${errorData.error?.message || response.statusText}`);
        }

        const result = await response.json();
        return result.id;
    }

    /**
     * Get user pages
     */
    async getUserPages(): Promise<any[]> {
        try {
            const response = await fetch('https://graph.facebook.com/v18.0/me/accounts', {
                headers: {
                    'Authorization': `Bearer ${this.credential.access_token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Facebook API error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Failed to get Facebook pages:', error);
            return [];
        }
    }
}