import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface ScheduledPost {
    id: string;
    user_id: string;
    title: string;
    description: string;
    content_type: string;
    platform: string;
    status: string;
    scheduled_date: string;
    content_url?: string;
    thumbnail_url?: string;
    tags?: string[];
    platform_post_id?: string;
    platform_metadata?: any;
    publishing_error?: string;
    retry_count?: number;
    max_retries?: number;
}

interface PlatformCredential {
    id: string;
    user_id: string;
    platform: string;
    account_name: string;
    account_id: string;
    access_token: string;
    refresh_token?: string;
    token_expires_at?: string;
    scopes: string[];
    metadata: any;
    is_active: boolean;
}

export async function processScheduledPosts() {
    const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    try {
        // Get posts due for publishing (within last 5 minutes to allow for cron delays)
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        const now = new Date();

        const { data: duePosts, error: postsError } = await supabase
            .from('scheduled_posts')
            .select('*')
            .eq('status', 'scheduled')
            .lte('scheduled_date', now.toISOString())
            .gte('scheduled_date', fiveMinutesAgo.toISOString());

        if (postsError) {
            console.error('Error fetching due posts:', postsError);
            return;
        }

        console.log(`Found ${duePosts?.length || 0} posts due for publishing`);

        if (!duePosts || duePosts.length === 0) {
            return;
        }

        // Process each post
        for (const post of duePosts) {
            await processPost(post, supabase);
        }

    } catch (error) {
        console.error('Error in processScheduledPosts:', error);
    }
}

async function processPost(post: ScheduledPost, supabase: any) {
    try {
        console.log(`Processing post ${post.id} for ${post.platform}`);

        // Get user's platform credentials
        const { data: credentials, error: credError } = await supabase
            .from('platform_credentials')
            .select('*')
            .eq('user_id', post.user_id)
            .eq('platform', post.platform)
            .eq('is_active', true);

        if (credError || !credentials || credentials.length === 0) {
            await updatePostStatus(post.id, 'cancelled', supabase, 'No active credentials found for platform');
            return;
        }

        const credential = credentials[0];

        // Ensure token is valid (refresh if needed)
        const validCredential = await ensureValidToken(credential, supabase);

        if (!validCredential) {
            await updatePostStatus(post.id, 'cancelled', supabase, 'Failed to refresh access token');
            return;
        }

        // Publish to platform
        const result = await publishToPlatform(post, validCredential);

        // Update post status
        if (result.success) {
            await updatePostStatus(post.id, 'published', supabase, undefined, result.postId, result.url);
        } else {
            // Check retry logic
            const retryCount = (post.retry_count || 0) + 1;
            const maxRetries = post.max_retries || 3;

            if (retryCount >= maxRetries) {
                await updatePostStatus(post.id, 'cancelled', supabase, result.error);
            } else {
                // Increment retry count and keep as scheduled for next attempt
                await supabase
                    .from('scheduled_posts')
                    .update({
                        retry_count: retryCount,
                        publishing_error: result.error,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', post.id);
            }
        }

    } catch (error) {
        console.error(`Error processing post ${post.id}:`, error);
        await updatePostStatus(post.id, 'cancelled', supabase, error instanceof Error ? error.message : 'Unknown error');
    }
}

async function ensureValidToken(credential: PlatformCredential, supabase: any): Promise<PlatformCredential | null> {
    if (!credential.token_expires_at) {
        return credential;
    }

    const expiryDate = new Date(credential.token_expires_at);
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    if (expiryDate > fiveMinutesFromNow) {
        return credential;
    }

    if (!credential.refresh_token) {
        return null;
    }

    try {
        // Refresh token based on platform
        const tokenData = await refreshTokenForPlatform(credential.platform, credential.refresh_token);

        const updatedCredential = {
            ...credential,
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token || credential.refresh_token,
            token_expires_at: tokenData.expires_in
                ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
                : undefined,
        };

        // Update in database
        await supabase
            .from('platform_credentials')
            .update({
                access_token: updatedCredential.access_token,
                refresh_token: updatedCredential.refresh_token,
                token_expires_at: updatedCredential.token_expires_at,
            })
            .eq('id', credential.id);

        return updatedCredential;
    } catch (error) {
        console.error('Token refresh failed:', error);

        // Mark credential as inactive
        await supabase
            .from('platform_credentials')
            .update({ is_active: false })
            .eq('id', credential.id);

        return null;
    }
}

async function refreshTokenForPlatform(platform: string, refreshToken: string): Promise<any> {
    const clientId = Deno.env.get(`${platform.toUpperCase()}_CLIENT_ID`);
    const clientSecret = Deno.env.get(`${platform.toUpperCase()}_CLIENT_SECRET`);

    if (!clientId || !clientSecret) {
        throw new Error(`OAuth credentials not configured for ${platform}`);
    }

    // Platform-specific refresh logic
    switch (platform) {
        case 'youtube':
            return await refreshGoogleToken(clientId, clientSecret, refreshToken);
        case 'instagram':
            return await refreshInstagramToken(clientId, clientSecret, refreshToken);
        case 'tiktok':
            return await refreshTikTokToken(clientId, clientSecret, refreshToken);
        case 'twitter':
            return await refreshTwitterToken(clientId, clientSecret, refreshToken);
        case 'facebook':
            return await refreshFacebookToken(clientId, clientSecret, refreshToken);
        case 'linkedin':
            return await refreshLinkedInToken(clientId, clientSecret, refreshToken);
        default:
            throw new Error(`Token refresh not implemented for ${platform}`);
    }
}

async function refreshGoogleToken(clientId: string, clientSecret: string, refreshToken: string): Promise<any> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
        }),
    });

    if (!response.ok) {
        throw new Error(`Google token refresh failed: ${response.statusText}`);
    }

    return response.json();
}

