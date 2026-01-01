import { PlatformCredential } from '../../socialAuth';

export interface TwitterPost {
    text: string;
    imageUrls?: string[];
    videoUrl?: string;
    replyToId?: string;
    quoteTweetId?: string;
}

export interface TwitterPostResult {
    postId: string;
    url: string;
    status: 'published' | 'failed';
    error?: string;
}

export class TwitterAPIClient {
    constructor(private credential: PlatformCredential) { }

    /**
     * Publish a tweet to Twitter
     */
    async publishTweet(post: TwitterPost): Promise<TwitterPostResult> {
        try {
            const tweetData: any = {
                text: post.text,
            };

            // Add media if provided
            if (post.imageUrls?.length || post.videoUrl) {
                const mediaIds = await this.uploadMedia(post.imageUrls, post.videoUrl);
                if (mediaIds.length > 0) {
                    tweetData.media = { media_ids: mediaIds };
                }
            }

            // Add reply settings
            if (post.replyToId) {
                tweetData.reply = { in_reply_to_tweet_id: post.replyToId };
            }

            // Add quote tweet settings
            if (post.quoteTweetId) {
                tweetData.quote_tweet_id = post.quoteTweetId;
            }

            const response = await fetch('https://api.twitter.com/2/tweets', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.credential.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(tweetData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Twitter API error: ${errorData.detail || errorData.errors?.[0]?.message || response.statusText}`);
            }

            const result = await response.json();

            return {
                postId: result.data.id,
                url: `https://twitter.com/i/web/status/${result.data.id}`,
                status: 'published',
            };
        } catch (error) {
            console.error('Twitter post failed:', error);
            return {
                postId: '',
                url: '',
                status: 'failed',
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Upload media to Twitter
     */
    private async uploadMedia(imageUrls?: string[], videoUrl?: string): Promise<string[]> {
        const mediaIds: string[] = [];

        // Upload images
        if (imageUrls) {
            for (const imageUrl of imageUrls.slice(0, 4)) { // Max 4 images per tweet
                try {
                    const mediaId = await this.uploadSingleMedia(imageUrl, 'image');
                    mediaIds.push(mediaId);
                } catch (error) {
                    console.error(`Failed to upload image ${imageUrl}:`, error);
                }
            }
        }

        // Upload video
        if (videoUrl) {
            try {
                const mediaId = await this.uploadSingleMedia(videoUrl, 'video');
                mediaIds.push(mediaId);
            } catch (error) {
                console.error(`Failed to upload video ${videoUrl}:`, error);
            }
        }

        return mediaIds;
    }

    /**
     * Upload single media file
     */
    private async uploadSingleMedia(mediaUrl: string, mediaType: 'image' | 'video'): Promise<string> {
        // Fetch media blob
        const mediaResponse = await fetch(mediaUrl);
        if (!mediaResponse.ok) {
            throw new Error(`Failed to fetch media: ${mediaResponse.statusText}`);
        }
        const mediaBlob = await mediaResponse.blob();

        // Initialize upload
        const initResponse = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
            method: 'POST',
            headers: {
                'Authorization': `OAuth ${this.credential.access_token}`,
            },
            body: new URLSearchParams({
                command: 'INIT',
                total_bytes: mediaBlob.size.toString(),
                media_type: mediaType === 'image' ? 'image/jpeg' : 'video/mp4',
            }),
        });

        if (!initResponse.ok) {
            throw new Error(`Media upload init failed: ${initResponse.statusText}`);
        }

        const initData = await initResponse.json();
        const mediaId = initData.media_id_string;

        // Upload media data
        const uploadResponse = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
            method: 'POST',
            headers: {
                'Authorization': `OAuth ${this.credential.access_token}`,
            },
            body: new URLSearchParams({
                command: 'APPEND',
                media_id: mediaId,
                segment_index: '0',
                media_data: await this.blobToBase64(mediaBlob),
            }),
        });

        if (!uploadResponse.ok) {
            throw new Error(`Media upload append failed: ${uploadResponse.statusText}`);
        }

        // Finalize upload
        const finalizeResponse = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
            method: 'POST',
            headers: {
                'Authorization': `OAuth ${this.credential.access_token}`,
            },
            body: new URLSearchParams({
                command: 'FINALIZE',
                media_id: mediaId,
            }),
        });

        if (!finalizeResponse.ok) {
            throw new Error(`Media upload finalize failed: ${finalizeResponse.statusText}`);
        }

        return mediaId;
    }

    /**
     * Convert blob to base64
     */
    private async blobToBase64(blob: Blob): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                resolve(result.split(',')[1]); // Remove data:image/jpeg;base64, prefix
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * Get user info
     */
    async getUserInfo(): Promise<any> {
        try {
            const response = await fetch('https://api.twitter.com/2/users/me', {
                headers: {
                    'Authorization': `Bearer ${this.credential.access_token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`Twitter API error: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Failed to get Twitter user info:', error);
            return null;
        }
    }
}