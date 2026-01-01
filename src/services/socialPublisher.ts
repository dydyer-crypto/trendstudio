import { supabase } from '@/db/supabase';
import { socialAuth, type SocialPlatform, type PlatformCredential } from './socialAuth';
import { YouTubeAPIClient } from './social/platforms/youtube';
import { InstagramAPIClient } from './social/platforms/instagram';
import { TikTokAPIClient } from './social/platforms/tiktok';
import { TwitterAPIClient } from './social/platforms/twitter';
import { FacebookAPIClient } from './social/platforms/facebook';
import { LinkedInAPIClient } from './social/platforms/linkedin';

export interface ScheduledPost {
    id: string;
    user_id: string;
    title: string;
    description: string;
    content_type: string;
    platform: SocialPlatform;
    status: string;
    scheduled_date: string;
    content_url?: string;
    thumbnail_url?: string;
    tags?: string[];
}

export interface PublishResult {
    success: boolean;
    postId?: string;
    url?: string;
    error?: string;
}

export class SocialPublisher {
    /**
     * Publish a scheduled post to its target platform
     */
    async publishPost(post: ScheduledPost): Promise<PublishResult> {
        console.log(`[SocialPublisher] Starting publication of post ${post.id} to ${post.platform} for user ${post.user_id}`);

        try {
            // Get user's credentials for the platform
            const credentials = await socialAuth.getCredentials(post.user_id, post.platform);
            console.log(`[SocialPublisher] Found ${credentials.length} credentials for ${post.platform}`);

            if (credentials.length === 0) {
                return {
                    success: false,
                    error: `No ${post.platform} account connected`,
                };
            }

            // Use the first active credential (user might have multiple accounts)
            const credential = credentials[0];
            console.log(`[SocialPublisher] Using credential for account: ${credential.account_name} (${credential.account_id})`);

            // Ensure token is valid
            const validCredential = await socialAuth.ensureValidToken(credential);

            // Validate scopes for publishing
            if (!socialAuth.validateScopesForPublishing(post.platform, validCredential.scopes)) {
                console.error(`[SocialPublisher] Insufficient scopes for ${post.platform}. Required: ${socialAuth.getRequiredScopes(post.platform)}, Has: ${validCredential.scopes}`);
                return {
                    success: false,
                    error: `Permissions insuffisantes pour publier sur ${post.platform}. Veuillez reconnecter votre compte avec les permissions appropriées.`,
                };
            }

            console.log(`[SocialPublisher] Publishing to ${post.platform}...`);
            // Publish based on platform
            const result = await this.publishToPlatform(post, validCredential);
            console.log(`[SocialPublisher] Publication result for ${post.platform}:`, result);

            // Update post status in database
            await this.updatePostStatus(post.id, result);

            return result;
        } catch (error) {
            console.error(`Failed to publish post ${post.id} to ${post.platform}:`, error);

            let userFriendlyError = 'Publication échouée';

            if (error instanceof Error) {
                if (error.message.includes('Token expired')) {
                    userFriendlyError = `Token expiré pour ${post.platform}. Veuillez reconnecter votre compte.`;
                } else if (error.message.includes('No account connected')) {
                    userFriendlyError = `Aucun compte ${post.platform} connecté.`;
                } else if (error.message.includes('not supported')) {
                    userFriendlyError = `Plateforme ${post.platform} non supportée.`;
                } else if (error.message.includes('API error')) {
                    userFriendlyError = `Erreur API ${post.platform}: ${error.message}`;
                } else {
                    userFriendlyError = `Erreur lors de la publication sur ${post.platform}: ${error.message}`;
                }
            }

            const errorResult: PublishResult = {
                success: false,
                error: userFriendlyError,
            };

            // Update post with error
            await this.updatePostStatus(post.id, errorResult);

            return errorResult;
        }
    }

    /**
     * Publish to specific platform
     */
    private async publishToPlatform(post: ScheduledPost, credential: PlatformCredential): Promise<PublishResult> {
        switch (post.platform) {
            case 'youtube':
                return await this.publishToYouTube(post, credential);

            case 'instagram':
                return await this.publishToInstagram(post, credential);

            case 'tiktok':
                return await this.publishToTikTok(post, credential);

            case 'twitter':
                return await this.publishToTwitter(post, credential);

            case 'facebook':
                return await this.publishToFacebook(post, credential);

            case 'linkedin':
                return await this.publishToLinkedIn(post, credential);

            default:
                return {
                    success: false,
                    error: `Platform ${post.platform} not supported`,
                };
        }
    }