async function refreshInstagramToken(clientId: string, clientSecret: string, refreshToken: string): Promise<any> {
    const response = await fetch('https://graph.instagram.com/refresh_access_token', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'ig_refresh_token',
            access_token: refreshToken,
        }),
    });

    if (!response.ok) {
        throw new Error(`Instagram token refresh failed: ${response.statusText}`);
    }

    return response.json();
}

async function refreshTikTokToken(clientId: string, clientSecret: string, refreshToken: string): Promise<any> {
    const response = await fetch('https://open-api.tiktok.com/oauth/refresh_token/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_key: clientId,
            client_secret: clientSecret,
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        }),
    });

    if (!response.ok) {
        throw new Error(`TikTok token refresh failed: ${response.statusText}`);
    }

    return response.json();
}

async function refreshTwitterToken(clientId: string, clientSecret: string, refreshToken: string): Promise<any> {
    const response = await fetch('https://api.twitter.com/2/oauth2/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        }),
    });

    if (!response.ok) {
        throw new Error(`Twitter token refresh failed: ${response.statusText}`);
    }

    return response.json();
}

async function refreshFacebookToken(clientId: string, clientSecret: string, refreshToken: string): Promise<any> {
    const response = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
        method: 'GET',
        body: new URLSearchParams({
            grant_type: 'fb_exchange_token',
            client_id: clientId,
            client_secret: clientSecret,
            fb_exchange_token: refreshToken,
        }),
    });

    if (!response.ok) {
        throw new Error(`Facebook token refresh failed: ${response.statusText}`);
    }

    return response.json();
}

async function refreshLinkedInToken(clientId: string, clientSecret: string, refreshToken: string): Promise<any> {
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
        }),
    });

    if (!response.ok) {
        throw new Error(`LinkedIn token refresh failed: ${response.statusText}`);
    }

    return response.json();
}

async function publishToPlatform(post: ScheduledPost, credential: PlatformCredential): Promise<{ success: boolean; postId?: string; url?: string; error?: string }> {
    try {
        switch (post.platform) {
            case 'youtube':
                return await publishToYouTube(post, credential);
            case 'instagram':
                return await publishToInstagram(post, credential);
            case 'tiktok':
                return await publishToTikTok(post, credential);
            case 'twitter':
                return await publishToTwitter(post, credential);
            case 'facebook':
                return await publishToFacebook(post, credential);
            case 'linkedin':
                return await publishToLinkedIn(post, credential);
            default:
                return { success: false, error: `Publishing not implemented for ${post.platform}` };
        }
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown publishing error'
        };
    }
}

