import { supabase } from '@/db/supabase';

export type SocialPlatform = 'youtube' | 'instagram' | 'tiktok' | 'facebook' | 'twitter' | 'linkedin';

export interface OAuthConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    scopes: string[];
    authUrl: string;
    tokenUrl: string;
}

export interface PlatformCredential {
    id: string;
    user_id: string;
    platform: SocialPlatform;
    account_name: string;
    account_id: string;
    access_token: string;
    refresh_token?: string;
    token_expires_at?: string;
    scopes: string[];
    metadata: Record<string, any>;
    is_active: boolean;
}

// Platform-specific OAuth configurations
const PLATFORM_CONFIGS: Record<SocialPlatform, OAuthConfig> = {
    youtube: {
        clientId: import.meta.env.VITE_YOUTUBE_CLIENT_ID || '',
        clientSecret: import.meta.env.VITE_YOUTUBE_CLIENT_SECRET || '',
        redirectUri: `${window.location.origin}/api/auth/youtube/callback`,
        scopes: ['https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtube.readonly'],
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
    },
    instagram: {
        clientId: import.meta.env.VITE_INSTAGRAM_CLIENT_ID || '',
        clientSecret: import.meta.env.VITE_INSTAGRAM_CLIENT_SECRET || '',
        redirectUri: `${window.location.origin}/api/auth/instagram/callback`,
        scopes: ['user_profile', 'user_media'],
        authUrl: 'https://api.instagram.com/oauth/authorize',
        tokenUrl: 'https://api.instagram.com/oauth/access_token',
    },
    tiktok: {
        clientId: import.meta.env.VITE_TIKTOK_CLIENT_ID || '',
        clientSecret: import.meta.env.VITE_TIKTOK_CLIENT_SECRET || '',
        redirectUri: `${window.location.origin}/api/auth/tiktok/callback`,
        scopes: ['user.info.basic', 'video.upload'],
        authUrl: 'https://www.tiktok.com/auth/authorize/',
        tokenUrl: 'https://open-api.tiktok.com/oauth/access_token/',
    },
    facebook: {
        clientId: import.meta.env.VITE_FACEBOOK_CLIENT_ID || '',
        clientSecret: import.meta.env.VITE_FACEBOOK_CLIENT_SECRET || '',
        redirectUri: `${window.location.origin}/api/auth/facebook/callback`,
        scopes: ['pages_manage_posts', 'pages_read_engagement', 'publish_video'],
        authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
        tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    },
    twitter: {
        clientId: import.meta.env.VITE_TWITTER_CLIENT_ID || '',
        clientSecret: import.meta.env.VITE_TWITTER_CLIENT_SECRET || '',
        redirectUri: `${window.location.origin}/api/auth/twitter/callback`,
        scopes: ['tweet.write', 'users.read', 'media.upload'],
        authUrl: 'https://twitter.com/i/oauth2/authorize',
        tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    },
    linkedin: {
        clientId: import.meta.env.VITE_LINKEDIN_CLIENT_ID || '',
        clientSecret: import.meta.env.VITE_LINKEDIN_CLIENT_SECRET || '',
        redirectUri: `${window.location.origin}/api/auth/linkedin/callback`,
        scopes: ['w_member_social', 'rw_organization_admin'],
        authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
        tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
    },
};

export class SocialAuthService {
    private static instance: SocialAuthService;

    private constructor() { }

    static getInstance(): SocialAuthService {
        if (!SocialAuthService.instance) {
            SocialAuthService.instance = new SocialAuthService();
        }
        return SocialAuthService.instance;
    }

    /**
     * Generate OAuth authorization URL for a platform
     */
    generateAuthUrl(platform: SocialPlatform, state?: string): string {
        const config = PLATFORM_CONFIGS[platform];
        if (!config.clientId) {
            throw new Error(`OAuth client ID not configured for ${platform}`);
        }

        const params = new URLSearchParams({
            client_id: config.clientId,
            redirect_uri: config.redirectUri,
            response_type: 'code',
            scope: config.scopes.join(' '),
            state: state || this.generateState(),
        });

        // Add platform-specific parameters
        switch (platform) {
            case 'facebook':
                params.append('display', 'popup');
                break;
            case 'twitter':
                params.append('code_challenge_method', 'S256');
                params.append('code_challenge', this.generateCodeChallenge());
                break;
        }

        return `${config.authUrl}?${params.toString()}`;
    }

    /**
     * Exchange authorization code for access token
     */
    async exchangeCodeForToken(platform: SocialPlatform, code: string, codeVerifier?: string): Promise<any> {
        const config = PLATFORM_CONFIGS[platform];

        const params = new URLSearchParams({
            client_id: config.clientId,
            client_secret: config.clientSecret,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: config.redirectUri,
        });

        if (codeVerifier) {
            params.append('code_verifier', codeVerifier);
        }

        const response = await fetch(config.tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        });