    private async publishToYouTube(post: ScheduledPost, credential: PlatformCredential): Promise<PublishResult> {
        const client = new YouTubeAPIClient(credential);

        const result = await client.uploadVideo({
            title: post.title,
            description: post.description || '',
            tags: post.tags,
            contentUrl: post.content_url || '',
            thumbnailUrl: post.thumbnail_url,
            privacy: 'public',
        });

        return {
            success: result.status === 'uploaded',
            postId: result.videoId,
            url: result.url,
            error: result.error,
        };
    }

    private async publishToInstagram(post: ScheduledPost, credential: PlatformCredential): Promise<PublishResult> {
        const client = new InstagramAPIClient(credential);

        const result = await client.publishPost({
            caption: post.description || '',
            imageUrl: post.content_type === 'image' ? post.content_url : undefined,
            videoUrl: post.content_type === 'video' ? post.content_url : undefined,
        });

        return {
            success: result.status === 'published',
            postId: result.postId,
            url: result.url,
            error: result.error,
        };
    }

    private async publishToTikTok(post: ScheduledPost, credential: PlatformCredential): Promise<PublishResult> {
        const client = new TikTokAPIClient(credential);

        const result = await client.publishVideo({
            title: post.title,
            description: post.description || '',
            videoUrl: post.content_url || '',
            privacyLevel: 'public',
        });

        return {
            success: result.status === 'published',
            postId: result.postId,
            url: result.url,
            error: result.error,
        };
    }

    private async publishToTwitter(post: ScheduledPost, credential: PlatformCredential): Promise<PublishResult> {
        const client = new TwitterAPIClient(credential);

        const result = await client.publishTweet({
            text: post.description || post.title,
            imageUrls: post.content_type === 'image' ? [post.content_url || ''] : undefined,
            videoUrl: post.content_type === 'video' ? post.content_url : undefined,
        });

        return {
            success: result.status === 'published',
            postId: result.postId,
            url: result.url,
            error: result.error,
        };
    }

    private async publishToFacebook(post: ScheduledPost, credential: PlatformCredential): Promise<PublishResult> {
        const client = new FacebookAPIClient(credential);

        const result = await client.publishPost({
            message: post.description || post.title,
            imageUrls: post.content_type === 'image' ? [post.content_url || ''] : undefined,
            videoUrl: post.content_type === 'video' ? post.content_url : undefined,
        });

        return {
            success: result.status === 'published',
            postId: result.postId,
            url: result.url,
            error: result.error,
        };
    }

    private async publishToLinkedIn(post: ScheduledPost, credential: PlatformCredential): Promise<PublishResult> {
        const client = new LinkedInAPIClient(credential);

        const result = await client.publishPost({
            text: post.description || post.title,
            title: post.title,
            imageUrl: post.content_type === 'image' ? post.content_url : undefined,
            articleUrl: post.content_type === 'link' ? post.content_url : undefined,
            visibility: 'PUBLIC',
        });

        return {
            success: result.status === 'published',
            postId: result.postId,
            url: result.url,
            error: result.error,
        };
    }

    /**
     * Update post status after publishing attempt
     */
    private async updatePostStatus(postId: string, result: PublishResult): Promise<void> {
        const updateData: any = {
            status: result.success ? 'published' : 'cancelled',
            published_date: result.success ? new Date().toISOString() : undefined,
            platform_post_id: result.postId,
            platform_metadata: {
                url: result.url,
                published_at: new Date().toISOString(),
            },
        };

        if (!result.success) {
            updateData.publishing_error = result.error;
        }

        await supabase
            .from('scheduled_posts')
            .update(updateData)
            .eq('id', postId);
    }

    /**
     * Get posts ready for publishing
     */
    async getPostsDueForPublishing(): Promise<ScheduledPost[]> {
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000); // Allow 5 minute window

        const { data, error } = await supabase
            .from('scheduled_posts')
            .select('*')
            .eq('status', 'scheduled')
            .lte('scheduled_date', now.toISOString())
            .gte('scheduled_date', fiveMinutesAgo.toISOString());

        if (error) {
            console.error('Failed to get posts due for publishing:', error);
            return [];
        }

        return data || [];
    }

    /**
     * Process posts that are due for publishing
     */
    async processDuePosts(): Promise<void> {
        const duePosts = await this.getPostsDueForPublishing();

        for (const post of duePosts) {
            console.log(`Processing post ${post.id} for ${post.platform}`);
            await this.publishPost(post);
        }
    }
}

export const socialPublisher = new SocialPublisher();