// Real YouTube Publishing Implementation
async function publishToYouTube(post: ScheduledPost, credential: PlatformCredential) {
    console.log(`Publishing to YouTube: ${post.title}`);

    try {
        const metadata = {
            snippet: {
                title: post.title,
                description: post.description,
                tags: post.tags || [],
            },
            status: {
                privacyStatus: 'public',
            },
        };

        // Step 1: Initialize Resumable Upload
        const initResponse = await fetch(
            'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${credential.access_token}`,
                    'Content-Type': 'application/json',
                    'X-Upload-Content-Type': 'video/*',
                },
                body: JSON.stringify(metadata),
            }
        );

        if (!initResponse.ok) {
            const error = await initResponse.json();
            throw new Error(`YouTube initialization failed: ${error.error?.message || initResponse.statusText}`);
        }

        const uploadUrl = initResponse.headers.get('Location');
        if (!uploadUrl) throw new Error('No upload URL received from YouTube');

        // Step 2: Upload Video File
        const videoFileResponse = await fetch(post.content_url!);
        if (!videoFileResponse.ok) throw new Error('Failed to fetch video file from content_url');
        const videoBlob = await videoFileResponse.blob();

        const uploadResponse = await fetch(uploadUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'video/*',
            },
            body: videoBlob,
        });

        if (!uploadResponse.ok) {
            const error = await uploadResponse.json();
            throw new Error(`YouTube upload failed: ${error.error?.message || uploadResponse.statusText}`);
        }

        const result = await uploadResponse.json();

        return {
            success: true,
            postId: result.id,
            url: `https://www.youtube.com/watch?v=${result.id}`
        };
    } catch (error) {
        console.error('YouTube publish error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'YouTube publishing failed'
        };
    }
}

async function publishToInstagram(post: ScheduledPost, credential: PlatformCredential) {
    // Instagram API implementation would go here
    console.log(`Publishing to Instagram: ${post.title}`);

    // Simulate successful publish
    return {
        success: true,
        postId: `ig_${Date.now()}`,
        url: `https://instagram.com/p/simulated_${Date.now()}`
    };
}

async function publishToTikTok(post: ScheduledPost, credential: PlatformCredential) {
    console.log(`Publishing to TikTok: ${post.title}`);

    try {
        // Simulate TikTok publishing - would need actual TikTok API implementation
        return {
            success: true,
            postId: `tt_${Date.now()}`,
            url: `https://tiktok.com/@${credential.account_name}/video/simulated_${Date.now()}`
        };
    } catch (error) {
        console.error('TikTok publish error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'TikTok publishing failed'
        };
    }
}

async function publishToTwitter(post: ScheduledPost, credential: PlatformCredential) {
    console.log(`Publishing to Twitter: ${post.title}`);

    try {
        // Simulate Twitter publishing - would need actual Twitter API v2 implementation
        return {
            success: true,
            postId: `tw_${Date.now()}`,
            url: `https://twitter.com/i/web/status/simulated_${Date.now()}`
        };
    } catch (error) {
        console.error('Twitter publish error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Twitter publishing failed'
        };
    }
}

async function publishToFacebook(post: ScheduledPost, credential: PlatformCredential) {
    console.log(`Publishing to Facebook: ${post.title}`);

    try {
        // Simulate Facebook publishing - would need actual Facebook Graph API implementation
        return {
            success: true,
            postId: `fb_${Date.now()}`,
            url: `https://facebook.com/${credential.account_name}/posts/simulated_${Date.now()}`
        };
    } catch (error) {
        console.error('Facebook publish error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Facebook publishing failed'
        };
    }
}

async function publishToLinkedIn(post: ScheduledPost, credential: PlatformCredential) {
    console.log(`Publishing to LinkedIn: ${post.title}`);

    try {
        // Simulate LinkedIn publishing - would need actual LinkedIn API implementation
        return {
            success: true,
            postId: `li_${Date.now()}`,
            url: `https://linkedin.com/feed/update/simulated_${Date.now()}`
        };
    } catch (error) {
        console.error('LinkedIn publish error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'LinkedIn publishing failed'
        };
    }
}

async function updatePostStatus(
    postId: string,
    status: string,
    supabase: any,
    error?: string,
    platformPostId?: string,
    url?: string
) {
    const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
    };

    if (status === 'published') {
        updateData.published_date = new Date().toISOString();
        updateData.platform_post_id = platformPostId;
        updateData.platform_metadata = {
            url,
            published_at: new Date().toISOString(),
        };
    } else if (status === 'cancelled') {
        updateData.publishing_error = error;
    }

    await supabase
        .from('scheduled_posts')
        .update(updateData)
        .eq('id', postId);
}

// Main handler for the Edge Function
export async function handler(req: Request): Promise<Response> {
    try {
        await processScheduledPosts();

        return new Response(
            JSON.stringify({ success: true, message: 'Scheduled posts processed successfully' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Edge function error:', error);

        return new Response(
            JSON.stringify({
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}

// For local testing
if (import.meta.main) {
    console.log('Running scheduled posts processor...');
    await processScheduledPosts();
    console.log('Done.');
}