        if (!response.ok) {
            throw new Error(`Failed to exchange code for token: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Refresh access token
     */
    async refreshToken(platform: SocialPlatform, refreshToken: string): Promise<any> {
        const config = PLATFORM_CONFIGS[platform];

        const params = new URLSearchParams({
            client_id: config.clientId,
            client_secret: config.clientSecret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
        });

        const response = await fetch(config.tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        });

        if (!response.ok) {
            throw new Error(`Failed to refresh token: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Store platform credentials in database
     */
    async storeCredentials(credential: Omit<PlatformCredential, 'id'>): Promise<PlatformCredential> {
        const { data, error } = await supabase
            .from('platform_credentials')
            .insert({
                user_id: credential.user_id,
                platform: credential.platform,
                account_name: credential.account_name,
                account_id: credential.account_id,
                access_token: credential.access_token,
                refresh_token: credential.refresh_token,
                token_expires_at: credential.token_expires_at,
                scopes: credential.scopes,
                metadata: credential.metadata,
                is_active: true,
            })
            .select()
            .single();

        if (error) {
            throw new Error(`Failed to store credentials: ${error.message}`);
        }

        return data;
    }

    /**
     * Get user's platform credentials
     */
    async getCredentials(userId: string, platform?: SocialPlatform): Promise<PlatformCredential[]> {
        let query = supabase
            .from('platform_credentials')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true);

        if (platform) {
            query = query.eq('platform', platform);
        }

        const { data, error } = await query;

        if (error) {
            throw new Error(`Failed to get credentials: ${error.message}`);
        }

        return data || [];
    }

    /**
     * Remove platform credentials
     */
    async removeCredentials(userId: string, platform: SocialPlatform, accountId: string): Promise<void> {
        const { error } = await supabase
            .from('platform_credentials')
            .delete()
            .eq('user_id', userId)
            .eq('platform', platform)
            .eq('account_id', accountId);

        if (error) {
            throw new Error(`Failed to remove credentials: ${error.message}`);
        }
    }

    /**
     * Check if token is expired and refresh if needed
     */
    async ensureValidToken(credential: PlatformCredential): Promise<PlatformCredential> {
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
            console.warn(`Token expired for ${credential.platform} account ${credential.account_name} and no refresh token available`);
            throw new Error(`Token expired for ${credential.platform}. Please reconnect your account.`);
        }

        try {
            console.log(`Refreshing token for ${credential.platform} account ${credential.account_name}`);
            const tokenData = await this.refreshToken(credential.platform, credential.refresh_token);

            const updatedCredential = {
                ...credential,
                access_token: tokenData.access_token,
                refresh_token: tokenData.refresh_token || credential.refresh_token,
                token_expires_at: tokenData.expires_in
                    ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
                    : undefined,
            };

            // Update in database
            const { error: updateError } = await supabase
                .from('platform_credentials')
                .update({
                    access_token: updatedCredential.access_token,
                    refresh_token: updatedCredential.refresh_token,
                    token_expires_at: updatedCredential.token_expires_at,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', credential.id);

            if (updateError) {
                console.error('Failed to update token in database:', updateError);
                throw new Error('Failed to save refreshed token');
            }

            console.log(`Token refreshed successfully for ${credential.platform} account ${credential.account_name}`);
            return updatedCredential;
        } catch (error) {
            console.error(`Token refresh failed for ${credential.platform} account ${credential.account_name}:`, error);

            // Mark credential as inactive if refresh fails
            await supabase
                .from('platform_credentials')
                .update({
                    is_active: false,
                    updated_at: new Date().toISOString()
                })
                .eq('id', credential.id);

            throw new Error(`Failed to refresh ${credential.platform} token. Please reconnect your account.`);
        }
    }

    private generateState(): string {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    private generateCodeChallenge(): string {
        // Simple implementation - in production, use proper PKCE
        const codeVerifier = this.generateState();
        // In a real implementation, you'd hash this with SHA256 and base64url encode
        return btoa(codeVerifier).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    }

    /**
     * Validate that credential has required scopes for publishing
     */
    validateScopesForPublishing(platform: SocialPlatform, scopes: string[]): boolean {
        const config = PLATFORM_CONFIGS[platform];
        if (!config) return false;

        const requiredScopes = config.scopes;
        return requiredScopes.every(requiredScope =>
            scopes.some(userScope => userScope.includes(requiredScope.split('/')[0]))
        );
    }

    /**
     * Get required scopes for a platform
     */
    getRequiredScopes(platform: SocialPlatform): string[] {
        const config = PLATFORM_CONFIGS[platform];
        return config ? config.scopes : [];
    }
}

export const socialAuth = SocialAuthService.getInstance();